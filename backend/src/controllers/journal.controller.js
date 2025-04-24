const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get journal entries
 * @route GET /api/journal/entries
 * @access Private (Admin/Staff)
 */
const getJournalEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, start_date, end_date, is_posted } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT je.*, u.name as created_by_name
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (start_date && end_date) {
      query += ` AND je.entry_date BETWEEN $${paramCount++} AND $${paramCount++}`;
      queryParams.push(start_date, end_date);
    } else if (start_date) {
      query += ` AND je.entry_date >= $${paramCount++}`;
      queryParams.push(start_date);
    } else if (end_date) {
      query += ` AND je.entry_date <= $${paramCount++}`;
      queryParams.push(end_date);
    }
    
    if (is_posted !== undefined) {
      query += ` AND je.is_posted = $${paramCount++}`;
      queryParams.push(is_posted === 'true');
    }
    
    query += ` ORDER BY je.entry_date DESC, je.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM journal_entries je
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (start_date && end_date) {
      countQuery += ` AND je.entry_date BETWEEN $${countParamIndex++} AND $${countParamIndex++}`;
      countParams.push(start_date, end_date);
    } else if (start_date) {
      countQuery += ` AND je.entry_date >= $${countParamIndex++}`;
      countParams.push(start_date);
    } else if (end_date) {
      countQuery += ` AND je.entry_date <= $${countParamIndex++}`;
      countParams.push(end_date);
    }
    
    if (is_posted !== undefined) {
      countQuery += ` AND je.is_posted = $${countParamIndex++}`;
      countParams.push(is_posted === 'true');
    }
    
    // Execute queries
    const entries = await db.any(query, queryParams);
    const countResult = await db.one(countQuery, countParams);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting journal entries:', error);
    next(error);
  }
};

/**
 * Get journal entry by ID
 * @route GET /api/journal/entries/:id
 * @access Private (Admin/Staff)
 */
const getJournalEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get journal entry
    const entry = await db.oneOrNone(`
      SELECT je.*, u.name as created_by_name
      FROM journal_entries je
      LEFT JOIN users u ON je.created_by = u.id
      WHERE je.id = $1
    `, [id]);
    
    if (!entry) {
      throw new ApiError('Journal entry not found', 404);
    }
    
    // Get journal entry details
    const details = await db.any(`
      SELECT jed.*, coa.account_code, coa.account_name
      FROM journal_entry_details jed
      JOIN chart_of_accounts coa ON jed.account_id = coa.id
      WHERE jed.journal_entry_id = $1
      ORDER BY jed.id
    `, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        entry,
        details,
      },
    });
  } catch (error) {
    logger.error('Error getting journal entry:', error);
    next(error);
  }
};

/**
 * Create journal entry
 * @route POST /api/journal/entries
 * @access Private (Admin/Staff)
 */
const createJournalEntry = async (req, res, next) => {
  try {
    const { entry_date, reference_number, description, is_posted = false, details } = req.body;
    
    // Validate details
    if (!details || !Array.isArray(details) || details.length === 0) {
      throw new ApiError('At least one detail is required', 400);
    }
    
    // Validate that debits equal credits
    const totalDebits = details.reduce((sum, detail) => sum + parseFloat(detail.debit_amount || 0), 0);
    const totalCredits = details.reduce((sum, detail) => sum + parseFloat(detail.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      throw new ApiError('Total debits must equal total credits', 400);
    }
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Create journal entry
      const newEntry = await t.one(`
        INSERT INTO journal_entries (
          entry_date, reference_number, description, is_posted,
          created_by, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [
        entry_date,
        reference_number,
        description,
        is_posted,
        req.user.id
      ]);
      
      // Create journal entry details
      const detailsPromises = details.map(detail => {
        return t.one(`
          INSERT INTO journal_entry_details (
            journal_entry_id, account_id, debit_amount, credit_amount,
            description, created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW())
          RETURNING *
        `, [
          newEntry.id,
          detail.account_id,
          detail.debit_amount || 0,
          detail.credit_amount || 0,
          detail.description || null
        ]);
      });
      
      const detailsResults = await Promise.all(detailsPromises);
      
      // If entry is posted, update account balances
      if (is_posted) {
        await updateAccountBalances(t, details);
        
        // Update entry posted_at timestamp
        await t.none(`
          UPDATE journal_entries
          SET posted_at = NOW(), posted_by = $1
          WHERE id = $2
        `, [req.user.id, newEntry.id]);
      }
      
      return {
        entry: newEntry,
        details: detailsResults,
      };
    })
    .then(data => {
      res.status(201).json({
        success: true,
        data,
      });
    })
    .catch(error => {
      logger.error('Error creating journal entry:', error);
      next(error);
    });
  } catch (error) {
    logger.error('Error creating journal entry:', error);
    next(error);
  }
};

