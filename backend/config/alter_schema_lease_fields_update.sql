-- DepositShield alter schema for lease fields update
USE depositshield_db;

-- Update the lease_duration_type field to include 'weeks' option
ALTER TABLE properties
MODIFY COLUMN lease_duration_type ENUM('weeks', 'months', 'years') DEFAULT 'months';