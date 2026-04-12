import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load database connection settings from the environment.
dotenv.config();

// Create a shared MySQL connection pool for the whole backend.
// Default values make local development work even when no .env file is present.
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pre_enrolment',
  // Pooling lets multiple requests reuse connections instead of opening a new one each time.
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the pool so route handlers and setup code can run queries.
export default pool;
