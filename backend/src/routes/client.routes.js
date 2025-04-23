const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, isStaff } = require('../middleware/auth.middleware');
const { validate, validateUUID } = require('../middleware/validator.middleware');

const router = express.Router();

// Note: Client controller is not implemented yet, but routes are defined for completeness

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: account_type
 *         schema:
 *           type: string
 *           enum: [SB, BB, MB]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, inactive]
 *     responses:
 *       200:
 *         description: List of clients
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/',
  authenticate,
  isStaff,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('account_type').optional().isIn(['SB', 'BB', 'MB']).withMessage('Invalid account type'),
    query('status').optional().isIn(['active', 'pending', 'inactive']).withMessage('Invalid status'),
    validate
  ],
  (req, res) => {
    // Placeholder for getClients controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
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
 *         description: Client details
 *       404:
 *         description: Client not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/:id',
  authenticate,
  validateUUID,
  isStaff,
  (req, res) => {
    // Placeholder for getClientById controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Create new client
 *     tags: [Clients]
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
 *               - email
 *               - phone
 *               - password
 *               - account_type
 *               - account_number
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               account_type:
 *                 type: string
 *                 enum: [SB, BB, MB]
 *               account_number:
 *                 type: string
 *               balance:
 *                 type: number
 *                 default: 0
 *               kyc_verified:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/',
  authenticate,
  isStaff,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('account_type').isIn(['SB', 'BB', 'MB']).withMessage('Invalid account type'),
    body('account_number').notEmpty().withMessage('Account number is required'),
    body('balance').optional().isFloat({ min: 0 }).withMessage('Balance must be a non-negative number'),
    validate
  ],
  (req, res) => {
    // Placeholder for createClient controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Update client
 *     tags: [Clients]
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
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               account_type:
 *                 type: string
 *                 enum: [SB, BB, MB]
 *               status:
 *                 type: string
 *                 enum: [active, pending, inactive]
 *               kyc_verified:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Client not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.put(
  '/:id',
  authenticate,
  validateUUID,
  isStaff,
  [
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('account_type').optional().isIn(['SB', 'BB', 'MB']).withMessage('Invalid account type'),
    body('status').optional().isIn(['active', 'pending', 'inactive']).withMessage('Invalid status'),
    body('kyc_verified').optional().isBoolean().withMessage('kyc_verified must be a boolean'),
    validate
  ],
  (req, res) => {
    // Placeholder for updateClient controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

/**
 * @swagger
 * /api/clients/{id}/transactions:
 *   post:
 *     summary: Create client transaction (deposit/withdrawal)
 *     tags: [Clients]
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
 *             required:
 *               - transaction_type
 *               - amount
 *             properties:
 *               transaction_type:
 *                 type: string
 *                 enum: [deposit, withdrawal]
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               reference_number:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Client not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/:id/transactions',
  authenticate,
  validateUUID,
  isStaff,
  [
    body('transaction_type').isIn(['deposit', 'withdrawal']).withMessage('Invalid transaction type'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    validate
  ],
  (req, res) => {
    // Placeholder for createClientTransaction controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

/**
 * @swagger
 * /api/clients/{id}/transactions:
 *   get:
 *     summary: Get client transactions
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         name: transaction_type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, loan_disbursement, loan_payment, interest_payment, fee]
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
 *     responses:
 *       200:
 *         description: List of client transactions
 *       404:
 *         description: Client not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/:id/transactions',
  authenticate,
  validateUUID,
  isStaff,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('transaction_type').optional().isIn(['deposit', 'withdrawal', 'loan_disbursement', 'loan_payment', 'interest_payment', 'fee']).withMessage('Invalid transaction type'),
    validate
  ],
  (req, res) => {
    // Placeholder for getClientTransactions controller
    res.status(501).json({ message: 'Not implemented yet' });
  }
);

module.exports = router;