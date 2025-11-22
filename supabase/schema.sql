-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'receptionist', 'doctor', 'pharmacist', 'physical_medicine', 'staff');

-- Prescription status enum
CREATE TYPE prescription_status AS ENUM ('pending', 'served', 'cancelled');

-- Stock category enum (Ayurvedic medicine types)
CREATE TYPE stock_category AS ENUM ('lehyam', 'rasayanam', 'arishtam', 'aasavam', 'tablet', 'choornam', 'ointment', 'kashayam', 'thailam');

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

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

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

-- Medicine prescriptions (now references stock_items)
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

-- Note: Row Level Security is not used with table-based authentication
-- Access control is handled at the application level

-- Indexes for performance
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_op_registrations_patient_id ON op_registrations(patient_id);
CREATE INDEX idx_op_registrations_doctor_id ON op_registrations(doctor_id);
CREATE INDEX idx_medicine_prescriptions_status ON medicine_prescriptions(status);
CREATE INDEX idx_physical_treatment_prescriptions_status ON physical_treatment_prescriptions(status);

-- Insert default admin user (password: admin123)
-- Password hash is generated using bcrypt
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@hospital.com',
  crypt('admin123', gen_salt('bf', 10)),
  'System Administrator',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Stock Management Tables

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

-- Create index for suppliers
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- Stock items table
CREATE TABLE stock_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category stock_category NOT NULL,
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

-- Indexes for stock management
CREATE INDEX idx_stock_items_category ON stock_items(category);
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);
CREATE INDEX idx_stock_transactions_stock_item ON stock_transactions(stock_item_id);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);

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

-- Insert default consultation charge
INSERT INTO charges (charge_type, charge_name, amount, description, is_active)
VALUES ('consultation', 'Consultation Fee', 150.00, 'Standard consultation fee', true);

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

-- Indexes for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
