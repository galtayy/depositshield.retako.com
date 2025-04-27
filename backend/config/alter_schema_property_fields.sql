-- DepositShield alter schema for additional property fields
USE depositshield_db;

-- Alter properties table to add new fields
ALTER TABLE properties
ADD COLUMN deposit_amount DECIMAL(10, 2) NULL AFTER role_at_this_property,
ADD COLUMN contract_start_date DATE NULL AFTER deposit_amount,
ADD COLUMN contract_end_date DATE NULL AFTER contract_start_date,
ADD COLUMN kitchen_count INT NULL AFTER contract_end_date,
ADD COLUMN additional_spaces TEXT NULL AFTER kitchen_count;