-- Script to reset a user's password
-- Replace 'user@email.com' and 'newpassword' with actual values

-- Reset password for a specific user
UPDATE users 
SET password_hash = hash_password('newpassword123'),
    updated_at = NOW()
WHERE email = 'user@email.com';

-- Verify the update
SELECT email, full_name, role, is_active, updated_at 
FROM users 
WHERE email = 'user@email.com';

-- Reset admin password (if locked out)
UPDATE users 
SET password_hash = hash_password('admin123'),
    updated_at = NOW()
WHERE email = 'admin@hospital.com';
