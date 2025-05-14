-- Rapor tablosuna rooms_json kolonu ekleme
ALTER TABLE reports ADD COLUMN rooms_json TEXT AFTER description;