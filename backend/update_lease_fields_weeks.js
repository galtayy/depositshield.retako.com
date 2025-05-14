// Update database schema to add weeks option to lease_duration_type
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function updateDatabase() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'config', 'alter_schema_lease_fields_update.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands
    console.log('Executing SQL updates for lease fields (adding weeks option)...');
    await connection.query(sql);
    
    console.log('Database schema updated successfully with weeks option for lease duration!');
  } catch (error) {
    console.error('Error updating database schema:', error);
  } finally {
    if (connection) {
      // Close the connection
      await connection.end();
    }
  }
}

// Run the update function
updateDatabase();