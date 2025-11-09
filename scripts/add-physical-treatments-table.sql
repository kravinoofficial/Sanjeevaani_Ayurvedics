-- Script to add physical_treatments table to existing database
-- Run this in Supabase SQL Editor if you already have the database set up

-- Step 1: Create the physical_treatments table
CREATE TABLE IF NOT EXISTS physical_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_unit TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Alter physical_treatment_prescriptions table to add treatment_id reference
-- First, check if the column already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'physical_treatment_prescriptions' 
    AND column_name = 'treatment_id'
  ) THEN
    ALTER TABLE physical_treatment_prescriptions 
    ADD COLUMN treatment_id UUID REFERENCES physical_treatments(id);
  END IF;
END $$;

-- Step 3: Add sample physical treatments
INSERT INTO physical_treatments (name, description, duration_unit, price) VALUES
('Physiotherapy', 'Physical therapy to improve movement and reduce pain', 'sessions', 50.00),
('Massage Therapy', 'Therapeutic massage for muscle relaxation', 'sessions', 40.00),
('Heat Therapy', 'Application of heat to affected areas', 'sessions', 25.00),
('Cold Therapy', 'Application of cold to reduce inflammation', 'sessions', 25.00),
('Ultrasound Therapy', 'Use of sound waves for deep tissue treatment', 'sessions', 60.00),
('Electrical Stimulation', 'TENS or EMS therapy for pain relief', 'sessions', 45.00),
('Exercise Therapy', 'Prescribed exercises for rehabilitation', 'weeks', 35.00),
('Manual Therapy', 'Hands-on techniques for joint and soft tissue', 'sessions', 55.00),
('Hydrotherapy', 'Water-based physical therapy', 'sessions', 70.00),
('Traction Therapy', 'Mechanical traction for spine treatment', 'sessions', 65.00)
ON CONFLICT DO NOTHING;

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_physical_treatment_prescriptions_treatment_id 
ON physical_treatment_prescriptions(treatment_id);

-- Step 5: Verify the changes
SELECT 'Physical treatments table created successfully!' as status;
SELECT COUNT(*) as treatment_count FROM physical_treatments;
