// Test database connection script
const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  // Parse the DATABASE_URL from .env
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env file');
    process.exit(1);
  }
  
  // Extract connection details from the URL
  // Format: postgresql://username:password@hostname:port/database?schema=public
  const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
  const match = dbUrl.match(regex);
  
  if (!match) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }
  
  const [, user, password, host, port, database] = match;
  
  // Create a new client
  const client = new Client({
    user,
    password,
    host,
    port,
    database
  });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Successfully connected to the database');
    
    // Test query to get table count
    const res = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Database has ${res.rows[0].table_count} tables`);
    
    // Get list of tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in the database:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Get count of records in key tables
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const clientCount = await client.query('SELECT COUNT(*) as count FROM clients');
    const loanTypeCount = await client.query('SELECT COUNT(*) as count FROM loan_types');
    const loanCount = await client.query('SELECT COUNT(*) as count FROM loans');
    
    console.log('\nRecord counts:');
    console.log(`- Users: ${userCount.rows[0].count}`);
    console.log(`- Clients: ${clientCount.rows[0].count}`);
    console.log(`- Loan Types: ${loanTypeCount.rows[0].count}`);
    console.log(`- Loans: ${loanCount.rows[0].count}`);
    
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    // Close the client connection
    await client.end();
  }
}

testConnection();