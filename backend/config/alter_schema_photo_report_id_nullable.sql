-- Make report_id column nullable in photos table
USE depositshield_db;

ALTER TABLE photos
MODIFY COLUMN report_id INT NULL;