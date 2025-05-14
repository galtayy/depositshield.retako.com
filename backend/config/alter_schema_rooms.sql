-- DepositShield alter schema for rooms storage
USE depositshield_db;

-- Alter properties table to add rooms JSON storage
ALTER TABLE properties
ADD COLUMN rooms_json JSON NULL AFTER landlord_phone;