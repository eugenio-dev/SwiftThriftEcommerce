const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  // Remember to create your .env file with these values
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'SwiftThriftDB',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '1234',
});

// Function to initialize database connection
const connectToDatabase = async () => {
    try {
      const connection = await pool.getConnection();
      connection.release();
      console.log('Database connected successfully');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  };

// Helper function to execute queries
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

module.exports = { pool, connectToDatabase, query };
