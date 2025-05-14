const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function executeSQL() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'config', 'alter_schema_rooms_json.sql'), 'utf8');
    console.log('Executing SQL:', sql);
    
    const [result] = await db.execute(sql);
    console.log('SQL executed successfully:', result);
    console.log('Reports table updated with rooms_json column');
    
    process.exit(0);
  } catch (error) {
    console.error('Error executing SQL:', error);
    process.exit(1);
  }
}

executeSQL();