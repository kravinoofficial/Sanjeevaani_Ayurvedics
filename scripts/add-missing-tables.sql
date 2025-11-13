-- Add missing tables that might be referenced in the application
-- Run this if you're getting errors about missing tables

-- Charges table (for consultation fees, etc.)
CREATE TABLE IF NOT EXISTS charges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  charge_type TEXT NOT NULL,
  charge_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default consultation charge
INSERT INTO charges (charge_type, charge_name, amount, description, is_active)
VALUES ('consultation', 'Consultation Fee', 150.00, 'Standard consultation fee', true)
ON CONFLICT DO NOTHING;

-- Enable RLS on charges table
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;

-- Create policy to block anon access
CREATE POLICY "block_anon_charges" ON charges FOR ALL USING (false);

-- Audit logs table (for security tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to block anon access
CREATE POLICY "block_anon_audit_logs" ON audit_logs FOR ALL USING (false);

-- Verify tables were created
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('charges', 'audit_logs')
ORDER BY tablename;
