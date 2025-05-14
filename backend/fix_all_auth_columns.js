// Script to check and add all required auth columns in the users table
const db = require('./config/database');

async function checkColumn(columnName) {
  const [columns] = await db.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'depositshield_db' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = ?
  `, [columnName]);
  
  return columns.length > 0;
}

async function addColumn(columnName, dataType, defaultValue = null) {
  let query = `ALTER TABLE depositshield_db.users ADD COLUMN ${columnName} ${dataType}`;
  
  if (defaultValue !== null) {
    query += ` DEFAULT ${defaultValue}`;
  }
  
  await db.execute(query);
  console.log(`Added ${columnName} column to users table`);
}

async function fixAuthColumns() {
  try {
    console.log('Checking authentication columns in users table...');
    
    // Verification columns
    if (!await checkColumn('verification_code')) {
      await addColumn('verification_code', 'VARCHAR(10) NULL');
    }
    
    if (!await checkColumn('verification_expires')) {
      await addColumn('verification_expires', 'DATETIME NULL');
    }
    
    if (!await checkColumn('is_verified')) {
      await addColumn('is_verified', 'BOOLEAN', 'FALSE');
    }
    
    // Password reset columns
    if (!await checkColumn('reset_code')) {
      await addColumn('reset_code', 'VARCHAR(10) NULL');
    }
    
    if (!await checkColumn('reset_expires')) {
      await addColumn('reset_expires', 'DATETIME NULL');
    }
    
    if (!await checkColumn('reset_token')) {
      await addColumn('reset_token', 'VARCHAR(255) NULL');
    }
    
    if (!await checkColumn('reset_token_expires')) {
      await addColumn('reset_token_expires', 'DATETIME NULL');
    }
    
    console.log('Successfully checked and added all required authentication columns!');
    
  } catch (error) {
    console.error('Error fixing authentication columns:', error);
  } finally {
    // Close the database connection
    db.end().then(() => {
      console.log('Database connection closed.');
    });
  }
}

// Run the function
fixAuthColumns();