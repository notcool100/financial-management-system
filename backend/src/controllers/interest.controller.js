const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get all interest rates
 * @route GET /api/interest/rates
 * @access Private (Admin/Staff)
 */
const getInterestRates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    // Validate sort parameters
    const validSortColumns = ['name', 'rate', 'created_at', 'updated_at'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Get interest rates
    const rates = await db.any(`
      SELECT *
      FROM interest_rates
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Get total count
    const countResult = await db.one(`
      SELECT COUNT(*) as total
      FROM interest_rates
    `);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        rates,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting interest rates:', error);
    next(error);
  }
};

/**
 * Get interest rate by ID
 * @route GET /api/interest/rates/:id
 * @access Private (Admin/Staff)
 */
const getInterestRateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const rate = await db.oneOrNone(`
      SELECT *
      FROM interest_rates
      WHERE id = $1
    `, [id]);
    
    if (!rate) {
      throw new ApiError('Interest rate not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: rate,
    });
  } catch (error) {
    logger.error('Error getting interest rate:', error);
    next(error);
  }
};

/**
 * Create new interest rate
 * @route POST /api/interest/rates
 * @access Private (Admin)
 */
const createInterestRate = async (req, res, next) => {
  try {
    const { name, rate, description, is_active = true } = req.body;
    
    // Check if name already exists
    const existingRate = await db.oneOrNone(`
      SELECT id FROM interest_rates WHERE name = $1
    `, [name]);
    
    if (existingRate) {
      throw new ApiError('Interest rate with this name already exists', 400);
    }
    
    // Create new interest rate
    const newRate = await db.one(`
      INSERT INTO interest_rates (name, rate, description, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `, [name, rate, description, is_active]);
    
    res.status(201).json({
      success: true,
      data: newRate,
    });
  } catch (error) {
    logger.error('Error creating interest rate:', error);
    next(error);
  }
};

/**
 * Update interest rate
 * @route PATCH /api/interest/rates/:id
 * @access Private (Admin)
 */
const updateInterestRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, rate, description, is_active } = req.body;
    
    // Check if interest rate exists
    const existingRate = await db.oneOrNone(`
      SELECT * FROM interest_rates WHERE id = $1
    `, [id]);
    
    if (!existingRate) {
      throw new ApiError('Interest rate not found', 404);
    }
    
    // Check if name already exists (for another rate)
    if (name && name !== existingRate.name) {
      const nameExists = await db.oneOrNone(`
        SELECT id FROM interest_rates WHERE name = $1 AND id != $2
      `, [name, id]);
      
      if (nameExists) {
        throw new ApiError('Interest rate with this name already exists', 400);
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (rate !== undefined) {
      updates.push(`rate = $${paramCount++}`);
      values.push(rate);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // Add id as the last parameter
    values.push(id);
    
    // Update interest rate
    const updatedRate = await db.one(`
      UPDATE interest_rates
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    res.status(200).json({
      success: true,
      data: updatedRate,
    });
  } catch (error) {
    logger.error('Error updating interest rate:', error);
    next(error);
  }
};

/**
 * Delete interest rate
 * @route DELETE /api/interest/rates/:id
 * @access Private (Admin)
 */
const deleteInterestRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if interest rate exists
    const existingRate = await db.oneOrNone(`
      SELECT id FROM interest_rates WHERE id = $1
    `, [id]);
    
    if (!existingRate) {
      throw new ApiError('Interest rate not found', 404);
    }
    
    // Check if interest rate is used in any loan types
    const usedInLoanTypes = await db.oneOrNone(`
      SELECT COUNT(*) as count
      FROM loan_types
      WHERE default_interest_rate_id = $1
    `, [id]);
    
    if (parseInt(usedInLoanTypes.count) > 0) {
      throw new ApiError('Cannot delete interest rate that is used in loan types', 400);
    }
    
    // Delete interest rate
    await db.none(`
      DELETE FROM interest_rates
      WHERE id = $1
    `, [id]);
    
    res.status(200).json({
      success: true,
      message: 'Interest rate deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting interest rate:', error);
    next(error);
  }
};

module.exports = {
  getInterestRates,
  getInterestRateById,
  createInterestRate,
  updateInterestRate,
  deleteInterestRate,
};