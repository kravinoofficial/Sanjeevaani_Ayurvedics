-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This script secures your database by restricting access based on user roles
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatment_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- If you have billing tables, enable RLS on them too
-- ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Step 2: Create helper function to get current user from JWT
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::UUID;
$$ LANGUAGE SQL STABLE;

-- Step 3: Create policies for users table
-- Users can only view active users
CREATE POLICY "Users can view active users"
ON users FOR SELECT
USING (is_active = true);

-- Only admins can insert/update/delete users
CREATE POLICY "Only admins can manage users"
ON users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Step 4: Create policies for patients table
-- All authenticated users can view patients
CREATE POLICY "Authenticated users can view patients"
ON patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Receptionists and admins can insert patients
CREATE POLICY "Receptionists and admins can create patients"
ON patients FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('receptionist', 'admin', 'staff')
    AND is_active = true
  )
);

-- Only admins can delete patients
CREATE POLICY "Only admins can delete patients"
ON patients FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role = 'admin'
    AND is_active = true
  )
);

-- Step 5: Create policies for OP registrations
-- All authenticated users can view OP registrations
CREATE POLICY "Authenticated users can view OP registrations"
ON op_registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Receptionists, doctors, and admins can create OP registrations
CREATE POLICY "Staff can create OP registrations"
ON op_registrations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('receptionist', 'doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Doctors and admins can update OP registrations
CREATE POLICY "Doctors and admins can update OP registrations"
ON op_registrations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Step 6: Create policies for medicines
-- All authenticated users can view medicines
CREATE POLICY "Authenticated users can view medicines"
ON medicines FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Doctors, pharmacists, and admins can manage medicines
CREATE POLICY "Medical staff can manage medicines"
ON medicines FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('doctor', 'pharmacist', 'admin', 'staff')
    AND is_active = true
  )
);

-- Step 7: Create policies for physical treatments
-- All authenticated users can view treatments
CREATE POLICY "Authenticated users can view treatments"
ON physical_treatments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Doctors, physical medicine staff, and admins can manage treatments
CREATE POLICY "Medical staff can manage treatments"
ON physical_treatments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('doctor', 'physical_medicine', 'admin', 'staff')
    AND is_active = true
  )
);

-- Step 8: Create policies for medicine prescriptions
-- All authenticated users can view prescriptions
CREATE POLICY "Authenticated users can view medicine prescriptions"
ON medicine_prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Doctors can create prescriptions
CREATE POLICY "Doctors can create medicine prescriptions"
ON medicine_prescriptions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Pharmacists and doctors can update prescriptions
CREATE POLICY "Pharmacists can update medicine prescriptions"
ON medicine_prescriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('pharmacist', 'doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Step 9: Create policies for physical treatment prescriptions
-- All authenticated users can view treatment prescriptions
CREATE POLICY "Authenticated users can view treatment prescriptions"
ON physical_treatment_prescriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Doctors can create treatment prescriptions
CREATE POLICY "Doctors can create treatment prescriptions"
ON physical_treatment_prescriptions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Physical medicine staff can update treatment prescriptions
CREATE POLICY "Physical medicine staff can update treatment prescriptions"
ON physical_treatment_prescriptions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('physical_medicine', 'doctor', 'admin', 'staff')
    AND is_active = true
  )
);

-- Step 10: Create policies for stock management
-- All authenticated users can view stock items
CREATE POLICY "Authenticated users can view stock items"
ON stock_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Pharmacists and admins can manage stock
CREATE POLICY "Pharmacists and admins can manage stock"
ON stock_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('pharmacist', 'admin', 'staff')
    AND is_active = true
  )
);

-- All authenticated users can view stock transactions
CREATE POLICY "Authenticated users can view stock transactions"
ON stock_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND is_active = true
  )
);

-- Pharmacists and admins can create stock transactions
CREATE POLICY "Pharmacists and admins can create stock transactions"
ON stock_transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.user_id() 
    AND role IN ('pharmacist', 'admin', 'staff')
    AND is_active = true
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is enabled
-- ============================================

-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. After running this script, your anon key will be restricted by these policies
-- 2. You MUST authenticate users properly for RLS to work
-- 3. The current localStorage-based auth won't work with RLS
-- 4. You need to implement proper Supabase Auth or JWT tokens
-- 5. Test thoroughly in development before deploying to production
