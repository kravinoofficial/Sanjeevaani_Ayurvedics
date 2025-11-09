-- Script to create a new user
-- Replace the values below with actual user information

-- Example: Create a doctor
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'doctor@hospital.com',
  hash_password('doctor123'),
  'Dr. John Smith',
  'doctor',
  true
);

-- Example: Create a receptionist
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'receptionist@hospital.com',
  hash_password('receptionist123'),
  'Jane Doe',
  'receptionist',
  true
);

-- Example: Create a pharmacist
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'pharmacist@hospital.com',
  hash_password('pharmacist123'),
  'Mike Johnson',
  'pharmacist',
  true
);

-- Example: Create a physical medicine staff
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'physio@hospital.com',
  hash_password('physio123'),
  'Sarah Williams',
  'physical_medicine',
  true
);

-- View all users (without passwords)
SELECT id, email, full_name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;
