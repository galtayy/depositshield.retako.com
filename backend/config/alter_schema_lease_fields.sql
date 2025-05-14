-- DepositShield alter schema for lease fields
USE depositshield_db;

-- Alter properties table to add new lease fields
ALTER TABLE properties
ADD COLUMN move_in_date DATE NULL AFTER contract_end_date,
ADD COLUMN lease_duration INT NULL AFTER move_in_date,
ADD COLUMN lease_duration_type ENUM('months', 'years') DEFAULT 'months' AFTER lease_duration;