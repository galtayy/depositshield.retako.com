// update_unit_number.js
// Bu script, properties tablosuna unit_number sütununu eklemek için kullanılır
// Ayrıca mevcut property_type değerlerini unit_number'a kopyalar

const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function applySchema() {
  try {
    console.log('Veritabanı şeması güncelleniyor: unit_number alanı ekleniyor...');
    
    // SQL dosyasını oku
    const sqlFile = path.join(__dirname, 'config', 'alter_schema_unit_number.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');
    
    // SQL komutlarını ayır ve çalıştır
    const commands = sql.split(';').filter(cmd => cmd.trim() !== '');
    
    for (const command of commands) {
      try {
        console.log(`Çalıştırılıyor: ${command.slice(0, 100)}...`);
        await db.execute(command);
        console.log('SQL komutu başarıyla çalıştırıldı.');
      } catch (error) {
        // Eğer sütun zaten varsa hatayı yoksay
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log('unit_number sütunu zaten mevcut. Bu adım atlanıyor.');
        } else {
          console.error('SQL komutu çalıştırılırken hata oluştu:', error.message);
          throw error; // Diğer hataları fırlat
        }
      }
    }
    
    console.log('Veritabanı şeması başarıyla güncellendi.');
    
    // Bağlantıyı kapat
    await db.end();
    console.log('Veritabanı bağlantısı kapatıldı.');
    
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı güncelleme hatası:', error);
    process.exit(1);
  }
}

// Scripti çalıştır
applySchema();