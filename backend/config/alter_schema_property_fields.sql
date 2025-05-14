-- DepositShield alter schema for additional property fields
USE depositshield_db;

-- First check if the column exists and add it if it doesn't
SET @dbname = DATABASE();
SET @tablename = "properties";

-- Check and add deposit_amount
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'deposit_amount';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN deposit_amount DECIMAL(10, 2) NULL AFTER role_at_this_property',
  'SELECT "deposit_amount column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add contract_start_date
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'contract_start_date';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN contract_start_date DATE NULL AFTER deposit_amount',
  'SELECT "contract_start_date column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add contract_end_date
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'contract_end_date';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN contract_end_date DATE NULL AFTER contract_start_date',
  'SELECT "contract_end_date column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add kitchen_count
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'kitchen_count';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN kitchen_count INT NULL AFTER contract_end_date',
  'SELECT "kitchen_count column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add additional_spaces
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'additional_spaces';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN additional_spaces TEXT NULL AFTER kitchen_count',
  'SELECT "additional_spaces column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add bathrooms
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'bathrooms';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN bathrooms INT NULL AFTER additional_spaces',
  'SELECT "bathrooms column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add living_rooms
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'living_rooms';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN living_rooms INT NULL AFTER bathrooms',
  'SELECT "living_rooms column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add square_footage
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'square_footage';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN square_footage INT NULL AFTER living_rooms',
  'SELECT "square_footage column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add year_built
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'year_built';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN year_built INT NULL AFTER square_footage',
  'SELECT "year_built column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add parking_spaces
SELECT COUNT(*) INTO @exist FROM information_schema.columns
  WHERE table_schema = @dbname AND table_name = @tablename AND column_name = 'parking_spaces';

SET @query = IF(@exist <= 0,
  'ALTER TABLE properties ADD COLUMN parking_spaces INT NULL AFTER year_built',
  'SELECT "parking_spaces column already exists"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;