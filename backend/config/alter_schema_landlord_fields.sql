-- DepositShield alter schema for landlord contact details
USE depositshield_db;

-- Alter properties table to add landlord contact fields
ALTER TABLE properties
ADD COLUMN landlord_email VARCHAR(255) NULL AFTER additional_spaces,
ADD COLUMN landlord_phone VARCHAR(20) NULL AFTER landlord_email;