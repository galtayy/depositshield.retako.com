const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runSQLFile(filePath) {
  try {
    console.log(`Running SQL file: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Split into individual statements by semicolon
    const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Execute each statement
          await db.execute(statement);
          console.log('Statement executed successfully');
        } catch (err) {
          console.error('Error executing statement:', err);
          console.log('Failed statement:', statement);
        }
      }
    }
    
    console.log(`Completed SQL file: ${filePath}`);
  } catch (err) {
    console.error(`Error processing SQL file ${filePath}:`, err);
  }
}

async function main() {
  try {
    console.log('Starting database update for property fields...');

    // Run the simpler SQL file
    await runSQLFile(path.join(__dirname, 'config', 'simple_alter_schema.sql'));

    console.log('Database update completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database update:', err);
    process.exit(1);
  }
}

// Run the main function
main();