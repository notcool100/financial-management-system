const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  // Connect to postgres database to create our application database
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to postgres database');

    // Check if our database exists
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkResult.rowCount === 0) {
      // Database doesn't exist, create it
      console.log(`Database ${process.env.DB_NAME} does not exist, creating...`);
      
      // Create the database
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`Database ${process.env.DB_NAME} created successfully`);
    } else {
      console.log(`Database ${process.env.DB_NAME} already exists`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the function
createDatabase();