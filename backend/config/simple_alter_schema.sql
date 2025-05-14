-- Simple script to add the new columns to the properties table

-- Add each column with "IF NOT EXISTS" check using the information_schema
SELECT COUNT(*) INTO @exist FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'bathrooms';
SET @query = IF(@exist = 0, 'ALTER TABLE properties ADD COLUMN bathrooms INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @exist FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'living_rooms';
SET @query = IF(@exist = 0, 'ALTER TABLE properties ADD COLUMN living_rooms INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @exist FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'square_footage';
SET @query = IF(@exist = 0, 'ALTER TABLE properties ADD COLUMN square_footage INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @exist FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'year_built';
SET @query = IF(@exist = 0, 'ALTER TABLE properties ADD COLUMN year_built INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @exist FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'properties' AND column_name = 'parking_spaces';
SET @query = IF(@exist = 0, 'ALTER TABLE properties ADD COLUMN parking_spaces INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;