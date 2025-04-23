const pgp = require('pg-promise')();
const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 30, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};

// Create a new database connection pool
const pool = new Pool(dbConfig);

// Create a pg-promise database instance
const db = pgp(dbConfig);

// Test database connection
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export both pool and pg-promise db
module.exports = {
  pool,
  db,
  query: (text, params) => pool.query(text, params),
};