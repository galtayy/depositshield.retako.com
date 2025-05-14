// update_unit_number_data.js
// Bu script, properties tablosundaki tüm kayıtları tarar ve numerik property_type değerlerini unit_number alanına taşır

const db = require('./config/database');

async function fixPropertyData() {
  try {
    console.log('Checking properties table for unit number migration...');
    
    // Tüm properties kayıtlarını al
    const [properties] = await db.execute('SELECT id, property_type, unit_number FROM properties');
    console.log(`Found ${properties.length} properties in the database.`);
    
    let fixedCount = 0;
    let alreadyFixedCount = 0;
    let notNeedFixCount = 0;
    
    // Her property için kontrol et
    for (const property of properties) {
      const { id, property_type, unit_number } = property;
      
      // Kontrol: unit_number boş ve property_type sayısal
      if (!unit_number && property_type && /^\d+$/.test(property_type)) {
        try {
          console.log(`Property ${id}: Moving numeric property_type "${property_type}" to unit_number`);
          
          // Güncelleme yap
          await db.execute(
            'UPDATE properties SET unit_number = ?, property_type = ? WHERE id = ?',
            [property_type, 'apartment', id]
          );
          
          fixedCount++;
          console.log(`✅ Fixed property ${id}`);
        } catch (updateError) {
          console.error(`❌ Error updating property ${id}:`, updateError.message);
        }
      } else if (unit_number && property_type === 'apartment') {
        console.log(`Property ${id}: Already correctly set (unit_number=${unit_number}, property_type=${property_type})`);
        alreadyFixedCount++;
      } else {
        console.log(`Property ${id}: No fix needed (unit_number=${unit_number || 'null'}, property_type=${property_type || 'null'})`);
        notNeedFixCount++;
      }
    }
    
    console.log('\n--- SUMMARY ---');
    console.log(`Total properties: ${properties.length}`);
    console.log(`Fixed properties: ${fixedCount}`);
    console.log(`Already correct: ${alreadyFixedCount}`);
    console.log(`No fix needed: ${notNeedFixCount}`);
    
    console.log('\nMigration completed!');
    await db.end();
    
    process.exit(0);
  } catch (error) {
    console.error('Error in unit number migration:', error);
    process.exit(1);
  }
}

// Ana scripti başlat
fixPropertyData();