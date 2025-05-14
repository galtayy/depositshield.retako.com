-- ALTER_SCHEMA_UNIT_NUMBER
-- Bu script, properties tablosuna unit_number sütununu ekler

ALTER TABLE properties
ADD COLUMN unit_number VARCHAR(20) DEFAULT NULL AFTER description;

-- Property Type alanından unit_number'a veri kopyalama
-- (Eğer property_type sayısal bir değer ise, bunu unit_number'a taşı)
UPDATE properties
SET unit_number = property_type
WHERE property_type REGEXP '^[0-9]+$';

-- Property Type alanını varsayılan bir değere ayarlama
UPDATE properties
SET property_type = 'apartment'
WHERE property_type REGEXP '^[0-9]+$' OR property_type IS NULL OR property_type = '';