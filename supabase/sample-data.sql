-- ============================================
-- SANJEEVANI AYURVEDICS - SAMPLE DATA
-- ============================================
-- Run this AFTER the complete-schema.sql is executed
-- This is for DEVELOPMENT/TESTING only
-- ============================================

-- ============================================
-- 1. CREATE TEST USERS (All roles)
-- ============================================

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
-- 2. SAMPLE PHYSICAL TREATMENTS
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
-- 3. SAMPLE CHARGES
-- ============================================

INSERT INTO charges (charge_type, description, amount, is_active) VALUES
('emergency', 'Emergency consultation fee', 1000.00, true),
('follow_up', 'Follow-up consultation', 300.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SAMPLE PATIENTS
-- ============================================

INSERT INTO patients (patient_id, full_name, age, gender, phone, address) VALUES
('P001', 'Rajesh Kumar', 45, 'male', '9876543210', '123 MG Road, Bangalore'),
('P002', 'Priya Sharma', 32, 'female', '9876543211', '456 Park Street, Mumbai'),
('P003', 'Amit Patel', 28, 'male', '9876543212', '789 Lake View, Delhi'),
('P004', 'Sneha Reddy', 55, 'female', '9876543213', '321 Beach Road, Chennai'),
('P005', 'Vikram Singh', 38, 'male', '9876543214', '654 Hill Station, Pune')
ON CONFLICT (patient_id) DO NOTHING;

-- ============================================
-- 5. SAMPLE SUPPLIERS
-- ============================================

INSERT INTO suppliers (name, contact_person, phone, email, address, is_active) VALUES
('Arya Vaidya Sala', 'Ramesh Kumar', '9876543220', 'sales@aryavaidyasala.com', 'Kottakkal, Kerala', true),
('Kottakkal Ayurveda', 'Suresh Nair', '9876543221', 'info@kottakkal.com', 'Malappuram, Kerala', true),
('Dabur India Ltd', 'Priya Sharma', '9876543222', 'contact@dabur.com', 'Ghaziabad, UP', true),
('Himalaya Wellness', 'Amit Patel', '9876543223', 'sales@himalayawellness.com', 'Bangalore, Karnataka', true),
('Baidyanath Ayurved', 'Sneha Reddy', '9876543224', 'info@baidyanath.com', 'Kolkata, West Bengal', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. SAMPLE STOCK ITEMS (Ayurvedic Medicines)
-- ============================================

DO $$
DECLARE
  supplier1_id UUID;
  supplier2_id UUID;
  supplier3_id UUID;
BEGIN
  SELECT id INTO supplier1_id FROM suppliers WHERE name = 'Arya Vaidya Sala' LIMIT 1;
  SELECT id INTO supplier2_id FROM suppliers WHERE name = 'Kottakkal Ayurveda' LIMIT 1;
  SELECT id INTO supplier3_id FROM suppliers WHERE name = 'Dabur India Ltd' LIMIT 1;

  INSERT INTO stock_items (name, category, description, unit, quantity, min_quantity, price, supplier_id, location) VALUES
  ('Chyawanprash', 'lehyam', 'Immunity booster lehyam', '500g', 50, 10, 250.00, supplier3_id, 'Shelf A1'),
  ('Brahma Rasayanam', 'rasayanam', 'Brain tonic and memory enhancer', '200g', 30, 5, 450.00, supplier1_id, 'Shelf A2'),
  ('Ashwagandharishta', 'arishtam', 'Stress relief and vitality', '450ml', 40, 8, 180.00, supplier2_id, 'Shelf B1'),
  ('Drakshasava', 'aasavam', 'Digestive and appetizer', '450ml', 35, 8, 160.00, supplier1_id, 'Shelf B2'),
  ('Triphala Tablets', 'tablet', 'Digestive health tablets', '60 tablets', 100, 20, 120.00, supplier3_id, 'Shelf C1'),
  ('Trikatu Choornam', 'choornam', 'Digestive powder', '50g', 60, 15, 80.00, supplier2_id, 'Shelf C2'),
  ('Dhanwantharam Thailam', 'thailam', 'Massage oil for body pain', '200ml', 45, 10, 220.00, supplier1_id, 'Shelf D1'),
  ('Pinda Thailam', 'ointment', 'Pain relief ointment', '50g', 70, 15, 95.00, supplier2_id, 'Shelf D2'),
  ('Dasamoola Kashayam', 'kashayam', 'Decoction for respiratory health', '200ml', 25, 5, 140.00, supplier1_id, 'Shelf E1'),
  ('Amrutharishtam', 'arishtam', 'Fever and immunity', '450ml', 30, 8, 175.00, supplier2_id, 'Shelf B3')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'Patients:', COUNT(*) FROM patients
UNION ALL SELECT 'Suppliers:', COUNT(*) FROM suppliers
UNION ALL SELECT 'Stock Items:', COUNT(*) FROM stock_items
UNION ALL SELECT 'Treatments:', COUNT(*) FROM physical_treatments
UNION ALL SELECT 'Charges:', COUNT(*) FROM charges;

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
