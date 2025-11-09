-- Check if 'staff' value already exists in user_role enum
DO $$ 
BEGIN
    -- Try to add 'staff' to user_role enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'staff' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'staff';
    END IF;
END $$;

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
SET role = 'staff';

-- Display the created user
SELECT id, email, full_name, role, is_active, created_at
FROM users
WHERE email = 'staff@hospital.com';
