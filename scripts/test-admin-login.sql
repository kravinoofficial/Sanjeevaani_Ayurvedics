-- Test admin login credentials
-- This script helps verify if the admin user exists and password works

-- 1. Check if admin user exists
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  is_active,
  created_at
FROM users 
WHERE email = 'admin@hospital.com';

-- 2. Test password verification (should return true)
SELECT verify_password('admin123', password_hash) as password_valid
FROM users 
WHERE email = 'admin@hospital.com';

-- 3. Check all users in the system
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  is_active
FROM users 
ORDER BY created_at DESC;

-- 4. Check RLS status on users table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- 5. Check RLS policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users';
