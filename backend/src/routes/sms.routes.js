const express = require('express');
const { body, param, query } = require('express-validator');
const { 
  getSmsTemplates, 
  getSmsTemplateById, 
  createSmsTemplate, 
  updateSmsTemplate, 
  deleteSmsTemplate, 
  sendSmsToClient, 
  sendBulkSms, 
  getSmsLogs 
} = require('../controllers/sms.controller');
const { 
  authenticate, 
  isAdmin, 
  isStaff 
} = require('../middleware/auth.middleware');
const { validate, validateUUID } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/sms/templates:
 *   get:
 *     summary: Get all SMS templates
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [reminder, onboarding, notification, statement]
 *     responses:
 *       200:
 *         description: List of SMS templates
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/templates',
  authenticate,
  isStaff,
  [
    query('type').optional().isIn(['reminder', 'onboarding', 'notification', 'statement']).withMessage('Invalid template type'),
    validate
  ],
  getSmsTemplates
);

/**
 * @swagger
 * /api/sms/templates/{id}:
 *   get:
 *     summary: Get SMS template by ID
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SMS template details
 *       404:
 *         description: Template not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/templates/:id',
  authenticate,
  validateUUID,
  isStaff,
  getSmsTemplateById
);

/**
 * @swagger
 * /api/sms/templates:
 *   post:
 *     summary: Create new SMS template
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - template_text
 *               - template_type
 *             properties:
 *               name:
 *                 type: string
 *               template_text:
 *                 type: string
 *               template_type:
 *                 type: string
 *                 enum: [reminder, onboarding, notification, statement]
 *     responses:
 *       201:
 *         description: SMS template created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/templates',
  authenticate,
  isStaff,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('template_text').notEmpty().withMessage('Template text is required'),
    body('template_type').isIn(['reminder', 'onboarding', 'notification', 'statement']).withMessage('Invalid template type'),
    validate
  ],
  createSmsTemplate
);

/**
 * @swagger
 * /api/sms/templates/{id}:
 *   put:
 *     summary: Update SMS template
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               template_text:
 *                 type: string
 *               template_type:
 *                 type: string
 *                 enum: [reminder, onboarding, notification, statement]
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SMS template updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.put(
  '/templates/:id',
  authenticate,
  validateUUID,
  isStaff,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('template_text').optional().notEmpty().withMessage('Template text cannot be empty'),
    body('template_type').optional().isIn(['reminder', 'onboarding', 'notification', 'statement']).withMessage('Invalid template type'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    validate
  ],
  updateSmsTemplate
);

/**
 * @swagger
 * /api/sms/templates/{id}:
 *   delete:
 *     summary: Delete SMS template
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SMS template deleted successfully
 *       404:
 *         description: Template not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.delete(
  '/templates/:id',
  authenticate,
  validateUUID,
  isAdmin,
  deleteSmsTemplate
);

/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     summary: Send SMS to a client
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               phone_number:
 *                 type: string
 *               message:
 *                 type: string
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               variables:
 *                 type: object
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/send',
  authenticate,
  isStaff,
  [
    body().custom((value, { req }) => {
      if (!req.body.client_id && !req.body.phone_number) {
        throw new Error('Either client_id or phone_number is required');
      }
      if (!req.body.message && !req.body.template_id) {
        throw new Error('Either message or template_id is required');
      }
      return true;
    }),
    body('client_id').optional().isUUID().withMessage('Invalid client ID'),
    body('template_id').optional().isUUID().withMessage('Invalid template ID'),
    validate
  ],
  sendSmsToClient
);

/**
 * @swagger
 * /api/sms/bulk:
 *   post:
 *     summary: Send bulk SMS
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template_id
 *             properties:
 *               template_id:
 *                 type: string
 *                 format: uuid
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     phone:
 *                       type: string
 *                     variables:
 *                       type: object
 *               filter:
 *                 type: object
 *                 properties:
 *                   account_type:
 *                     type: string
 *                     enum: [SB, BB, MB]
 *                   loan_status:
 *                     type: string
 *                     enum: [active, pending, closed, defaulted]
 *                   due_date_from:
 *                     type: string
 *                     format: date
 *                   due_date_to:
 *                     type: string
 *                     format: date
 *     responses:
 *       200:
 *         description: Bulk SMS sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/bulk',
  authenticate,
  isAdmin,
  [
    body('template_id').isUUID().withMessage('Invalid template ID'),
    body().custom((value, { req }) => {
      if (!req.body.recipients && !req.body.filter) {
        throw new Error('Either recipients or filter is required');
      }
      return true;
    }),
    validate
  ],
  sendBulkSms
);

/**
 * @swagger
 * /api/sms/logs:
 *   get:
 *     summary: Get SMS logs
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, failed, pending]
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: template_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of SMS logs
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/logs',
  authenticate,
  isStaff,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('client_id').optional().isUUID().withMessage('Invalid client ID'),
    query('status').optional().isIn(['sent', 'failed', 'pending']).withMessage('Invalid status'),
    query('template_id').optional().isUUID().withMessage('Invalid template ID'),
    validate
  ],
  getSmsLogs
);

module.exports = router;