/**
 * Post journal entry
 * @route PATCH /api/journal/entries/:id/post
 * @access Private (Admin)
 */
const postJournalEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if journal entry exists
    const entry = await db.oneOrNone(`
      SELECT * FROM journal_entries
      WHERE id = $1
    `, [id]);
    
    if (!entry) {
      throw new ApiError('Journal entry not found', 404);
    }
    
    // Check if entry is already posted
    if (entry.is_posted) {
      throw new ApiError('Journal entry is already posted', 400);
    }
    
    // Get entry details
    const details = await db.any(`
      SELECT * FROM journal_entry_details
      WHERE journal_entry_id = $1
    `, [id]);
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Update account balances
      await updateAccountBalances(t, details);
      
      // Update entry status
      const updatedEntry = await t.one(`
        UPDATE journal_entries
        SET is_posted = true, posted_at = NOW(), posted_by = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [req.user.id, id]);
      
      return updatedEntry;
    })
    .then(updatedEntry => {
      res.status(200).json({
        success: true,
        data: updatedEntry,
      });
    })
    .catch(error => {
      logger.error('Error posting journal entry:', error);
      next(error);
    });
  } catch (error) {
    logger.error('Error posting journal entry:', error);
    next(error);
  }
};

/**
 * Get chart of accounts
 * @route GET /api/journal/accounts
 * @access Private (Admin/Staff)
 */
const getChartOfAccounts = async (req, res, next) => {
  try {
    const { account_type, is_active = true } = req.query;
    
    let query = `
      SELECT * FROM chart_of_accounts
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    if (account_type) {
      query += ` AND account_type = $${paramCount++}`;
      queryParams.push(account_type);
    }
    
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      queryParams.push(is_active === 'true');
    }
    
    query += ` ORDER BY account_code`;
    
    const accounts = await db.any(query, queryParams);
    
    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    logger.error('Error getting chart of accounts:', error);
    next(error);
  }
};

/**
 * Get account by ID
 * @route GET /api/journal/accounts/:id
 * @access Private (Admin/Staff)
 */
const getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const account = await db.oneOrNone(`
      SELECT * FROM chart_of_accounts
      WHERE id = $1
    `, [id]);
    
    if (!account) {
      throw new ApiError('Account not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    logger.error('Error getting account:', error);
    next(error);
  }
};

/**
 * Create account
 * @route POST /api/journal/accounts
 * @access Private (Admin)
 */
const createAccount = async (req, res, next) => {
  try {
    const { account_code, account_name, account_type, parent_account_id, is_active = true } = req.body;
    
    // Check if account code already exists
    const existingCode = await db.oneOrNone(`
      SELECT id FROM chart_of_accounts
      WHERE account_code = $1
    `, [account_code]);
    
    if (existingCode) {
      throw new ApiError('Account code already exists', 400);
    }
    
    // Check if parent account exists if provided
    if (parent_account_id) {
      const parentAccount = await db.oneOrNone(`
        SELECT id FROM chart_of_accounts
        WHERE id = $1
      `, [parent_account_id]);
      
      if (!parentAccount) {
        throw new ApiError('Parent account not found', 404);
      }
    }
    
    // Create account
    const newAccount = await db.one(`
      INSERT INTO chart_of_accounts (
        account_code, account_name, account_type, parent_account_id,
        is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [
      account_code,
      account_name,
      account_type,
      parent_account_id,
      is_active
    ]);
    
    res.status(201).json({
      success: true,
      data: newAccount,
    });
  } catch (error) {
    logger.error('Error creating account:', error);
    next(error);
  }
};

/**
 * Helper function to update account balances
 * @param {Object} t - Database transaction object
 * @param {Array} details - Journal entry details
 */
const updateAccountBalances = async (t, details) => {
  for (const detail of details) {
    if (detail.debit_amount > 0) {
      await t.none(`
        UPDATE chart_of_accounts
        SET current_balance = current_balance + $1, updated_at = NOW()
        WHERE id = $2
      `, [detail.debit_amount, detail.account_id]);
    }
    
    if (detail.credit_amount > 0) {
      await t.none(`
        UPDATE chart_of_accounts
        SET current_balance = current_balance - $1, updated_at = NOW()
        WHERE id = $2
      `, [detail.credit_amount, detail.account_id]);
    }
  }
};

module.exports = {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  postJournalEntry,
  getChartOfAccounts,
  getAccountById,
  createAccount,
};