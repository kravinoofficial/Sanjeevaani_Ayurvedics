-- ============================================
-- SANJEEVANI AYURVEDICS - COMPLETE DATABASE SCHEMA
-- ============================================
-- This is the unified schema file that creates all database objects
-- Run this script once in Supabase SQL Editor to set up the complete database
-- ============================================

-- ============================================
-- 1. EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. ENUM TYPES
-- ============================================

-- User roles enum (includes staff role for unified access)
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'doctor', 'pharmacist', 'physical_medicine', 'staff');

-- Prescription status enum
CREATE TYPE prescription_status AS ENUM ('pending', 'served', 'cancelled');

-- Stock category enum (Ayurvedic medicine types)
CREATE TYPE stock_category AS ENUM ('lehyam', 'rasayanam', 'arishtam', 'aasavam', 'tablet', 'choornam', 'ointment', 'kashayam', 'thailam');

-- ============================================
-- 3. FUNCTIONS
-- ============================================

-- Function to hash passwords
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CORE TABLES
-- ============================================

-- Users table (table-based authentication)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- OP Registrations
CREATE TABLE op_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  registration_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'waiting',
  doctor_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Suppliers table
CREATE TABLE suppliers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicine categories table (dynamic categories)
CREATE TABLE medicine_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock items table
CREATE TABLE stock_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category stock_category NOT NULL DEFAULT 'tablet',
  category_id UUID REFERENCES medicine_categories(id),
  description TEXT,
  unit TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  max_quantity INTEGER,
  price DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id),
  location TEXT,
  expiry_date DATE,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock transactions table for tracking stock movements
CREATE TABLE stock_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physical treatments table
CREATE TABLE physical_treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_unit TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicine prescriptions (references stock_items)
CREATE TABLE medicine_prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  op_registration_id UUID REFERENCES op_registrations(id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES stock_items(id),
  quantity INTEGER NOT NULL,
  dosage TEXT,
  instructions TEXT,
  status prescription_status DEFAULT 'pending',
  prescribed_by UUID REFERENCES users(id),
  served_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Physical treatment prescriptions
CREATE TABLE physical_treatment_prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  op_registration_id UUID REFERENCES op_registrations(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES physical_treatments(id),
  treatment_type TEXT NOT NULL,
  instructions TEXT,
  duration TEXT,
  report TEXT,
  status prescription_status DEFAULT 'pending',
  prescribed_by UUID REFERENCES users(id),
  served_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Charges table (for consultation fees, treatment charges, etc.)
CREATE TABLE charges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  charge_type TEXT NOT NULL,
  charge_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table (for security and compliance)
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medicines table (legacy, can be used for migration)
CREATE TABLE medicines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Patients indexes
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_phone ON patients(phone);

-- OP Registrations indexes
CREATE INDEX idx_op_registrations_patient_id ON op_registrations(patient_id);
CREATE INDEX idx_op_registrations_doctor_id ON op_registrations(doctor_id);
CREATE INDEX idx_op_registrations_date ON op_registrations(registration_date);

-- Suppliers indexes
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- Medicine categories indexes
CREATE INDEX idx_medicine_categories_name ON medicine_categories(name);
CREATE INDEX idx_medicine_categories_is_active ON medicine_categories(is_active);

-- Stock items indexes
CREATE INDEX idx_stock_items_category ON stock_items(category);
CREATE INDEX idx_stock_items_category_id ON stock_items(category_id);
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);
CREATE INDEX idx_stock_items_supplier ON stock_items(supplier_id);
CREATE INDEX idx_stock_items_name ON stock_items(name);

-- Stock transactions indexes
CREATE INDEX idx_stock_transactions_stock_item ON stock_transactions(stock_item_id);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Prescriptions indexes
CREATE INDEX idx_medicine_prescriptions_status ON medicine_prescriptions(status);
CREATE INDEX idx_medicine_prescriptions_op ON medicine_prescriptions(op_registration_id);
CREATE INDEX idx_physical_treatment_prescriptions_status ON physical_treatment_prescriptions(status);
CREATE INDEX idx_physical_treatment_prescriptions_op ON physical_treatment_prescriptions(op_registration_id);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE op_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_treatment_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_categories ENABLE ROW LEVEL SECURITY;

-- Create policies that block all anon key access
-- (API routes with service role will bypass these automatically)
CREATE POLICY "block_anon_users" ON users FOR ALL USING (false);
CREATE POLICY "block_anon_patients" ON patients FOR ALL USING (false);
CREATE POLICY "block_anon_op_registrations" ON op_registrations FOR ALL USING (false);
CREATE POLICY "block_anon_medicines" ON medicines FOR ALL USING (false);
CREATE POLICY "block_anon_physical_treatments" ON physical_treatments FOR ALL USING (false);
CREATE POLICY "block_anon_medicine_prescriptions" ON medicine_prescriptions FOR ALL USING (false);
CREATE POLICY "block_anon_physical_treatment_prescriptions" ON physical_treatment_prescriptions FOR ALL USING (false);
CREATE POLICY "block_anon_stock_items" ON stock_items FOR ALL USING (false);
CREATE POLICY "block_anon_stock_transactions" ON stock_transactions FOR ALL USING (false);
CREATE POLICY "block_anon_charges" ON charges FOR ALL USING (false);
CREATE POLICY "block_anon_audit_logs" ON audit_logs FOR ALL USING (false);
CREATE POLICY "block_anon_suppliers" ON suppliers FOR ALL USING (false);
CREATE POLICY "block_anon_medicine_categories" ON medicine_categories FOR ALL USING (false);

-- ============================================
-- 7. DEFAULT DATA
-- ============================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hospital.com',
  crypt('admin123', gen_salt('bf', 10)),
  'System Administrator',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default consultation charge
INSERT INTO charges (charge_type, charge_name, amount, description, is_active)
VALUES ('consultation', 'Consultation Fee', 150.00, 'Standard consultation fee', true);

-- Insert default Ayurvedic medicine categories
INSERT INTO medicine_categories (name, description, is_active) VALUES
('Lehyam', 'Semi-solid preparations with honey or jaggery base', true),
('Rasayanam', 'Rejuvenating tonics and supplements', true),
('Arishtam', 'Fermented liquid preparations', true),
('Aasavam', 'Fermented herbal wines', true),
('Tablet', 'Compressed herbal tablets', true),
('Choornam', 'Herbal powders', true),
('Ointment', 'External application preparations', true),
('Kashayam', 'Herbal decoctions', true),
('Thailam', 'Medicated oils', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all tables were created
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✓ Complete schema created successfully!';
  RAISE NOTICE '✓ All tables, indexes, and policies applied';
  RAISE NOTICE '✓ Default admin user created (admin@hospital.com / admin123)';
  RAISE NOTICE '✓ Default medicine categories added';
  RAISE NOTICE '============================================';
END $$;
