-- ============================================================
-- Co-Working Space Booking System - Seed Data
-- Run AFTER schema.sql
-- ============================================================
USE coworking_db;

-- Default space
INSERT INTO spaces (name, total_desks, description) VALUES
('Main Floor',     30, 'Open co-working floor with desks and chairs'),
('Private Pods',   10, 'Semi-private pods for focused work'),
('Conference Room', 5, 'Meeting room with projector and whiteboard');

-- Default inventory
INSERT INTO inventory (item_name, category, quantity, unit) VALUES
('Standard Desk',    'desk',         30, 'unit'),
('Ergonomic Chair',  'chair',        40, 'unit'),
('Power Strip',      'power_outlet', 20, 'unit'),
('Desktop Computer', 'computer',     10, 'unit'),
('Coffee',           'snack',       100, 'cup'),
('Snack Bar',        'snack',        50, 'item');

-- CCTV cameras (mock)
INSERT INTO cctv_cameras (name, location, stream_url) VALUES
('CAM-01', 'Main Entrance',  'mock://cam01'),
('CAM-02', 'Main Floor',     'mock://cam02'),
('CAM-03', 'Private Pods',   'mock://cam03'),
('CAM-04', 'Conference Room','mock://cam04');

-- NOTE: User accounts are seeded via the application (see backend/utils/seed.js)
-- Default accounts after running `node backend/utils/seed.js`:
--   manager@cowork.com  / Manager@123
--   employee@cowork.com / Employee@123
--   customer@cowork.com / Customer@123
