const express = require('express');
const { body, param, query } = require('express-validator');
const { 
  getInterestRates, 
  getInterestRateById, 
  createInterestRate, 
  updateInterestRate, 
  deleteInterestRate 
} = require('../controllers/interest.controller');
const { 
  authenticate, 
  isAdmin, 
  isStaff 
} = require('../middleware/auth.middleware');
const { validate, validateUUID } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/interest/rates:
 *   get:
 *     summary: Get all interest rates
 *     tags: [Interest]
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
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [name, rate, created_at, updated_at]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of interest rates
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/rates',
  authenticate,
  isStaff,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort_by').optional().isIn(['name', 'rate', 'created_at', 'updated_at']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
    validate
  ],
  getInterestRates
);

/**
 * @swagger
 * /api/interest/rates/{id}:
 *   get:
 *     summary: Get interest rate by ID
 *     tags: [Interest]
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
 *         description: Interest rate details
 *       404:
 *         description: Interest rate not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/rates/:id',
  authenticate,
  isStaff,
  validateUUID,
  getInterestRateById
);

/**
 * @swagger
 * /api/interest/rates:
 *   post:
 *     summary: Create new interest rate
 *     tags: [Interest]
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
 *               - rate
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               rate:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Interest rate created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/rates',
  authenticate,
  isAdmin,
  [
    body('name').isString().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('rate').isFloat({ min: 0 }).withMessage('Rate must be a non-negative number'),
    body('description').optional().isString().isLength({ max: 255 }).withMessage('Description must be at most 255 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    validate
  ],
  createInterestRate
);

/**
 * @swagger
 * /api/interest/rates/{id}:
 *   patch:
 *     summary: Update interest rate
 *     tags: [Interest]
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
 *                 minLength: 2
 *                 maxLength: 50
 *               rate:
 *                 type: number
 *                 minimum: 0
 *               description:
 *                 type: string
 *                 maxLength: 255
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Interest rate updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Interest rate not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.patch(
  '/rates/:id',
  authenticate,
  isAdmin,
  validateUUID,
  [
    body('name').optional().isString().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('rate').optional().isFloat({ min: 0 }).withMessage('Rate must be a non-negative number'),
    body('description').optional().isString().isLength({ max: 255 }).withMessage('Description must be at most 255 characters'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    validate
  ],
  updateInterestRate
);

/**
 * @swagger
 * /api/interest/rates/{id}:
 *   delete:
 *     summary: Delete interest rate
 *     tags: [Interest]
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
 *         description: Interest rate deleted successfully
 *       400:
 *         description: Cannot delete interest rate that is in use
 *       404:
 *         description: Interest rate not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.delete(
  '/rates/:id',
  authenticate,
  isAdmin,
  validateUUID,
  deleteInterestRate
);

module.exports = router;