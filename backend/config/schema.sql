-- DepositShield database schema

-- Create database
CREATE DATABASE IF NOT EXISTS depositshield_db;
USE depositshield_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NULL,
  verification_expires DATETIME NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  reset_code VARCHAR(10) NULL,
  reset_expires DATETIME NULL,
  reset_token VARCHAR(255) NULL,
  reset_token_expires DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  address VARCHAR(255) NOT NULL,
  description TEXT,
  role_at_this_property ENUM('landlord', 'renter', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  created_by INT NOT NULL,
  type ENUM('move-in', 'move-out', 'general') NOT NULL,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  note TEXT,
  timestamp TIMESTAMP NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- Photo tags table
CREATE TABLE IF NOT EXISTS photo_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photo_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
  UNIQUE KEY (photo_id, tag)
);

-- Report view logs table
CREATE TABLE IF NOT EXISTS report_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  viewer_id INT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_reports_property_id ON reports(property_id);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_photos_report_id ON photos(report_id);
CREATE INDEX idx_photo_tags_photo_id ON photo_tags(photo_id);
CREATE INDEX idx_report_views_report_id ON report_views(report_id);
