const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db.config');
const logger = require('../config/logger.config');

// Read the schema SQL file
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Initialize the database
async function initializeDatabase() {
  try {
    logger.info('Initializing database...');
    
    // Execute the schema SQL
    await pool.query(schemaSQL);
    
    logger.info('Database initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing database:', error);
    return false;
  }
}

// Export the function
module.exports = { initializeDatabase };

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('Database initialized successfully');
        process.exit(0);
      } else {
        console.error('Failed to initialize database');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}