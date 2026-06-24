const { Pool } = require('pg');
require('dotenv').config();

/**
 * Clean & Production-Ready PostgreSQL Connection Configuration
 * Uses a connection pool to manage concurrent database client threads efficiently.
 */
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before throwing an error if connection fails
});

// Event Listener: Triggered when a new client connects successfully
pool.on('connect', () => {
  console.log('--- Database Thread Alert: PostgreSQL Client Pool Connected Natively ---');
});

// Event Listener: Global error handler to catch unexpected idle client errors without crashing the server
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

/**
 * Universal Query Execution Wrapper
 * Abstracts the pool.query behavior for clean, global reuse across all controllers.
 */