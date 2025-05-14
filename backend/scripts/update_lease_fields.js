// Script to update the database with new lease fields
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function updateLeaseFields() {
  try {
    console.log('🔄 Updating database with lease fields...');
    
    const sqlFile = path.join(__dirname, '../config/alter_schema_lease_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split the SQL file into separate statements
    const statements = sql
      .replace(/--.*\n/g, '') // Remove comments
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    for (const statement of statements) {
      await db.execute(statement);
      console.log('✅ Executed SQL statement');
    }
    
    console.log('✅ Database update complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
}

updateLeaseFields();