-- Create admin user if not exists
-- Run this script to create or reset the admin user

-- First, delete existing admin user if any (optional)
-- DELETE FROM users WHERE email = 'admin@hospital.com';

-- Insert admin user with password: admin123
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hospital.com',
  crypt('admin123', gen_salt('bf')),
  'System Administrator',
  'admin',
  true
)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = crypt('admin123', gen_salt('bf')),
  is_active = true,
  updated_at = NOW();

-- Verify the user was created
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@hospital.com';
