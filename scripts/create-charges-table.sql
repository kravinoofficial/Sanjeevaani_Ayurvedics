-- Consultation Fee Management Table

CREATE TABLE IF NOT EXISTS charges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  charge_type TEXT NOT NULL DEFAULT 'consultation',
  charge_name TEXT NOT NULL DEFAULT 'Consultation Fee',
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default consultation fee (only one)
INSERT INTO charges (charge_type, charge_name, amount, description, is_active) VALUES
  ('consultation', 'Consultation Fee', 500.00, 'Standard consultation fee for all appointments', true)
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_charges_charge_type ON charges(charge_type);

-- Comment
COMMENT ON TABLE charges IS 'Stores the consultation fee for the hospital';
