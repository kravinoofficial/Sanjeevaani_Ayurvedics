-- ============================================
-- ADD STAFF ROLE TO SYSTEM
-- Run this to enable the unified staff login
-- ============================================

-- Add 'staff' role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Create a sample staff user (password: staff123)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'staff@hospital.com',
  crypt('staff123', gen_salt('bf')),
  'Staff User',
  'staff',
  true
)
ON CONFLICT (email) DO UPDATE
SET role = 'staff', password_hash = crypt('staff123', gen_salt('bf'));

-- Verify the staff role was added
SELECT unnest(enum_range(NULL::user_role)) AS available_roles;

-- Verify the staff user was created
SELECT email, full_name, role FROM users WHERE email = 'staff@hospital.com';
