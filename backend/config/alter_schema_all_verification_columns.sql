-- Add all verification and password reset columns to users table
USE depositshield_db;

-- Verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_expires DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Password reset columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires DATETIME NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;