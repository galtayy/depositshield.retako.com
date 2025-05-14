-- Alter users table to add verification fields
USE depositshield_db;

-- Add verification_code and is_verified columns to users table
ALTER TABLE users ADD COLUMN verification_code VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;