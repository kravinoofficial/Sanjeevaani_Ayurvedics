-- Fix admin password issue
-- Run this in Supabase SQL Editor

-- Step 1: Delete existing admin user
DELETE FROM users WHERE email = 'admin@hospital.com';

-- Step 2: Create admin user with fresh password hash
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hospital.com',
  crypt('admin123', gen_salt('bf')),
  'System Administrator',
  'admin',
  true
);

-- Step 3: Verify it works
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  verify_password('admin123', password_hash) as password_works
FROM users 
WHERE email = 'admin@hospital.com';

-- Expected result: password_works should be TRUE
