-- Raporlar tablosuna arşiv bayrağı ekleyelim
use depositshield_db;
ALTER TABLE reports
ADD COLUMN is_archived BOOLEAN DEFAULT 0 AFTER approval_status,
ADD COLUMN archived_at TIMESTAMP NULL DEFAULT NULL AFTER is_archived,
ADD COLUMN archive_reason VARCHAR(255) NULL AFTER archived_at;

CREATE INDEX idx_reports_is_archived ON reports(is_archived);
