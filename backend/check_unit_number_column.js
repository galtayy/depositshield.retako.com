// check_unit_number_column.js
// Bu script, unit_number kolonunun varlığını kontrol eder ve yoksa ekler

const db = require('./config/database');

async function checkAndCreateColumn() {
  try {
    console.log('Checking for unit_number column in properties table...');
    
    // MySQL bağlantısını test et
    await db.execute('SELECT 1');
    console.log('MySQL connection successful');
    
    // Kolonu kontrol et
    const [columns] = await db.execute('SHOW COLUMNS FROM properties LIKE "unit_number"');
    
    if (columns.length > 0) {
      console.log('✅ unit_number column already exists in properties table');
    } else {
      console.log('⚠️ unit_number column does not exist. Creating it now...');
      
      // Kolonu ekle
      await db.execute('ALTER TABLE properties ADD COLUMN unit_number VARCHAR(20) DEFAULT NULL AFTER description');
      console.log('✅ unit_number column created successfully');
      
      // Property type'tan unit_number'a veri kopyalama
      const [updateResult] = await db.execute(`
        UPDATE properties 
        SET unit_number = property_type
        WHERE property_type REGEXP '^[0-9]+$'
      `);
      
      console.log(`✅ Data migration complete. Rows affected: ${updateResult.affectedRows}`);
      
      // Property type'ı varsayılan değere ayarla
      const [defaultResult] = await db.execute(`
        UPDATE properties
        SET property_type = 'apartment'
        WHERE property_type REGEXP '^[0-9]+$' OR property_type IS NULL OR property_type = ''
      `);
      
      console.log(`✅ Default property type set. Rows affected: ${defaultResult.affectedRows}`);
    }
    
    // Mevcut kayıtları check et
    const [properties] = await db.execute('SELECT id, property_type, unit_number FROM properties');
    
    console.log('\n--- PROPERTIES DATA CHECK ---');
    for (const property of properties) {
      console.log(`Property ${property.id}:`);
      console.log(`  - property_type: ${property.property_type || 'NULL'}`);
      console.log(`  - unit_number: ${property.unit_number || 'NULL'}`);
    }
    
    console.log('\nDone checking unit_number column!');
    await db.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking unit_number column:', error);
    process.exit(1);
  }
}

// Execute script
checkAndCreateColumn();