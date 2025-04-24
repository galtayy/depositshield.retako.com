-- Reports tablosunu onay durumu için güncelleme
use depositshield_db;
ALTER TABLE reports
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER description,
ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL AFTER approval_status,
ADD COLUMN rejected_at TIMESTAMP NULL DEFAULT NULL AFTER approved_at,
ADD COLUMN approved_message TEXT NULL AFTER rejected_at,
ADD COLUMN rejection_message TEXT NULL AFTER approved_message;

-- Indexes
CREATE INDEX idx_reports_approval_status ON reports(approval_status);
