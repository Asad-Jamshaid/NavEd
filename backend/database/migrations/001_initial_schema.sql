-- ==========================================
-- NavEd Database Schema
-- Supabase PostgreSQL Migration
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parking lots (base data)
CREATE TABLE IF NOT EXISTS public.parking_lots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  total_spots INTEGER NOT NULL CHECK (total_spots > 0),
  type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle', 'bicycle', 'mixed')),
  is_accessible BOOLEAN DEFAULT false,
  disabled_parking_spots INTEGER DEFAULT 0 CHECK (disabled_parking_spots >= 0 AND disabled_parking_spots <= total_spots),
  operating_hours JSONB,
  peak_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time parking updates (crowdsourced)
CREATE TABLE IF NOT EXISTS public.parking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  available_spots INTEGER NOT NULL CHECK (available_spots >= 0),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  confidence DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historical data for predictions
CREATE TABLE IF NOT EXISTS public.parking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  occupancy DECIMAL(5,2) NOT NULL CHECK (occupancy >= 0 AND occupancy <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User parked vehicles
CREATE TABLE IF NOT EXISTS public.parked_vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parking_lot_id TEXT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  spot_number TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  photo_uri TEXT,
  notes TEXT,
  parked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parking_updates_lot_time ON parking_updates(parking_lot_id, created_at DESC);
-- Note: Removed idx_parking_updates_recent partial index as it becomes stale
-- Use idx_parking_updates_lot_time for recent queries instead
CREATE INDEX IF NOT EXISTS idx_parking_history_lot_day_hour ON parking_history(parking_lot_id, day_of_week, hour);
CREATE INDEX IF NOT EXISTS idx_parking_history_lot_time ON parking_history(parking_lot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parked_vehicles_user ON parked_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_parked_vehicles_lot ON parked_vehicles(parking_lot_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parked_vehicles ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Parking lots: Public read, admin write (for now, allow all reads)
CREATE POLICY "Anyone can view parking lots" ON public.parking_lots
  FOR SELECT USING (true);

-- Parking updates: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can view parking updates" ON public.parking_updates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert parking updates" ON public.parking_updates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND reported_by = auth.uid());

-- Parking history: Public read, authenticated users can insert
CREATE POLICY "Anyone can view parking history" ON public.parking_history
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert parking history" ON public.parking_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Parked vehicles: Users can only access their own vehicles
CREATE POLICY "Users can view own parked vehicles" ON public.parked_vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parked vehicles" ON public.parked_vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parked vehicles" ON public.parked_vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own parked vehicles" ON public.parked_vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parking_lots_updated_at
  BEFORE UPDATE ON public.parking_lots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();



