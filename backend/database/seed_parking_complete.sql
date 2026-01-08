-- ==========================================
-- Complete Parking Data Seed Script
-- Step 1: Insert Parking Lots
-- Step 2: Insert Parking History
-- Run this in your Supabase SQL Editor
-- ==========================================

-- ==========================================
-- STEP 1: Insert Parking Lots (if they don't exist)
-- ==========================================

-- A Parking
INSERT INTO public.parking_lots (id, name, latitude, longitude, total_spots, type, is_accessible, disabled_parking_spots, operating_hours, peak_hours, created_at, updated_at)
VALUES (
  'park-1',
  'A Parking',
  31.44679,
  74.268438,
  100,
  'mixed',
  true,
  5,
  '{"open": "06:00", "close": "22:00", "days": [1, 2, 3, 4, 5, 6]}'::jsonb,
  '[{"dayOfWeek": 1, "startHour": 8, "endHour": 10, "averageOccupancy": 90}, {"dayOfWeek": 1, "startHour": 13, "endHour": 15, "averageOccupancy": 85}, {"dayOfWeek": 2, "startHour": 8, "endHour": 10, "averageOccupancy": 88}, {"dayOfWeek": 3, "startHour": 8, "endHour": 10, "averageOccupancy": 92}]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- B Parking
INSERT INTO public.parking_lots (id, name, latitude, longitude, total_spots, type, is_accessible, disabled_parking_spots, operating_hours, peak_hours, created_at, updated_at)
VALUES (
  'park-2',
  'B Parking',
  31.447502,
  74.268636,
  80,
  'car',
  true,
  3,
  '{"open": "07:00", "close": "22:00", "days": [1, 2, 3, 4, 5, 6]}'::jsonb,
  '[{"dayOfWeek": 1, "startHour": 9, "endHour": 12, "averageOccupancy": 95}, {"dayOfWeek": 2, "startHour": 9, "endHour": 12, "averageOccupancy": 93}]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- C Parking
INSERT INTO public.parking_lots (id, name, latitude, longitude, total_spots, type, is_accessible, disabled_parking_spots, operating_hours, peak_hours, created_at, updated_at)
VALUES (
  'park-3',
  'C Parking',
  31.448212,
  74.268665,
  60,
  'mixed',
  true,
  0,
  '{"open": "06:00", "close": "22:00", "days": [1, 2, 3, 4, 5, 6]}'::jsonb,
  '[{"dayOfWeek": 1, "startHour": 8, "endHour": 11, "averageOccupancy": 85}, {"dayOfWeek": 3, "startHour": 8, "endHour": 11, "averageOccupancy": 88}]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- STEP 2: Insert Parking History Data
-- ==========================================

-- A Parking (park-1) - 100 total spots
-- Monday 8 AM - Peak hour (90% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 1, 8, 88.5, NOW() - INTERVAL '14 days'),
('park-1', 1, 8, 91.2, NOW() - INTERVAL '7 days'),
('park-1', 1, 8, 89.8, NOW() - INTERVAL '21 days'),
('park-1', 1, 8, 90.5, NOW() - INTERVAL '3 days'),
('park-1', 1, 8, 92.1, NOW() - INTERVAL '10 days'),
('park-1', 1, 8, 87.3, NOW() - INTERVAL '17 days'),
('park-1', 1, 8, 90.8, NOW() - INTERVAL '4 days'),
('park-1', 1, 8, 89.2, NOW() - INTERVAL '11 days'),
('park-1', 1, 8, 91.5, NOW() - INTERVAL '18 days'),
('park-1', 1, 8, 88.9, NOW() - INTERVAL '1 day');

-- Monday 9 AM - Peak hour (90% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 1, 9, 91.2, NOW() - INTERVAL '14 days'),
('park-1', 1, 9, 89.5, NOW() - INTERVAL '7 days'),
('park-1', 1, 9, 92.8, NOW() - INTERVAL '21 days'),
('park-1', 1, 9, 88.3, NOW() - INTERVAL '3 days'),
('park-1', 1, 9, 90.1, NOW() - INTERVAL '10 days'),
('park-1', 1, 9, 91.7, NOW() - INTERVAL '17 days'),
('park-1', 1, 9, 89.9, NOW() - INTERVAL '4 days'),
('park-1', 1, 9, 90.5, NOW() - INTERVAL '11 days');

-- Monday 1 PM - Peak hour (85% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 1, 13, 84.2, NOW() - INTERVAL '14 days'),
('park-1', 1, 13, 86.5, NOW() - INTERVAL '7 days'),
('park-1', 1, 13, 83.8, NOW() - INTERVAL '21 days'),
('park-1', 1, 13, 85.1, NOW() - INTERVAL '3 days'),
('park-1', 1, 13, 87.2, NOW() - INTERVAL '10 days'),
('park-1', 1, 13, 84.9, NOW() - INTERVAL '17 days'),
('park-1', 1, 13, 85.7, NOW() - INTERVAL '4 days'),
('park-1', 1, 13, 86.3, NOW() - INTERVAL '11 days');

-- Monday 2 PM - Peak hour (85% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 1, 14, 86.1, NOW() - INTERVAL '14 days'),
('park-1', 1, 14, 84.5, NOW() - INTERVAL '7 days'),
('park-1', 1, 14, 85.8, NOW() - INTERVAL '21 days'),
('park-1', 1, 14, 87.3, NOW() - INTERVAL '3 days'),
('park-1', 1, 14, 83.9, NOW() - INTERVAL '10 days'),
('park-1', 1, 14, 86.7, NOW() - INTERVAL '17 days');

-- Tuesday 8 AM - Peak hour (88% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 2, 8, 87.2, NOW() - INTERVAL '13 days'),
('park-1', 2, 8, 89.1, NOW() - INTERVAL '6 days'),
('park-1', 2, 8, 86.5, NOW() - INTERVAL '20 days'),
('park-1', 2, 8, 88.8, NOW() - INTERVAL '2 days'),
('park-1', 2, 8, 87.9, NOW() - INTERVAL '9 days'),
('park-1', 2, 8, 89.3, NOW() - INTERVAL '16 days'),
('park-1', 2, 8, 88.1, NOW() - INTERVAL '3 days'),
('park-1', 2, 8, 87.5, NOW() - INTERVAL '10 days');

-- Wednesday 8 AM - Peak hour (92% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 3, 8, 91.5, NOW() - INTERVAL '12 days'),
('park-1', 3, 8, 93.2, NOW() - INTERVAL '5 days'),
('park-1', 3, 8, 90.8, NOW() - INTERVAL '19 days'),
('park-1', 3, 8, 92.7, NOW() - INTERVAL '1 day'),
('park-1', 3, 8, 91.9, NOW() - INTERVAL '8 days'),
('park-1', 3, 8, 93.5, NOW() - INTERVAL '15 days'),
('park-1', 3, 8, 92.1, NOW() - INTERVAL '2 days'),
('park-1', 3, 8, 91.3, NOW() - INTERVAL '9 days');

-- Off-peak hours for A Parking
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-1', 1, 6, 35.2, NOW() - INTERVAL '14 days'),
('park-1', 1, 6, 38.5, NOW() - INTERVAL '7 days'),
('park-1', 1, 7, 42.1, NOW() - INTERVAL '14 days'),
('park-1', 1, 7, 45.3, NOW() - INTERVAL '7 days'),
('park-1', 1, 16, 65.2, NOW() - INTERVAL '14 days'),
('park-1', 1, 16, 68.5, NOW() - INTERVAL '7 days'),
('park-1', 1, 17, 58.3, NOW() - INTERVAL '14 days'),
('park-1', 1, 17, 61.7, NOW() - INTERVAL '7 days'),
('park-1', 1, 18, 45.8, NOW() - INTERVAL '14 days'),
('park-1', 1, 18, 48.2, NOW() - INTERVAL '7 days');

-- B Parking (park-2) - 80 total spots
-- Monday 9 AM - Peak hour (95% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 1, 9, 94.2, NOW() - INTERVAL '14 days'),
('park-2', 1, 9, 96.1, NOW() - INTERVAL '7 days'),
('park-2', 1, 9, 93.8, NOW() - INTERVAL '21 days'),
('park-2', 1, 9, 95.5, NOW() - INTERVAL '3 days'),
('park-2', 1, 9, 94.7, NOW() - INTERVAL '10 days'),
('park-2', 1, 9, 96.3, NOW() - INTERVAL '17 days'),
('park-2', 1, 9, 95.1, NOW() - INTERVAL '4 days'),
('park-2', 1, 9, 94.9, NOW() - INTERVAL '11 days');

-- Monday 10 AM - Peak hour (95% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 1, 10, 95.8, NOW() - INTERVAL '14 days'),
('park-2', 1, 10, 94.2, NOW() - INTERVAL '7 days'),
('park-2', 1, 10, 96.5, NOW() - INTERVAL '21 days'),
('park-2', 1, 10, 95.3, NOW() - INTERVAL '3 days'),
('park-2', 1, 10, 94.6, NOW() - INTERVAL '10 days'),
('park-2', 1, 10, 96.1, NOW() - INTERVAL '17 days'),
('park-2', 1, 10, 95.7, NOW() - INTERVAL '4 days');

-- Monday 11 AM - Peak hour (95% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 1, 11, 94.5, NOW() - INTERVAL '14 days'),
('park-2', 1, 11, 95.9, NOW() - INTERVAL '7 days'),
('park-2', 1, 11, 93.7, NOW() - INTERVAL '21 days'),
('park-2', 1, 11, 96.2, NOW() - INTERVAL '3 days'),
('park-2', 1, 11, 95.1, NOW() - INTERVAL '10 days'),
('park-2', 1, 11, 94.8, NOW() - INTERVAL '17 days');

-- Tuesday 9 AM - Peak hour (93% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 2, 9, 92.5, NOW() - INTERVAL '13 days'),
('park-2', 2, 9, 94.1, NOW() - INTERVAL '6 days'),
('park-2', 2, 9, 91.8, NOW() - INTERVAL '20 days'),
('park-2', 2, 9, 93.7, NOW() - INTERVAL '2 days'),
('park-2', 2, 9, 92.9, NOW() - INTERVAL '9 days'),
('park-2', 2, 9, 94.3, NOW() - INTERVAL '16 days'),
('park-2', 2, 9, 93.2, NOW() - INTERVAL '3 days'),
('park-2', 2, 9, 92.6, NOW() - INTERVAL '10 days');

-- Tuesday 10 AM - Peak hour (93% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 2, 10, 93.8, NOW() - INTERVAL '13 days'),
('park-2', 2, 10, 92.2, NOW() - INTERVAL '6 days'),
('park-2', 2, 10, 94.5, NOW() - INTERVAL '20 days'),
('park-2', 2, 10, 93.1, NOW() - INTERVAL '2 days'),
('park-2', 2, 10, 92.7, NOW() - INTERVAL '9 days'),
('park-2', 2, 10, 94.1, NOW() - INTERVAL '16 days');

-- Off-peak hours for B Parking
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-2', 1, 7, 40.5, NOW() - INTERVAL '14 days'),
('park-2', 1, 7, 43.2, NOW() - INTERVAL '7 days'),
('park-2', 1, 13, 70.8, NOW() - INTERVAL '14 days'),
('park-2', 1, 13, 73.5, NOW() - INTERVAL '7 days'),
('park-2', 1, 17, 55.2, NOW() - INTERVAL '14 days'),
('park-2', 1, 17, 58.7, NOW() - INTERVAL '7 days');

-- C Parking (park-3) - 60 total spots
-- Monday 8 AM - Peak hour (85% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 1, 8, 83.5, NOW() - INTERVAL '14 days'),
('park-3', 1, 8, 86.2, NOW() - INTERVAL '7 days'),
('park-3', 1, 8, 84.8, NOW() - INTERVAL '21 days'),
('park-3', 1, 8, 85.7, NOW() - INTERVAL '3 days'),
('park-3', 1, 8, 87.1, NOW() - INTERVAL '10 days'),
('park-3', 1, 8, 84.3, NOW() - INTERVAL '17 days'),
('park-3', 1, 8, 86.5, NOW() - INTERVAL '4 days'),
('park-3', 1, 8, 85.2, NOW() - INTERVAL '11 days');

-- Monday 9 AM - Peak hour (85% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 1, 9, 86.1, NOW() - INTERVAL '14 days'),
('park-3', 1, 9, 84.5, NOW() - INTERVAL '7 days'),
('park-3', 1, 9, 87.3, NOW() - INTERVAL '21 days'),
('park-3', 1, 9, 85.8, NOW() - INTERVAL '3 days'),
('park-3', 1, 9, 86.7, NOW() - INTERVAL '10 days'),
('park-3', 1, 9, 84.9, NOW() - INTERVAL '17 days'),
('park-3', 1, 9, 85.5, NOW() - INTERVAL '4 days');

-- Monday 10 AM - Peak hour (85% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 1, 10, 85.3, NOW() - INTERVAL '14 days'),
('park-3', 1, 10, 87.2, NOW() - INTERVAL '7 days'),
('park-3', 1, 10, 84.1, NOW() - INTERVAL '21 days'),
('park-3', 1, 10, 86.5, NOW() - INTERVAL '3 days'),
('park-3', 1, 10, 85.9, NOW() - INTERVAL '10 days'),
('park-3', 1, 10, 86.8, NOW() - INTERVAL '17 days');

-- Wednesday 8 AM - Peak hour (88% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 3, 8, 87.2, NOW() - INTERVAL '12 days'),
('park-3', 3, 8, 89.1, NOW() - INTERVAL '5 days'),
('park-3', 3, 8, 86.5, NOW() - INTERVAL '19 days'),
('park-3', 3, 8, 88.7, NOW() - INTERVAL '1 day'),
('park-3', 3, 8, 87.9, NOW() - INTERVAL '8 days'),
('park-3', 3, 8, 89.3, NOW() - INTERVAL '15 days'),
('park-3', 3, 8, 88.1, NOW() - INTERVAL '2 days'),
('park-3', 3, 8, 87.5, NOW() - INTERVAL '9 days');

-- Wednesday 9 AM - Peak hour (88% occupancy)
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 3, 9, 88.8, NOW() - INTERVAL '12 days'),
('park-3', 3, 9, 87.2, NOW() - INTERVAL '5 days'),
('park-3', 3, 9, 89.5, NOW() - INTERVAL '19 days'),
('park-3', 3, 9, 88.1, NOW() - INTERVAL '1 day'),
('park-3', 3, 9, 87.7, NOW() - INTERVAL '8 days'),
('park-3', 3, 9, 89.1, NOW() - INTERVAL '15 days');

-- Off-peak hours for C Parking
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
('park-3', 1, 6, 32.5, NOW() - INTERVAL '14 days'),
('park-3', 1, 6, 35.8, NOW() - INTERVAL '7 days'),
('park-3', 1, 7, 38.2, NOW() - INTERVAL '14 days'),
('park-3', 1, 7, 41.5, NOW() - INTERVAL '7 days'),
('park-3', 1, 14, 62.3, NOW() - INTERVAL '14 days'),
('park-3', 1, 14, 65.7, NOW() - INTERVAL '7 days'),
('park-3', 1, 16, 52.8, NOW() - INTERVAL '14 days'),
('park-3', 1, 16, 55.2, NOW() - INTERVAL '7 days');

-- Additional data points for better predictions
-- Thursday and Friday data for all lots
INSERT INTO public.parking_history (parking_lot_id, day_of_week, hour, occupancy, created_at) VALUES
-- A Parking - Thursday
('park-1', 4, 8, 75.2, NOW() - INTERVAL '11 days'),
('park-1', 4, 8, 78.5, NOW() - INTERVAL '4 days'),
('park-1', 4, 9, 76.8, NOW() - INTERVAL '11 days'),
('park-1', 4, 9, 79.2, NOW() - INTERVAL '4 days'),
('park-1', 4, 13, 72.3, NOW() - INTERVAL '11 days'),
('park-1', 4, 13, 75.7, NOW() - INTERVAL '4 days'),
-- A Parking - Friday
('park-1', 5, 8, 68.5, NOW() - INTERVAL '10 days'),
('park-1', 5, 8, 71.2, NOW() - INTERVAL '3 days'),
('park-1', 5, 9, 70.1, NOW() - INTERVAL '10 days'),
('park-1', 5, 9, 73.8, NOW() - INTERVAL '3 days'),
-- B Parking - Thursday
('park-2', 4, 9, 82.5, NOW() - INTERVAL '11 days'),
('park-2', 4, 9, 85.2, NOW() - INTERVAL '4 days'),
('park-2', 4, 10, 83.8, NOW() - INTERVAL '11 days'),
('park-2', 4, 10, 86.5, NOW() - INTERVAL '4 days'),
-- B Parking - Friday
('park-2', 5, 9, 78.3, NOW() - INTERVAL '10 days'),
('park-2', 5, 9, 81.7, NOW() - INTERVAL '3 days'),
('park-2', 5, 10, 79.5, NOW() - INTERVAL '10 days'),
('park-2', 5, 10, 82.1, NOW() - INTERVAL '3 days'),
-- C Parking - Thursday
('park-3', 4, 8, 70.2, NOW() - INTERVAL '11 days'),
('park-3', 4, 8, 73.5, NOW() - INTERVAL '4 days'),
('park-3', 4, 9, 71.8, NOW() - INTERVAL '11 days'),
('park-3', 4, 9, 74.2, NOW() - INTERVAL '4 days'),
-- C Parking - Friday
('park-3', 5, 8, 65.3, NOW() - INTERVAL '10 days'),
('park-3', 5, 8, 68.7, NOW() - INTERVAL '3 days'),
('park-3', 5, 9, 66.5, NOW() - INTERVAL '10 days'),
('park-3', 5, 9, 69.8, NOW() - INTERVAL '3 days');

-- ==========================================
-- Verification Query
-- ==========================================
-- Run this to verify the data was inserted correctly:
-- 
-- SELECT 
--   parking_lot_id, 
--   day_of_week, 
--   hour, 
--   COUNT(*) as data_points, 
--   ROUND(AVG(occupancy), 2) as avg_occupancy
-- FROM public.parking_history
-- GROUP BY parking_lot_id, day_of_week, hour
-- ORDER BY parking_lot_id, day_of_week, hour;

