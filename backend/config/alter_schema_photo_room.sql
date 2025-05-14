-- DepositShield alter schema to add room_id to photos table
USE depositshield_db;

-- Alter photos table to add room_id column
ALTER TABLE photos
ADD COLUMN room_id VARCHAR(255) NULL AFTER report_id,
ADD COLUMN property_id INT NULL AFTER room_id;