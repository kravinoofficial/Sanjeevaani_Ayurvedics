-- Useful SQL scripts for managing users

-- 1. View all users
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. View users by role
SELECT email, full_name, is_active 
FROM users 
WHERE role = 'doctor'
ORDER BY full_name;

-- 3. Activate a user
UPDATE users 
SET is_active = true,
    updated_at = NOW()
WHERE email = 'user@email.com';

-- 4. Deactivate a user
UPDATE users 
SET is_active = false,
    updated_at = NOW()
WHERE email = 'user@email.com';

-- 5. Change user role
UPDATE users 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'user@email.com';

-- 6. Delete a user (use with caution!)
DELETE FROM users 
WHERE email = 'user@email.com';

-- 7. Count users by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY count DESC;

-- 8. View active users only
SELECT email, full_name, role 
FROM users 
WHERE is_active = true 
ORDER BY role, full_name;

-- 9. View inactive users
SELECT email, full_name, role, created_at 
FROM users 
WHERE is_active = false 
ORDER BY created_at DESC;

-- 10. Update user's full name
UPDATE users 
SET full_name = 'New Name',
    updated_at = NOW()
WHERE email = 'user@email.com';
