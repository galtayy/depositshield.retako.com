const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add timezone option to handle dates correctly
  timezone: '+00:00', // Set to UTC
  dateStrings: true // Force MySQL to return dates as strings in YYYY-MM-DD format
});

// Promise wrapper
const promisePool = pool.promise();

// Başarılı bağlantıyı log'la
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('MySQL veritabanına başarıyla bağlandı');
  connection.release();
});

module.exports = promisePool;
