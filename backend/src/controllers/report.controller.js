const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Generate balance sheet report
 * @route GET /api/reports/balance-sheet
 * @access Private (Admin/Staff)
 */
const getBalanceSheet = async (req, res, next) => {
  try {
    const { as_of_date, format = 'json' } = req.query;
    
    // Get assets
    const assets = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, coa.current_balance
      FROM chart_of_accounts coa
      WHERE coa.account_type = 'asset'
      AND coa.is_active = true
      ORDER BY coa.account_code
    `);
    
    // Get liabilities
    const liabilities = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, coa.current_balance
      FROM chart_of_accounts coa
      WHERE coa.account_type = 'liability'
      AND coa.is_active = true
      ORDER BY coa.account_code
    `);
    
    // Get equity
    const equity = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, coa.current_balance
      FROM chart_of_accounts coa
      WHERE coa.account_type = 'equity'
      AND coa.is_active = true
      ORDER BY coa.account_code
    `);
    
    // Calculate totals
    const totalAssets = assets.reduce((sum, asset) => sum + parseFloat(asset.current_balance), 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + parseFloat(liability.current_balance), 0);
    const totalEquity = equity.reduce((sum, eq) => sum + parseFloat(eq.current_balance), 0);
    
    const report = {
      as_of_date,
      assets,
      liabilities,
      equity,
      totals: {
        assets: totalAssets,
        liabilities: totalLiabilities,
        equity: totalEquity,
        liabilities_and_equity: totalLiabilities + totalEquity,
      },
    };
    
    // Return report in requested format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: report,
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.status(501).json({ message: 'PDF format not implemented yet' });
    } else if (format === 'csv') {
      // CSV generation would be implemented here
      res.status(501).json({ message: 'CSV format not implemented yet' });
    }
  } catch (error) {
    logger.error('Error generating balance sheet:', error);
    next(error);
  }
};

/**
 * Generate income statement report
 * @route GET /api/reports/income-statement
 * @access Private (Admin/Staff)
 */
const getIncomeStatement = async (req, res, next) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;
    
    // Get revenue
    const revenue = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, 
             SUM(CASE WHEN jed.credit_amount > 0 THEN jed.credit_amount ELSE 0 END) as amount
      FROM chart_of_accounts coa
      JOIN journal_entry_details jed ON coa.id = jed.account_id
      JOIN journal_entries je ON jed.journal_entry_id = je.id
      WHERE coa.account_type = 'revenue'
      AND je.is_posted = true
      AND je.entry_date BETWEEN $1 AND $2
      GROUP BY coa.id, coa.account_code, coa.account_name
      ORDER BY coa.account_code
    `, [start_date, end_date]);
    
    // Get expenses
    const expenses = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, 
             SUM(CASE WHEN jed.debit_amount > 0 THEN jed.debit_amount ELSE 0 END) as amount
      FROM chart_of_accounts coa
      JOIN journal_entry_details jed ON coa.id = jed.account_id
      JOIN journal_entries je ON jed.journal_entry_id = je.id
      WHERE coa.account_type = 'expense'
      AND je.is_posted = true
      AND je.entry_date BETWEEN $1 AND $2
      GROUP BY coa.id, coa.account_code, coa.account_name
      ORDER BY coa.account_code
    `, [start_date, end_date]);
    
    // Calculate totals
    const totalRevenue = revenue.reduce((sum, rev) => sum + parseFloat(rev.amount), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const netIncome = totalRevenue - totalExpenses;
    
    const report = {
      start_date,
      end_date,
      revenue,
      expenses,
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: netIncome,
      },
    };
    
    // Return report in requested format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: report,
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.status(501).json({ message: 'PDF format not implemented yet' });
    } else if (format === 'csv') {
      // CSV generation would be implemented here
      res.status(501).json({ message: 'CSV format not implemented yet' });
    }
  } catch (error) {
    logger.error('Error generating income statement:', error);
    next(error);
  }
};

/**
 * Generate trial balance report
 * @route GET /api/reports/trial-balance
 * @access Private (Admin/Staff)
 */
const getTrialBalance = async (req, res, next) => {
  try {
    const { as_of_date, format = 'json' } = req.query;
    
    // Get all accounts with balances
    const accounts = await db.any(`
      SELECT coa.id, coa.account_code, coa.account_name, coa.account_type, coa.current_balance,
             CASE WHEN coa.current_balance > 0 THEN coa.current_balance ELSE 0 END as debit_balance,
             CASE WHEN coa.current_balance < 0 THEN ABS(coa.current_balance) ELSE 0 END as credit_balance
      FROM chart_of_accounts coa
      WHERE coa.is_active = true
      ORDER BY coa.account_code
    `);
    
    // Calculate totals
    const totalDebits = accounts.reduce((sum, account) => sum + parseFloat(account.debit_balance), 0);
    const totalCredits = accounts.reduce((sum, account) => sum + parseFloat(account.credit_balance), 0);
    
    const report = {
      as_of_date,
      accounts,
      totals: {
        debits: totalDebits,
        credits: totalCredits,
      },
    };
    
    // Return report in requested format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: report,
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.status(501).json({ message: 'PDF format not implemented yet' });
    } else if (format === 'csv') {
      // CSV generation would be implemented here
      res.status(501).json({ message: 'CSV format not implemented yet' });
    }
  } catch (error) {
    logger.error('Error generating trial balance:', error);
    next(error);
  }
};

/**
 * Generate loan portfolio report
 * @route GET /api/reports/loan-portfolio
 * @access Private (Admin/Staff)
 */
const getLoanPortfolio = async (req, res, next) => {
  try {
    const { as_of_date, status = 'active', format = 'json' } = req.query;
    
    let query = `
      SELECT l.id, l.client_id, u.name as client_name, l.amount, l.interest_rate,
             l.tenure_months, l.emi_amount, l.disburse_date, l.end_date,
             l.remaining_amount, l.status, lt.name as loan_type_name
      FROM loans l
      JOIN users u ON l.client_id = u.id
      JOIN loan_types lt ON l.loan_type_id = lt.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (status !== 'all') {
      query += ` AND l.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (as_of_date) {
      query += ` AND l.disburse_date <= $${paramCount++}`;
      queryParams.push(as_of_date);
    }
    
    query += ` ORDER BY l.disburse_date DESC`;
    
    // Get loans
    const loans = await db.any(query, queryParams);
    
    // Calculate totals
    const totalAmount = loans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + parseFloat(loan.remaining_amount), 0);
    
    // Group by status
    const loansByStatus = {};
    loans.forEach(loan => {
      if (!loansByStatus[loan.status]) {
        loansByStatus[loan.status] = [];
      }
      loansByStatus[loan.status].push(loan);
    });
    
    const report = {
      as_of_date,
      loans,
      by_status: loansByStatus,
      totals: {
        count: loans.length,
        amount: totalAmount,
        remaining: totalRemaining,
      },
    };
    
    // Return report in requested format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: report,
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.status(501).json({ message: 'PDF format not implemented yet' });
    } else if (format === 'csv') {
      // CSV generation would be implemented here
      res.status(501).json({ message: 'CSV format not implemented yet' });
    }
  } catch (error) {
    logger.error('Error generating loan portfolio report:', error);
    next(error);
  }
};

/**
 * Generate day book report
 * @route GET /api/reports/day-book
 * @access Private (Admin/Staff)
 */
const getDayBook = async (req, res, next) => {
  try {
    const { date, format = 'json' } = req.query;
    
    // Get journal entries for the day
    const entries = await db.any(`
      SELECT je.id, je.entry_date, je.reference_number, je.description, je.is_posted,
             u.name as created_by_name
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE je.entry_date = $1
      ORDER BY je.created_at
    `, [date]);
    
    // Get entry details
    const entryIds = entries.map(entry => entry.id);
    
    let details = [];
    if (entryIds.length > 0) {
      details = await db.any(`
        SELECT jed.journal_entry_id, jed.account_id, coa.account_code, coa.account_name,
               jed.debit_amount, jed.credit_amount, jed.description
        FROM journal_entry_details jed
        JOIN chart_of_accounts coa ON jed.account_id = coa.id
        WHERE jed.journal_entry_id IN ($1:csv)
        ORDER BY jed.journal_entry_id, jed.id
      `, [entryIds]);
    }
    
    // Group details by entry
    const entriesWithDetails = entries.map(entry => {
      const entryDetails = details.filter(detail => detail.journal_entry_id === entry.id);
      
      // Calculate entry totals
      const totalDebits = entryDetails.reduce((sum, detail) => sum + parseFloat(detail.debit_amount || 0), 0);
      const totalCredits = entryDetails.reduce((sum, detail) => sum + parseFloat(detail.credit_amount || 0), 0);
      
      return {
        ...entry,
        details: entryDetails,
        totals: {
          debits: totalDebits,
          credits: totalCredits,
        },
      };
    });
    
    // Calculate day totals
    const totalDebits = details.reduce((sum, detail) => sum + parseFloat(detail.debit_amount || 0), 0);
    const totalCredits = details.reduce((sum, detail) => sum + parseFloat(detail.credit_amount || 0), 0);
    
    const report = {
      date,
      entries: entriesWithDetails,
      totals: {
        entries: entries.length,
        debits: totalDebits,
        credits: totalCredits,
      },
    };
    
    // Return report in requested format
    if (format === 'json') {
      res.status(200).json({
        success: true,
        data: report,
      });
    } else if (format === 'pdf') {
      // PDF generation would be implemented here
      res.status(501).json({ message: 'PDF format not implemented yet' });
    } else if (format === 'csv') {
      // CSV generation would be implemented here
      res.status(501).json({ message: 'CSV format not implemented yet' });
    }
  } catch (error) {
    logger.error('Error generating day book report:', error);
    next(error);
  }
};

/**
 * Save a generated report
 * @route POST /api/reports/save
 * @access Private (Admin)
 */
const saveReport = async (req, res, next) => {
  try {
    const { report_type, start_date, end_date, report_data, notes } = req.body;
    
    // Save report
    const savedReport = await db.one(`
      INSERT INTO saved_reports (
        report_type, start_date, end_date, report_data, notes,
        created_by, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [
      report_type,
      start_date,
      end_date,
      report_data,
      notes,
      req.user.id
    ]);
    
    res.status(201).json({
      success: true,
      data: savedReport,
    });
  } catch (error) {
    logger.error('Error saving report:', error);
    next(error);
  }
};

module.exports = {
  getBalanceSheet,
  getIncomeStatement,
  getTrialBalance,
  getLoanPortfolio,
  getDayBook,
  saveReport,
};