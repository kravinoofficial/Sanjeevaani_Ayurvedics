-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS) - SIMPLIFIED
-- ============================================
-- This script blocks direct database access via the anon key
-- Your API routes using service role key will bypass these policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatment_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create simple policies that block all anon key access
-- (Your API routes with service role will bypass these automatically)

CREATE POLICY "block_anon_users" ON users FOR ALL USING (false);
CREATE POLICY "block_anon_patients" ON patients FOR ALL USING (false);
CREATE POLICY "block_anon_op_registrations" ON op_registrations FOR ALL USING (false);
CREATE POLICY "block_anon_medicines" ON medicines FOR ALL USING (false);
CREATE POLICY "block_anon_physical_treatments" ON physical_treatments FOR ALL USING (false);
CREATE POLICY "block_anon_medicine_prescriptions" ON medicine_prescriptions FOR ALL USING (false);
CREATE POLICY "block_anon_physical_treatment_prescriptions" ON physical_treatment_prescriptions FOR ALL USING (false);
CREATE POLICY "block_anon_stock_items" ON stock_items FOR ALL USING (false);
CREATE POLICY "block_anon_stock_transactions" ON stock_transactions FOR ALL USING (false);
CREATE POLICY "block_anon_charges" ON charges FOR ALL USING (false);
CREATE POLICY "block_anon_audit_logs" ON audit_logs FOR ALL USING (false);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- WHAT THIS DOES
-- ============================================
-- 1. Enables RLS on all tables
-- 2. Blocks all direct access via anon key
-- 3. Your API routes (using service role) will still work normally
-- 4. Prevents unauthorized direct database queries
--
-- This is a simple security layer that works with your
-- server-side API architecture.
-- ============================================
