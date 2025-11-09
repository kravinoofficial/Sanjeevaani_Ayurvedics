-- Alternative approach: Recreate the enum with the new value
-- WARNING: This requires dropping and recreating the enum, which is more complex

-- Step 1: Create a new enum type with all values including 'staff'
DO $$ 
BEGIN
    -- Check if the new enum type doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
        CREATE TYPE user_role_new AS ENUM ('admin', 'receptionist', 'doctor', 'pharmacist', 'physical_medicine', 'staff');
    END IF;
END $$;

-- Step 2: Add a temporary column with the new type
ALTER TABLE users ADD COLUMN role_new user_role_new;

-- Step 3: Copy data from old column to new column
UPDATE users SET role_new = role::text::user_role_new;

-- Step 4: Drop the old column
ALTER TABLE users DROP COLUMN role;

-- Step 5: Rename the new column to the original name
ALTER TABLE users RENAME COLUMN role_new TO role;

-- Step 6: Drop the old enum type
DROP TYPE user_role;

-- Step 7: Rename the new enum type to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 8: Create a sample staff user (password: staff123)
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
