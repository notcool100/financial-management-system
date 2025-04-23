const express = require('express');
const { body, param, query } = require('express-validator');
const { 
  getLoans, 
  getLoanById, 
  createLoan, 
  updateLoanStatus, 
  recordLoanPayment, 
  calculateLoan,
  getLoanTypes
} = require('../controllers/loan.controller');
const { 
  authenticate, 
  isAdmin, 
  isStaff 
} = require('../middleware/auth.middleware');
const { validate, validateUUID } = require('../middleware/validator.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Get all loans
 *     tags: [Loans]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, closed, defaulted]
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: calculation_type
 *         schema:
 *           type: string
 *           enum: [flat, diminishing]
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, amount, disburse_date, status]
 *           default: created_at
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of loans
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
    query('status').optional().isIn(['active', 'pending', 'closed', 'defaulted']).withMessage('Invalid status'),
    query('calculation_type').optional().isIn(['flat', 'diminishing']).withMessage('Invalid calculation type'),
    query('sort_by').optional().isIn(['created_at', 'amount', 'disburse_date', 'status']).withMessage('Invalid sort field'),
    query('sort_order').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
    validate
  ],
  getLoans
);

/**
 * @swagger
 * /api/loans/types:
 *   get:
 *     summary: Get all loan types
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of loan types
 *       401:
 *         description: Not authenticated
 */
router.get('/types', authenticate, getLoanTypes);

/**
 * @swagger
 * /api/loans/calculate:
 *   post:
 *     summary: Calculate loan details
 *     tags: [Loans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - interest_rate
 *               - tenure_months
 *               - calculation_type
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               interest_rate:
 *                 type: number
 *                 minimum: 0
 *               tenure_months:
 *                 type: integer
 *                 minimum: 1
 *               calculation_type:
 *                 type: string
 *                 enum: [flat, diminishing]
 *     responses:
 *       200:
 *         description: Loan calculation details
 *       400:
 *         description: Validation error
 */
router.post(
  '/calculate',
  [
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
    body('interest_rate').isFloat({ min: 0 }).withMessage('Interest rate must be a non-negative number'),
    body('tenure_months').isInt({ min: 1 }).withMessage('Tenure must be a positive integer'),
    body('calculation_type').isIn(['flat', 'diminishing']).withMessage('Invalid calculation type'),
    validate
  ],
  calculateLoan
);

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Loans]
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
 *         description: Loan details
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get(
  '/:id',
  authenticate,
  validateUUID,
  getLoanById
);

/**
 * @swagger
 * /api/loans:
 *   post:
 *     summary: Create new loan
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - loan_type_id
 *               - calculation_type
 *               - amount
 *               - interest_rate
 *               - tenure_months
 *               - disburse_date
 *             properties:
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               loan_type_id:
 *                 type: string
 *                 format: uuid
 *               calculation_type:
 *                 type: string
 *                 enum: [flat, diminishing]
 *               amount:
 *                 type: number
 *                 minimum: 1
 *               interest_rate:
 *                 type: number
 *                 minimum: 0
 *               tenure_months:
 *                 type: integer
 *                 minimum: 1
 *               disburse_date:
 *                 type: string
 *                 format: date
 *               processing_fee:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Loan created successfully
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
    body('client_id').isUUID().withMessage('Invalid client ID'),
    body('loan_type_id').isUUID().withMessage('Invalid loan type ID'),
    body('calculation_type').isIn(['flat', 'diminishing']).withMessage('Invalid calculation type'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number'),
    body('interest_rate').isFloat({ min: 0 }).withMessage('Interest rate must be a non-negative number'),
    body('tenure_months').isInt({ min: 1 }).withMessage('Tenure must be a positive integer'),
    body('disburse_date').isDate().withMessage('Invalid disburse date'),
    body('processing_fee').optional().isFloat({ min: 0 }).withMessage('Processing fee must be a non-negative number'),
    validate
  ],
  createLoan
);

/**
 * @swagger
 * /api/loans/{id}/status:
 *   patch:
 *     summary: Update loan status
 *     tags: [Loans]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, pending, closed, defaulted]
 *     responses:
 *       200:
 *         description: Loan status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Loan not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.patch(
  '/:id/status',
  authenticate,
  validateUUID,
  isStaff,
  [
    body('status').isIn(['active', 'pending', 'closed', 'defaulted']).withMessage('Invalid status'),
    validate
  ],
  updateLoanStatus
);

/**
 * @swagger
 * /api/loans/{id}/payments:
 *   post:
 *     summary: Record loan payment
 *     tags: [Loans]
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
 *               - amount
 *               - payment_date
 *               - installment_number
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               payment_date:
 *                 type: string
 *                 format: date
 *               installment_number:
 *                 type: integer
 *                 minimum: 1
 *               late_fee:
 *                 type: number
 *                 minimum: 0
 *               transaction_reference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Loan or installment not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post(
  '/:id/payments',
  authenticate,
  validateUUID,
  isStaff,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('payment_date').isDate().withMessage('Invalid payment date'),
    body('installment_number').isInt({ min: 1 }).withMessage('Invalid installment number'),
    body('late_fee').optional().isFloat({ min: 0 }).withMessage('Late fee must be a non-negative number'),
    validate
  ],
  recordLoanPayment
);

module.exports = router;