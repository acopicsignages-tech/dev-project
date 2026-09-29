-- V2: Add name, ration_number, and date_info to downloads table
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS ration_number VARCHAR(100);
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS date_info VARCHAR(100);
