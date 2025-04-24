const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

async function initSchema() {
  try {
    logger.info('Initializing database schema...');

    // Create users table
    await db.none(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'client',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Users table created or already exists');

    // Create interest_rates table
    await db.none(`
      CREATE TABLE IF NOT EXISTS interest_rates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE,
        rate DECIMAL(5,2) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Interest rates table created or already exists');

    // Create loan_types table
    await db.none(`
      CREATE TABLE IF NOT EXISTS loan_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE,
        interest_rate_id UUID NOT NULL REFERENCES interest_rates(id),
        min_amount DECIMAL(12,2) NOT NULL,
        max_amount DECIMAL(12,2) NOT NULL,
        min_term INTEGER NOT NULL,
        max_term INTEGER NOT NULL,
        processing_fee DECIMAL(5,2) NOT NULL DEFAULT 0,
        late_fee DECIMAL(5,2) NOT NULL DEFAULT 0,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Loan types table created or already exists');

    // Create loans table
    await db.none(`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        loan_type_id UUID NOT NULL REFERENCES loan_types(id),
        amount DECIMAL(12,2) NOT NULL,
        interest_rate DECIMAL(5,2) NOT NULL,
        term INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        application_date TIMESTAMP NOT NULL DEFAULT NOW(),
        approval_date TIMESTAMP,
        disburse_date TIMESTAMP,
        end_date TIMESTAMP,
        remaining_amount DECIMAL(12,2),
        next_payment_date TIMESTAMP,
        next_payment_amount DECIMAL(12,2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Loans table created or already exists');

    // Create loan_transactions table
    await db.none(`
      CREATE TABLE IF NOT EXISTS loan_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loan_id UUID NOT NULL REFERENCES loans(id),
        amount DECIMAL(12,2) NOT NULL,
        payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    logger.info('Loan transactions table created or already exists');

    // Create admin user if it doesn't exist
    const adminExists = await db.oneOrNone(`
      SELECT id FROM users WHERE email = 'admin@example.com'
    `);

    if (!adminExists) {
      // Using bcrypt hash for password 'admin123'
      const adminPasswordHash = '$2b$10$3Eo3QmmlMsYJDVUPRMvgAOxhnwS.xCGAhPRvEK9kNlYOjYfGjCALa';
      
      await db.none(`
        INSERT INTO users (name, email, phone, password, role)
        VALUES ('Admin User', 'admin@example.com', '9800000000', $1, 'admin')
      `, [adminPasswordHash]);
      
      logger.info('Admin user created');
    } else {
      logger.info('Admin user already exists');
    }

    logger.info('Database schema initialization completed successfully');
  } catch (error) {
    logger.error('Error initializing database schema:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await db.$pool.end();
  }
}

// Run the function
initSchema();