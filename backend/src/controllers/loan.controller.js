const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');
const { calculateFlatLoan, calculateDiminishingLoan, generateEmiSchedule } = require('../utils/loan.utils');

/**
 * Get all loans
 * @route GET /api/loans
 * @access Private (Admin/Staff)
 */
const getLoans = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      client_id, 
      calculation_type,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = `
      SELECT l.*, 
             u.name as client_name, 
             u.phone as client_phone,
             lt.name as loan_type_name
      FROM loans l
      JOIN users u ON l.client_id = u.id
      JOIN loan_types lt ON l.loan_type_id = lt.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add filters
    if (status) {
      query += ` AND l.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (client_id) {
      query += ` AND l.client_id = $${paramCount++}`;
      queryParams.push(client_id);
    }
    
    if (calculation_type) {
      query += ` AND l.calculation_type = $${paramCount++}`;
      queryParams.push(calculation_type);
    }
    
    // Add sorting
    const validSortColumns = ['created_at', 'amount', 'disburse_date', 'status'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY l.${sortColumn} ${sortDir}`;
    
    // Add pagination
    query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM loans l
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (status) {
      countQuery += ` AND l.status = $${countParamIndex++}`;
      countParams.push(status);
    }
    
    if (client_id) {
      countQuery += ` AND l.client_id = $${countParamIndex++}`;
      countParams.push(client_id);
    }
    
    if (calculation_type) {
      countQuery += ` AND l.calculation_type = $${countParamIndex++}`;
      countParams.push(calculation_type);
    }
    
    // Execute queries
    const loans = await db.any(query, queryParams);
    const countResult = await db.one(countQuery, countParams);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        loans,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan by ID
 * @route GET /api/loans/:id
 * @access Private (Admin/Staff/Owner)
 */
const getLoanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get loan details
    const loan = await db.oneOrNone(`
      SELECT l.*, 
             u.name as client_name, 
             u.phone as client_phone,
             lt.name as loan_type_name
      FROM loans l
      JOIN users u ON l.client_id = u.id
      JOIN loan_types lt ON l.loan_type_id = lt.id
      WHERE l.id = $1
    `, [id]);
    
    if (!loan) {
      throw new ApiError('Loan not found', 404);
    }
    
    // Get EMI schedule
    const emiSchedule = await db.any(`
      SELECT * FROM emi_schedule
      WHERE loan_id = $1
      ORDER BY installment_number
    `, [id]);
    
    // Get loan transactions
    const transactions = await db.any(`
      SELECT * FROM loan_transactions
      WHERE loan_id = $1
      ORDER BY payment_date DESC
    `, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        loan,
        emiSchedule,
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new loan
 * @route POST /api/loans
 * @access Private (Admin/Staff)
 */
const createLoan = async (req, res, next) => {
  try {
    const {
      client_id,
      loan_type_id,
      calculation_type,
      amount,
      interest_rate,
      tenure_months,
      disburse_date,
      processing_fee,
    } = req.body;
    
    // Validate client exists and is active
    const client = await db.oneOrNone(`
      SELECT c.*, u.name, u.phone
      FROM clients c
      JOIN users u ON c.id = u.id
      WHERE c.id = $1 AND c.status = 'active'
    `, [client_id]);
    
    if (!client) {
      throw new ApiError('Client not found or not active', 404);
    }
    
    // Validate loan type exists
    const loanType = await db.oneOrNone(`
      SELECT * FROM loan_types
      WHERE id = $1 AND is_active = true
    `, [loan_type_id]);
    
    if (!loanType) {
      throw new ApiError('Loan type not found or not active', 404);
    }
    
    // Validate loan amount is within limits
    if (amount < loanType.min_amount || amount > loanType.max_amount) {
      throw new ApiError(`Loan amount must be between ${loanType.min_amount} and ${loanType.max_amount}`, 400);
    }
    
    // Validate tenure is within limits
    if (tenure_months < loanType.min_tenure_months || tenure_months > loanType.max_tenure_months) {
      throw new ApiError(`Loan tenure must be between ${loanType.min_tenure_months} and ${loanType.max_tenure_months} months`, 400);
    }
    
    // Calculate loan details based on calculation type
    let emiAmount, totalInterest, totalAmount;
    
    if (calculation_type === 'flat') {
      const result = calculateFlatLoan(amount, interest_rate, tenure_months);
      emiAmount = result.emiAmount;
      totalInterest = result.totalInterest;
      totalAmount = result.totalAmount;
    } else if (calculation_type === 'diminishing') {
      const result = calculateDiminishingLoan(amount, interest_rate, tenure_months);
      emiAmount = result.emiAmount;
      totalInterest = result.totalInterest;
      totalAmount = result.totalAmount;
    } else {
      throw new ApiError('Invalid calculation type', 400);
    }
    
    // Calculate end date
    const disburseDateObj = new Date(disburse_date);
    const endDateObj = new Date(disburseDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + tenure_months);
    const endDate = endDateObj.toISOString().split('T')[0];
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Create loan
      const newLoan = await t.one(`
        INSERT INTO loans (
          client_id, loan_type_id, calculation_type, amount, interest_rate,
          tenure_months, emi_amount, disburse_date, end_date, processing_fee,
          total_interest, total_amount, remaining_amount, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
        RETURNING *
      `, [
        client_id, loan_type_id, calculation_type, amount, interest_rate,
        tenure_months, emiAmount, disburse_date, endDate, processing_fee || 0,
        totalInterest, totalAmount, amount, 'pending'
      ]);
      
      // Generate EMI schedule
      const emiSchedule = generateEmiSchedule(
        newLoan.id, amount, interest_rate, tenure_months, calculation_type, disburse_date
      );
      
      // Insert EMI schedule
      const emiInsertQuery = t.none(`
        INSERT INTO emi_schedule (
          loan_id, installment_number, due_date, emi_amount,
          principal_amount, interest_amount, remaining_principal, is_paid
        )
        SELECT $1, s.installment_number, s.due_date, s.emi_amount,
               s.principal_amount, s.interest_amount, s.remaining_principal, s.is_paid
        FROM json_populate_recordset(null::emi_schedule, $2) as s
      `, [newLoan.id, JSON.stringify(emiSchedule)]);
      
      await emiInsertQuery;
      
      return {
        loan: newLoan,
        emiSchedule,
      };
    })
    .then(data => {
      res.status(201).json({
        success: true,
        data,
      });
    })
    .catch(error => {
      logger.error('Error creating loan:', error);
      next(error);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update loan status
 * @route PATCH /api/loans/:id/status
 * @access Private (Admin/Staff)
 */
const updateLoanStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'active', 'closed', 'defaulted'];
    if (!validStatuses.includes(status)) {
      throw new ApiError('Invalid status', 400);
    }
    
    // Check if loan exists
    const loan = await db.oneOrNone('SELECT * FROM loans WHERE id = $1', [id]);
    if (!loan) {
      throw new ApiError('Loan not found', 404);
    }
    
    // Update loan status
    const updatedLoan = await db.one(`
      UPDATE loans
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    // If status is changed to 'active', create a disbursement transaction
    if (status === 'active' && loan.status !== 'active') {
      // Create transaction record
      await db.none(`
        INSERT INTO transactions (
          client_id, transaction_type, amount, transaction_date,
          reference_number, description, related_loan_id, created_by
        )
        VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7)
      `, [
        loan.client_id,
        'loan_disbursement',
        loan.amount,
        `LOAN-DISB-${Date.now()}`,
        `Loan disbursement for loan ID: ${loan.id}`,
        loan.id,
        req.user.id
      ]);
    }
    
    res.status(200).json({
      success: true,
      data: updatedLoan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Record loan payment
 * @route POST /api/loans/:id/payments
 * @access Private (Admin/Staff)
 */
const recordLoanPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      payment_date, 
      installment_number,
      late_fee = 0,
      transaction_reference,
      notes
    } = req.body;
    
    // Check if loan exists and is active
    const loan = await db.oneOrNone(`
      SELECT * FROM loans
      WHERE id = $1 AND status = 'active'
    `, [id]);
    
    if (!loan) {
      throw new ApiError('Loan not found or not active', 404);
    }
    
    // Get the EMI installment
    const emiInstallment = await db.oneOrNone(`
      SELECT * FROM emi_schedule
      WHERE loan_id = $1 AND installment_number = $2 AND is_paid = false
    `, [id, installment_number]);
    
    if (!emiInstallment) {
      throw new ApiError('Installment not found or already paid', 404);
    }
    
    // Check if payment amount is valid
    if (amount < emiInstallment.emi_amount) {
      throw new ApiError('Payment amount must be at least the EMI amount', 400);
    }
    
    // Check if payment date is valid
    const paymentDateObj = new Date(payment_date);
    const dueDateObj = new Date(emiInstallment.due_date);
    const isLatePayment = paymentDateObj > dueDateObj;
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Record loan transaction
      const loanTransaction = await t.one(`
        INSERT INTO loan_transactions (
          loan_id, amount, principal_amount, interest_amount, late_fee,
          payment_date, due_date, is_late_payment, remaining_principal,
          transaction_reference, notes, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING *
      `, [
        id,
        amount,
        emiInstallment.principal_amount,
        emiInstallment.interest_amount,
        late_fee,
        payment_date,
        emiInstallment.due_date,
        isLatePayment,
        Math.max(0, loan.remaining_amount - emiInstallment.principal_amount),
        transaction_reference || `LOAN-PMT-${Date.now()}`,
        notes || `Payment for installment #${installment_number}`
      ]);
      
      // Update EMI installment
      await t.none(`
        UPDATE emi_schedule
        SET is_paid = true, payment_date = $1, payment_transaction_id = $2
        WHERE id = $3
      `, [payment_date, loanTransaction.id, emiInstallment.id]);
      
      // Update loan remaining amount
      const updatedLoan = await t.one(`
        UPDATE loans
        SET remaining_amount = GREATEST(0, remaining_amount - $1), updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [emiInstallment.principal_amount, id]);
      
      // Create transaction record
      await t.none(`
        INSERT INTO transactions (
          client_id, transaction_type, amount, transaction_date,
          reference_number, description, related_loan_id, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        loan.client_id,
        'loan_payment',
        amount,
        payment_date,
        transaction_reference || `LOAN-PMT-${Date.now()}`,
        `Loan payment for installment #${installment_number}`,
        id,
        req.user.id
      ]);
      
      // Check if all installments are paid
      const unpaidInstallments = await t.oneOrNone(`
        SELECT COUNT(*) as count
        FROM emi_schedule
        WHERE loan_id = $1 AND is_paid = false
      `, [id]);
      
      // If all installments are paid, close the loan
      if (parseInt(unpaidInstallments.count) === 0) {
        await t.none(`
          UPDATE loans
          SET status = 'closed', updated_at = NOW()
          WHERE id = $1
        `, [id]);
      }
      
      return {
        transaction: loanTransaction,
        loan: updatedLoan,
      };
    })
    .then(data => {
      res.status(201).json({
        success: true,
        data,
      });
    })
    .catch(error => {
      logger.error('Error recording loan payment:', error);
      next(error);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate loan details
 * @route POST /api/loans/calculate
 * @access Public
 */
const calculateLoan = async (req, res, next) => {
  try {
    const { amount, interest_rate, tenure_months, calculation_type } = req.body;
    
    if (!amount || !interest_rate || !tenure_months || !calculation_type) {
      throw new ApiError('All fields are required', 400);
    }
    
    let result;
    
    if (calculation_type === 'flat') {
      result = calculateFlatLoan(amount, interest_rate, tenure_months);
    } else if (calculation_type === 'diminishing') {
      result = calculateDiminishingLoan(amount, interest_rate, tenure_months);
    } else {
      throw new ApiError('Invalid calculation type', 400);
    }
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get loan types
 * @route GET /api/loans/types
 * @access Private
 */
const getLoanTypes = async (req, res, next) => {
  try {
    const loanTypes = await db.any(`
      SELECT * FROM loan_types
      WHERE is_active = true
      ORDER BY name
    `);
    
    res.status(200).json({
      success: true,
      data: loanTypes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  updateLoanStatus,
  recordLoanPayment,
  calculateLoan,
  getLoanTypes,
};