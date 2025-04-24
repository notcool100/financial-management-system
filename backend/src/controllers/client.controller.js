const bcrypt = require('bcrypt');
const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');

/**
 * Get all clients
 * @route GET /api/clients
 * @access Private (Admin/Staff)
 */
const getClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT c.*, u.name, u.email, u.phone, u.created_at, u.updated_at
      FROM clients c
      JOIN users u ON c.id = u.id
      WHERE u.role = 'client'
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add search condition if provided
    if (search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.phone ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    
    // Add status filter if provided
    if (status) {
      query += ` AND c.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }
    
    // Add pagination
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM clients c
      JOIN users u ON c.id = u.id
      WHERE u.role = 'client'
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (search) {
      countQuery += ` AND (u.name ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex} OR u.phone ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    if (status) {
      countQuery += ` AND c.status = $${countParamIndex}`;
      countParams.push(status);
    }
    
    // Execute queries
    const clients = await db.any(query, queryParams);
    const countResult = await db.one(countQuery, countParams);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting clients:', error);
    next(error);
  }
};

/**
 * Get client by ID
 * @route GET /api/clients/:id
 * @access Private (Admin/Staff/Owner)
 */
const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if client exists
    const client = await db.oneOrNone(`
      SELECT c.*, u.name, u.email, u.phone, u.created_at, u.updated_at
      FROM clients c
      JOIN users u ON c.id = u.id
      WHERE c.id = $1 AND u.role = 'client'
    `, [id]);
    
    if (!client) {
      throw new ApiError('Client not found', 404);
    }
    
    // Get client's active loans
    const loans = await db.any(`
      SELECT id, amount, interest_rate, tenure_months, emi_amount, disburse_date, end_date, status, remaining_amount
      FROM loans
      WHERE client_id = $1
      ORDER BY created_at DESC
    `, [id]);
    
    res.status(200).json({
      success: true,
      data: {
        client,
        loans,
      },
    });
  } catch (error) {
    logger.error('Error getting client:', error);
    next(error);
  }
};

/**
 * Create new client
 * @route POST /api/clients
 * @access Private (Admin/Staff)
 */
const createClient = async (req, res, next) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      address, 
      city, 
      state, 
      postal_code,
      id_type,
      id_number,
      employment_status,
      employer_name,
      monthly_income,
      status = 'active'
    } = req.body;
    
    // Check if email already exists
    const existingEmail = await db.oneOrNone('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail) {
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
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Create user
      const newUser = await t.one(`
        INSERT INTO users (name, email, phone, password, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, name, email, phone, role, created_at, updated_at
      `, [name, email, phone, hashedPassword, 'client']);
      
      // Create client
      const newClient = await t.one(`
        INSERT INTO clients (
          id, address, city, state, postal_code, id_type, id_number,
          employment_status, employer_name, monthly_income, status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `, [
        newUser.id, address, city, state, postal_code, id_type, id_number,
        employment_status, employer_name, monthly_income, status
      ]);
      
      return {
        ...newUser,
        ...newClient,
      };
    })
    .then(data => {
      res.status(201).json({
        success: true,
        data,
      });
    })
    .catch(error => {
      logger.error('Error creating client:', error);
      next(error);
    });
  } catch (error) {
    logger.error('Error creating client:', error);
    next(error);
  }
};

/**
 * Update client
 * @route PATCH /api/clients/:id
 * @access Private (Admin/Staff)
 */
const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      postal_code,
      id_type,
      id_number,
      employment_status,
      employer_name,
      monthly_income,
      status
    } = req.body;
    
    // Check if client exists
    const client = await db.oneOrNone(`
      SELECT c.id FROM clients c
      JOIN users u ON c.id = u.id
      WHERE c.id = $1 AND u.role = 'client'
    `, [id]);
    
    if (!client) {
      throw new ApiError('Client not found', 404);
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
    
    // Use a transaction to ensure data consistency
    return db.tx(async t => {
      // Update user information if provided
      if (name || email || phone) {
        const userUpdates = [];
        const userValues = [];
        let userParamCount = 1;
        
        if (name) {
          userUpdates.push(`name = $${userParamCount++}`);
          userValues.push(name);
        }
        
        if (email) {
          userUpdates.push(`email = $${userParamCount++}`);
          userValues.push(email);
        }
        
        if (phone) {
          userUpdates.push(`phone = $${userParamCount++}`);
          userValues.push(phone);
        }
        
        userUpdates.push(`updated_at = NOW()`);
        
        // Add id as the last parameter
        userValues.push(id);
        
        if (userUpdates.length > 1) { // More than just updated_at
          await t.none(`
            UPDATE users
            SET ${userUpdates.join(', ')}
            WHERE id = $${userParamCount}
          `, userValues);
        }
      }
      
      // Update client information if provided
      if (address || city || state || postal_code || id_type || id_number || 
          employment_status || employer_name || monthly_income || status) {
        const clientUpdates = [];
        const clientValues = [];
        let clientParamCount = 1;
        
        if (address) {
          clientUpdates.push(`address = $${clientParamCount++}`);
          clientValues.push(address);
        }
        
        if (city) {
          clientUpdates.push(`city = $${clientParamCount++}`);
          clientValues.push(city);
        }
        
        if (state) {
          clientUpdates.push(`state = $${clientParamCount++}`);
          clientValues.push(state);
        }
        
        if (postal_code) {
          clientUpdates.push(`postal_code = $${clientParamCount++}`);
          clientValues.push(postal_code);
        }
        
        if (id_type) {
          clientUpdates.push(`id_type = $${clientParamCount++}`);
          clientValues.push(id_type);
        }
        
        if (id_number) {
          clientUpdates.push(`id_number = $${clientParamCount++}`);
          clientValues.push(id_number);
        }
        
        if (employment_status) {
          clientUpdates.push(`employment_status = $${clientParamCount++}`);
          clientValues.push(employment_status);
        }
        
        if (employer_name) {
          clientUpdates.push(`employer_name = $${clientParamCount++}`);
          clientValues.push(employer_name);
        }
        
        if (monthly_income) {
          clientUpdates.push(`monthly_income = $${clientParamCount++}`);
          clientValues.push(monthly_income);
        }
        
        if (status) {
          clientUpdates.push(`status = $${clientParamCount++}`);
          clientValues.push(status);
        }
        
        clientUpdates.push(`updated_at = NOW()`);
        
        // Add id as the last parameter
        clientValues.push(id);
        
        if (clientUpdates.length > 1) { // More than just updated_at
          await t.none(`
            UPDATE clients
            SET ${clientUpdates.join(', ')}
            WHERE id = $${clientParamCount}
          `, clientValues);
        }
      }
      
      // Get updated client data
      return t.one(`
        SELECT c.*, u.name, u.email, u.phone, u.created_at, u.updated_at
        FROM clients c
        JOIN users u ON c.id = u.id
        WHERE c.id = $1
      `, [id]);
    })
    .then(updatedClient => {
      res.status(200).json({
        success: true,
        data: updatedClient,
      });
    })
    .catch(error => {
      logger.error('Error updating client:', error);
      next(error);
    });
  } catch (error) {
    logger.error('Error updating client:', error);
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
};