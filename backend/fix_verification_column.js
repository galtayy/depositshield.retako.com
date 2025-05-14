// Script to fix the missing verification_expires column in the users table
const db = require('./config/database');

async function fixVerificationExpiresColumn() {
  try {
    console.log('Checking if verification_expires column exists...');
    
    // First check if the column already exists
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'depositshield_db' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'verification_expires'
    `);
    
    if (columns.length > 0) {
      console.log('verification_expires column already exists, no action needed.');
      return;
    }
    
    console.log('verification_expires column does not exist. Adding it now...');
    
    // Execute the SQL to add the column
    await db.execute(`
      ALTER TABLE depositshield_db.users 
      ADD COLUMN verification_expires DATETIME NULL
    `);
    
    console.log('Successfully added verification_expires column to users table!');
    
  } catch (error) {
    console.error('Error fixing verification_expires column:', error);
  } finally {
    // Close the database connection
    db.end().then(() => {
      console.log('Database connection closed.');
    });
  }
}

// Run the function
fixVerificationExpiresColumn();