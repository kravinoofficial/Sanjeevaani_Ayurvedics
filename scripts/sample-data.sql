-- ============================================
-- SAMPLE DATA & TEST USERS
-- Run this AFTER the main schema is created
-- This is for DEVELOPMENT/TESTING only
-- ============================================

-- ============================================
-- 1. CREATE TEST USERS (All roles)
-- ============================================

-- Admin User
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hospital.com',
  hash_password('admin123'),
  'System Administrator',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Staff User (Unified access to Receptionist, Doctor, Pharmacist)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'staff@hospital.com',
  hash_password('staff123'),
  'Staff Member',
  'staff',
  true
) ON CONFLICT (email) DO NOTHING;

-- Receptionist User
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'receptionist@hospital.com',
  hash_password('receptionist123'),
  'Sarah Johnson',
  'receptionist',
  true
) ON CONFLICT (email) DO NOTHING;

-- Doctor User
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'doctor@hospital.com',
  hash_password('doctor123'),
  'Dr. John Smith',
  'doctor',
  true
) ON CONFLICT (email) DO NOTHING;

-- Pharmacist User
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'pharmacist@hospital.com',
  hash_password('pharmacist123'),
  'Emily Davis',
  'pharmacist',
  true
) ON CONFLICT (email) DO NOTHING;

-- Panchakarma User
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'physio@hospital.com',
  hash_password('physio123'),
  'Michael Brown',
  'physical_medicine',
  true
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. SAMPLE MEDICINES
-- ============================================

INSERT INTO medicines (name, description, unit, price) VALUES
('Paracetamol 500mg', 'Pain reliever and fever reducer', 'Tablet', 2.50),
('Amoxicillin 250mg', 'Antibiotic for bacterial infections', 'Capsule', 5.00),
('Ibuprofen 400mg', 'Anti-inflammatory pain reliever', 'Tablet', 3.00),
('Cetirizine 10mg', 'Antihistamine for allergies', 'Tablet', 1.50),
('Omeprazole 20mg', 'Reduces stomach acid', 'Capsule', 4.00),
('Metformin 500mg', 'Diabetes medication', 'Tablet', 3.50),
('Amlodipine 5mg', 'Blood pressure medication', 'Tablet', 2.00),
('Atorvastatin 10mg', 'Cholesterol medication', 'Tablet', 6.00),
('Salbutamol Inhaler', 'Asthma relief', 'Inhaler', 15.00),
('Vitamin D3 1000IU', 'Vitamin supplement', 'Capsule', 2.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. SAMPLE PHYSICAL TREATMENTS
-- ============================================

INSERT INTO physical_treatments (name, description, duration_unit, price) VALUES
('Physiotherapy Session', 'General physiotherapy treatment', '30 mins', 50.00),
('Massage Therapy', 'Therapeutic massage', '45 mins', 60.00),
('Electrical Stimulation', 'TENS therapy for pain relief', '20 mins', 40.00),
('Ultrasound Therapy', 'Deep tissue treatment', '15 mins', 35.00),
('Hot/Cold Therapy', 'Temperature-based treatment', '30 mins', 25.00),
('Exercise Therapy', 'Guided exercise session', '45 mins', 45.00),
('Manual Therapy', 'Hands-on treatment', '30 mins', 55.00),
('Acupuncture', 'Traditional needle therapy', '30 mins', 70.00),
('Cupping Therapy', 'Suction cup treatment', '20 mins', 50.00),
('Hydrotherapy', 'Water-based therapy', '45 mins', 65.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SAMPLE CHARGES
-- ============================================

INSERT INTO charges (charge_type, description, amount, is_active) VALUES
('consultation', 'Standard consultation fee', 500.00, true),
('emergency', 'Emergency consultation fee', 1000.00, true),
('follow_up', 'Follow-up consultation', 300.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. SAMPLE PATIENTS
-- ============================================

INSERT INTO patients (patient_id, full_name, age, gender, phone, address) VALUES
('P001', 'Rajesh Kumar', 45, 'male', '9876543210', '123 MG Road, Bangalore'),
('P002', 'Priya Sharma', 32, 'female', '9876543211', '456 Park Street, Mumbai'),
('P003', 'Amit Patel', 28, 'male', '9876543212', '789 Lake View, Delhi'),
('P004', 'Sneha Reddy', 55, 'female', '9876543213', '321 Beach Road, Chennai'),
('P005', 'Vikram Singh', 38, 'male', '9876543214', '654 Hill Station, Pune')
ON CONFLICT (patient_id) DO NOTHING;

-- ============================================
-- 6. SAMPLE STOCK ITEMS
-- ============================================

INSERT INTO stock_items (name, category, description, unit, quantity, min_quantity, price, location) VALUES
('Surgical Gloves', 'supply', 'Disposable latex gloves', 'Box', 50, 10, 15.00, 'Storage Room A'),
('Syringes 5ml', 'supply', 'Disposable syringes', 'Pack', 100, 20, 8.00, 'Storage Room A'),
('Bandages', 'supply', 'Sterile bandages', 'Roll', 75, 15, 3.00, 'Storage Room B'),
('Cotton Swabs', 'consumable', 'Medical cotton swabs', 'Pack', 200, 30, 2.00, 'Storage Room B'),
('Thermometer Digital', 'equipment', 'Digital thermometer', 'Unit', 10, 3, 25.00, 'Equipment Room'),
('BP Monitor', 'equipment', 'Blood pressure monitor', 'Unit', 5, 2, 150.00, 'Equipment Room'),
('Stethoscope', 'equipment', 'Medical stethoscope', 'Unit', 8, 2, 80.00, 'Equipment Room'),
('Alcohol Swabs', 'consumable', 'Antiseptic wipes', 'Box', 150, 25, 5.00, 'Storage Room A'),
('Face Masks', 'supply', 'Surgical face masks', 'Box', 100, 20, 10.00, 'Storage Room A'),
('Hand Sanitizer', 'consumable', 'Antibacterial sanitizer', 'Bottle', 50, 10, 12.00, 'Storage Room B')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check users created
SELECT email, full_name, role FROM users ORDER BY role;

-- Check medicines count
SELECT COUNT(*) as medicine_count FROM medicines;

-- Check treatments count
SELECT COUNT(*) as treatment_count FROM physical_treatments;

-- Check patients count
SELECT COUNT(*) as patient_count FROM patients;

-- Check stock items count
SELECT COUNT(*) as stock_count FROM stock_items;

-- ============================================
-- TEST LOGIN CREDENTIALS
-- ============================================

/*
Use these credentials to test the system:

Staff (Unified Access - Receptionist, Doctor, Pharmacist):
  Email: staff@hospital.com
  Password: staff123

Admin:
  Email: admin@hospital.com
  Password: admin123

Receptionist:
  Email: receptionist@hospital.com
  Password: receptionist123

Doctor:
  Email: doctor@hospital.com
  Password: doctor123

Pharmacist:
  Email: pharmacist@hospital.com
  Password: pharmacist123

Panchakarma:
  Email: physio@hospital.com
  Password: physio123

IMPORTANT: Change these passwords in production!
*/
