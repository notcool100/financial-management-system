const { db } = require('../config/db.config');
const logger = require('../config/logger.config');
const { ApiError } = require('../middleware/error.middleware');
const { sendSMS, processTemplate, sendBulkSMS } = require('../utils/sms.utils');

/**
 * Get SMS templates
 * @route GET /api/sms/templates
 * @access Private (Admin/Staff)
 */
const getSmsTemplates = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT * FROM sms_templates
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (type) {
      query += ` AND template_type = $1`;
      queryParams.push(type);
    }
    
    query += ` ORDER BY name`;
    
    const templates = await db.any(query, queryParams);
    
    res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get SMS template by ID
 * @route GET /api/sms/templates/:id
 * @access Private (Admin/Staff)
 */
const getSmsTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const template = await db.oneOrNone(`
      SELECT * FROM sms_templates
      WHERE id = $1
    `, [id]);
    
    if (!template) {
      throw new ApiError('SMS template not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create SMS template
 * @route POST /api/sms/templates
 * @access Private (Admin/Staff)
 */
const createSmsTemplate = async (req, res, next) => {
  try {
    const { name, template_text, template_type } = req.body;
    
    // Check if template name already exists
    const existingTemplate = await db.oneOrNone(`
      SELECT id FROM sms_templates
      WHERE name = $1
    `, [name]);
    
    if (existingTemplate) {
      throw new ApiError('Template name already exists', 400);
    }
    
    // Create template
    const newTemplate = await db.one(`
      INSERT INTO sms_templates (name, template_text, template_type, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `, [name, template_text, template_type]);
    
    res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update SMS template
 * @route PUT /api/sms/templates/:id
 * @access Private (Admin/Staff)
 */
const updateSmsTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, template_text, template_type, is_active } = req.body;
    
    // Check if template exists
    const template = await db.oneOrNone(`
      SELECT id FROM sms_templates
      WHERE id = $1
    `, [id]);
    
    if (!template) {
      throw new ApiError('SMS template not found', 404);
    }
    
    // Check if name is already used by another template
    if (name) {
      const existingTemplate = await db.oneOrNone(`
        SELECT id FROM sms_templates
        WHERE name = $1 AND id != $2
      `, [name, id]);
      
      if (existingTemplate) {
        throw new ApiError('Template name already exists', 400);
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
    
    if (template_text) {
      updates.push(`template_text = $${paramCount++}`);
      values.push(template_text);
    }
    
    if (template_type) {
      updates.push(`template_type = $${paramCount++}`);
      values.push(template_type);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    updates.push(`updated_at = NOW()`);
    
    // Add id as the last parameter
    values.push(id);
    
    // Update template
    const updatedTemplate = await db.oneOrNone(`
      UPDATE sms_templates
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    
    res.status(200).json({
      success: true,
      data: updatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete SMS template
 * @route DELETE /api/sms/templates/:id
 * @access Private (Admin)
 */
const deleteSmsTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if template exists
    const template = await db.oneOrNone(`
      SELECT id FROM sms_templates
      WHERE id = $1
    `, [id]);
    
    if (!template) {
      throw new ApiError('SMS template not found', 404);
    }
    
    // Check if template is used in SMS logs
    const usedInLogs = await db.oneOrNone(`
      SELECT COUNT(*) as count
      FROM sms_logs
      WHERE template_id = $1
    `, [id]);
    
    if (parseInt(usedInLogs.count) > 0) {
      // Instead of deleting, mark as inactive
      await db.none(`
        UPDATE sms_templates
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
      `, [id]);
      
      return res.status(200).json({
        success: true,
        message: 'Template marked as inactive because it is used in SMS logs',
      });
    }
    
    // Delete template
    await db.none(`
      DELETE FROM sms_templates
      WHERE id = $1
    `, [id]);
    
    res.status(200).json({
      success: true,
      message: 'SMS template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send SMS to a client
 * @route POST /api/sms/send
 * @access Private (Admin/Staff)
 */
const sendSmsToClient = async (req, res, next) => {
  try {
    const { client_id, phone_number, message, template_id, variables } = req.body;
    
    // Either client_id or phone_number must be provided
    if (!client_id && !phone_number) {
      throw new ApiError('Either client_id or phone_number is required', 400);
    }
    
    // Either message or template_id must be provided
    if (!message && !template_id) {
      throw new ApiError('Either message or template_id is required', 400);
    }
    
    let finalMessage = message;
    let finalPhoneNumber = phone_number;
    let clientId = client_id;
    
    // If template_id is provided, get the template
    if (template_id) {
      const template = await db.oneOrNone(`
        SELECT * FROM sms_templates
        WHERE id = $1 AND is_active = true
      `, [template_id]);
      
      if (!template) {
        throw new ApiError('SMS template not found or not active', 404);
      }
      
      // Process template with variables
      finalMessage = processTemplate(template.template_text, variables || {});
      
      // Update last used timestamp
      await db.none(`
        UPDATE sms_templates
        SET last_used_at = NOW()
        WHERE id = $1
      `, [template_id]);
    }
    
    // If client_id is provided, get the client's phone number
    if (client_id && !phone_number) {
      const client = await db.oneOrNone(`
        SELECT u.phone
        FROM clients c
        JOIN users u ON c.id = u.id
        WHERE c.id = $1
      `, [client_id]);
      
      if (!client) {
        throw new ApiError('Client not found', 404);
      }
      
      finalPhoneNumber = client.phone;
    } else if (phone_number && !client_id) {
      // Try to find client by phone number
      const client = await db.oneOrNone(`
        SELECT c.id
        FROM clients c
        JOIN users u ON c.id = u.id
        WHERE u.phone = $1
      `, [phone_number]);
      
      if (client) {
        clientId = client.id;
      }
    }
    
    // Send SMS
    const smsResult = await sendSMS(finalPhoneNumber, finalMessage);
    
    // Log SMS
    const smsLog = await db.one(`
      INSERT INTO sms_logs (
        client_id, phone_number, message, template_id,
        status, sent_at, created_by, created_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, NOW())
      RETURNING *
    `, [
      clientId,
      finalPhoneNumber,
      finalMessage,
      template_id,
      smsResult.success ? 'sent' : 'failed',
      req.user.id
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        sms: smsLog,
        result: smsResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send bulk SMS
 * @route POST /api/sms/bulk
 * @access Private (Admin)
 */
const sendBulkSms = async (req, res, next) => {
  try {
    const { template_id, recipients, filter } = req.body;
    
    // Validate template
    const template = await db.oneOrNone(`
      SELECT * FROM sms_templates
      WHERE id = $1 AND is_active = true
    `, [template_id]);
    
    if (!template) {
      throw new ApiError('SMS template not found or not active', 404);
    }
    
    let clientsToMessage = [];
    
    // If recipients are provided, use them
    if (recipients && recipients.length > 0) {
      clientsToMessage = recipients;
    } 
    // Otherwise, use filter to get clients
    else if (filter) {
      let query = `
        SELECT c.id, u.name, u.phone
        FROM clients c
        JOIN users u ON c.id = u.id
        WHERE c.status = 'active'
      `;
      
      const queryParams = [];
      let paramCount = 1;
      
      // Add filters
      if (filter.account_type) {
        query += ` AND c.account_type = $${paramCount++}`;
        queryParams.push(filter.account_type);
      }
      
      if (filter.loan_status) {
        query += ` AND EXISTS (
          SELECT 1 FROM loans l
          WHERE l.client_id = c.id AND l.status = $${paramCount++}
        )`;
        queryParams.push(filter.loan_status);
      }
      
      if (filter.due_date_from && filter.due_date_to) {
        query += ` AND EXISTS (
          SELECT 1 FROM loans l
          JOIN emi_schedule es ON l.id = es.loan_id
          WHERE l.client_id = c.id
          AND es.due_date BETWEEN $${paramCount++} AND $${paramCount++}
          AND es.is_paid = false
        )`;
        queryParams.push(filter.due_date_from, filter.due_date_to);
      }
      
      // Get clients
      const clients = await db.any(query, queryParams);
      
      // Format clients for SMS sending
      clientsToMessage = clients.map(client => ({
        id: client.id,
        phone: client.phone,
        variables: {
          name: client.name,
          phone: client.phone,
          // Add other variables as needed
        },
      }));
    } else {
      throw new ApiError('Either recipients or filter is required', 400);
    }
    
    if (clientsToMessage.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No recipients found matching the criteria',
        data: {
          sent: 0,
          failed: 0,
          total: 0,
        },
      });
    }
    
    // Send bulk SMS
    const results = await sendBulkSMS(
      clientsToMessage.map(client => ({
        phone: client.phone,
        variables: client.variables,
      })),
      template.template_text
    );
    
    // Log SMS
    const smsLogs = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const client = clientsToMessage[i];
      
      const smsLog = await db.one(`
        INSERT INTO sms_logs (
          client_id, phone_number, message, template_id,
          status, sent_at, error_message, created_by, created_at
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, NOW())
        RETURNING *
      `, [
        client.id,
        client.phone,
        processTemplate(template.template_text, client.variables),
        template_id,
        result.status,
        result.error || null,
        req.user.id
      ]);
      
      smsLogs.push(smsLog);
    }
    
    // Update template last used timestamp
    await db.none(`
      UPDATE sms_templates
      SET last_used_at = NOW()
      WHERE id = $1
    `, [template_id]);
    
    // Count successes and failures
    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    res.status(200).json({
      success: true,
      data: {
        sent,
        failed,
        total: results.length,
        logs: smsLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get SMS logs
 * @route GET /api/sms/logs
 * @access Private (Admin/Staff)
 */
const getSmsLogs = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      client_id, 
      status,
      start_date,
      end_date,
      template_id
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT sl.*, 
             u.name as client_name,
             st.name as template_name
      FROM sms_logs sl
      LEFT JOIN users u ON sl.client_id = u.id
      LEFT JOIN sms_templates st ON sl.template_id = st.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Add filters
    if (client_id) {
      query += ` AND sl.client_id = $${paramCount++}`;
      queryParams.push(client_id);
    }
    
    if (status) {
      query += ` AND sl.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    if (start_date && end_date) {
      query += ` AND sl.created_at BETWEEN $${paramCount++} AND $${paramCount++}`;
      queryParams.push(start_date, end_date);
    }
    
    if (template_id) {
      query += ` AND sl.template_id = $${paramCount++}`;
      queryParams.push(template_id);
    }
    
    // Add sorting and pagination
    query += ` ORDER BY sl.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM sms_logs sl
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamIndex = 1;
    
    if (client_id) {
      countQuery += ` AND sl.client_id = $${countParamIndex++}`;
      countParams.push(client_id);
    }
    
    if (status) {
      countQuery += ` AND sl.status = $${countParamIndex++}`;
      countParams.push(status);
    }
    
    if (start_date && end_date) {
      countQuery += ` AND sl.created_at BETWEEN $${countParamIndex++} AND $${countParamIndex++}`;
      countParams.push(start_date, end_date);
    }
    
    if (template_id) {
      countQuery += ` AND sl.template_id = $${countParamIndex++}`;
      countParams.push(template_id);
    }
    
    // Execute queries
    const logs = await db.any(query, queryParams);
    const countResult = await db.one(countQuery, countParams);
    
    const total = parseInt(countResult.total);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: {
        logs,
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

module.exports = {
  getSmsTemplates,
  getSmsTemplateById,
  createSmsTemplate,
  updateSmsTemplate,
  deleteSmsTemplate,
  sendSmsToClient,
  sendBulkSms,
  getSmsLogs,
};