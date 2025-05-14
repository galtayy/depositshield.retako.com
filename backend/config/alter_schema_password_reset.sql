-- Alter users table to add password reset fields
USE depositshield_db;

-- Add password reset columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;