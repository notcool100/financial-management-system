let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('bcrypt module not found, falling back to mock-bcrypt for development');
    bcrypt = require('../utils/mock-bcrypt');
  } else {
    throw err;
  }
}
const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get all users
 * @route GET /api/users
 * @access Private (Admin/Staff)
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, email, phone, role, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add search condition if provided
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    
    // Add role filter if provided
    if (role) {
      query += ` AND role = $${paramCount}`;
      queryParams.push(role);
      paramCount++;
    }
    
    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users
      WHERE 1=1
      ${search ? `AND (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)` : ''}
      ${role ? `AND role = $${search ? 2 : 1}` : ''}
    `;
    
    const countParams = [];
    if (search) countParams.push(`%${search}%`);
    if (role) countParams.push(role);
    
    // Execute queries
    const users = await db.any(query, queryParams);
    const countResult = await db.one(countQuery, countParams);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        users,
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
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private (Admin/Staff/Owner)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await db.oneOrNone(`
      SELECT id, name, email, phone, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `, [id]);
    
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // If user is a client, get client details
    let clientDetails = null;
    if (user.role === 'client') {
      clientDetails = await db.oneOrNone(`
        SELECT * FROM clients WHERE id = $1
      `, [id]);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...user,
        ...(clientDetails && { clientDetails }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 * @route POST /api/users
 * @access Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Check if email already exists
    const existingUser = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      throw new ApiError('Email already in use', 400);
    }
    
    // Check if phone already exists
    const existingPhone = await db.oneOrNone('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existingPhone) {
      throw new ApiError('Phone number already in use', 400);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const newUser = await db.one(`
      INSERT INTO users (name, email, phone, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, phone, role, created_at, updated_at
    `, [name, email, phone, hashedPassword, role]);
    
    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private (Admin/Owner)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;
    
    // Check if user exists
    const user = await db.oneOrNone('SELECT id FROM users WHERE id = $1', [id]);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Check if email is already in use by another user
    if (email) {
      const existingEmail = await db.oneOrNone('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingEmail) {
        throw new ApiError('Email already in use', 400);
      }
    }
    
    // Check if phone is already in use by another user
    if (phone) {
      const existingPhone = await db.oneOrNone('SELECT id FROM users WHERE phone = $1 AND id != $2', [phone, id]);
      if (existingPhone) {
        throw new ApiError('Phone number already in use', 400);
      }
    }
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    
    if (phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    
    // Only admin can change role
    if (role && req.user.role === 'admin') {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // Add id as the last parameter
    values.push(id);
    
    // Update user
    const updatedUser = await db.oneOrNone(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, phone, role, created_at, updated_at
    `, values);
    
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await db.oneOrNone('SELECT id, role FROM users WHERE id = $1', [id]);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    // Check if user is a client with active loans
    if (user.role === 'client') {
      const activeLoans = await db.oneOrNone(`
        SELECT COUNT(*) as count
        FROM loans
        WHERE client_id = $1 AND status IN ('active', 'pending')
      `, [id]);
      
      if (activeLoans && parseInt(activeLoans.count) > 0) {
        throw new ApiError('Cannot delete client with active loans', 400);
      }
    }
    
    // Delete user
    await db.none('DELETE FROM users WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent users
 * @route GET /api/users/recent
 * @access Private (Admin/Staff)
 */
const getRecentUsers = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const users = await db.any(`
      SELECT id, name, email, phone, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);
    
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error('Error getting recent users:', error);
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRecentUsers,
};