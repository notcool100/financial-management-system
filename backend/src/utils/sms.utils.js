const logger = require('../config/logger.config');

/**
 * Send SMS using external SMS API
 * @param {String} phoneNumber - Recipient phone number
 * @param {String} message - SMS message content
 * @returns {Promise} Promise resolving to SMS API response
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    // In a real implementation, this would use an actual SMS API service
    // For now, we'll simulate the API call
    logger.info(`Sending SMS to ${phoneNumber}: ${message}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return simulated success response
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
      status: 'sent',
    };
  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Process template with variable substitution
 * @param {String} template - SMS template with placeholders
 * @param {Object} variables - Object containing variable values
 * @returns {String} Processed message with variables replaced
 */
const processTemplate = (template, variables) => {
  let processedMessage = template;
  
  // Replace all variables in the template
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return processedMessage;
};

/**
 * Send bulk SMS to multiple recipients
 * @param {Array} recipients - Array of recipient objects with phone and variables
 * @param {String} templateText - SMS template text
 * @returns {Promise} Promise resolving to array of SMS sending results
 */
const sendBulkSMS = async (recipients, templateText) => {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const message = processTemplate(templateText, recipient.variables);
      const result = await sendSMS(recipient.phone, message);
      
      results.push({
        phone: recipient.phone,
        status: 'sent',
        messageId: result.messageId,
      });
    } catch (error) {
      logger.error(`Failed to send SMS to ${recipient.phone}:`, error);
      
      results.push({
        phone: recipient.phone,
        status: 'failed',
        error: error.message,
      });
    }
  }
  
  return results;
};

module.exports = {
  sendSMS,
  processTemplate,
  sendBulkSMS,
};