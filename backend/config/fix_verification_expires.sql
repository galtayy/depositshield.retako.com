-- Add verification_expires column to users table
USE depositshield_db;

-- Add verification_expires column if it does not exist
ALTER TABLE users ADD COLUMN verification_expires DATETIME NULL;