-- Billing System Tables

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_number TEXT UNIQUE NOT NULL,
  op_registration_id UUID REFERENCES op_registrations(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, partial
  payment_method TEXT, -- cash, card, upi, insurance
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill items table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- consultation, medicine, treatment, test
  item_id UUID, -- reference to medicine_id or treatment_id
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  received_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bills_patient_id ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_op_registration_id ON bills(op_registration_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_payment_status ON bills(payment_status);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);

-- Add billing fields to schema.sql if not exists
ALTER TABLE op_registrations ADD COLUMN IF NOT EXISTS consultation_fee DECIMAL(10,2) DEFAULT 500;

-- Comments
COMMENT ON TABLE bills IS 'Stores billing information for patients';
COMMENT ON TABLE bill_items IS 'Individual items in a bill';
COMMENT ON TABLE payments IS 'Payment transactions for bills';
