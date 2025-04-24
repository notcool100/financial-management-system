const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createAdmin() {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    passwordProvided: !!dbConfig.password
  });

  // Create a new database connection
  const pool = new Pool(dbConfig);

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    console.log('Hashed password:', hashedPassword);

    // Check if admin user exists
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@example.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists, updating password...');
      await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, 'admin@example.com']
      );
    } else {
      console.log('Creating new admin user...');
      await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)',
        ['Admin User', 'admin@example.com', '9800000000', hashedPassword, 'admin']
      );
    }

    console.log('Admin user created/updated successfully');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the function
createAdmin();