-- Stock Management System
-- Run this in Supabase SQL Editor

-- Create stock categories enum
CREATE TYPE stock_category AS ENUM ('medicine', 'equipment', 'supply', 'consumable');

-- Create stock items table
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category stock_category NOT NULL,
  description TEXT,
  unit TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  max_quantity INTEGER,
  price DECIMAL(10,2),
  supplier TEXT,
  location TEXT,
  expiry_date DATE,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock transactions table for tracking stock movements
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'in', 'out', 'adjustment'
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON stock_items(category);
CREATE INDEX IF NOT EXISTS idx_stock_items_quantity ON stock_items(quantity);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_stock_item ON stock_transactions(stock_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Add sample stock items
INSERT INTO stock_items (name, category, description, unit, quantity, min_quantity, price, supplier) VALUES
-- Medicines
('Paracetamol 500mg', 'medicine', 'Pain reliever and fever reducer', 'tablets', 500, 100, 2.50, 'MedSupply Co.'),
('Amoxicillin 250mg', 'medicine', 'Antibiotic', 'capsules', 300, 50, 5.00, 'PharmaCorp'),
('Ibuprofen 400mg', 'medicine', 'Anti-inflammatory', 'tablets', 400, 80, 3.00, 'MedSupply Co.'),

-- Equipment
('Blood Pressure Monitor', 'equipment', 'Digital BP monitor', 'units', 5, 2, 2500.00, 'MedTech Ltd'),
('Stethoscope', 'equipment', 'Professional stethoscope', 'units', 10, 3, 1500.00, 'MedTech Ltd'),
('Thermometer Digital', 'equipment', 'Digital thermometer', 'units', 15, 5, 300.00, 'HealthEquip'),

-- Supplies
('Surgical Gloves', 'supply', 'Latex gloves size M', 'boxes', 50, 20, 150.00, 'MedSupply Co.'),
('Syringes 5ml', 'supply', 'Disposable syringes', 'boxes', 40, 15, 200.00, 'MedSupply Co.'),
('Cotton Rolls', 'supply', 'Medical cotton rolls', 'packs', 100, 30, 50.00, 'HealthSupply'),

-- Consumables
('Bandages', 'consumable', 'Elastic bandages', 'rolls', 80, 25, 30.00, 'HealthSupply'),
('Gauze Pads', 'consumable', 'Sterile gauze pads', 'packs', 60, 20, 40.00, 'MedSupply Co.'),
('Alcohol Swabs', 'consumable', 'Antiseptic swabs', 'boxes', 70, 25, 80.00, 'HealthSupply')
ON CONFLICT DO NOTHING;

SELECT 'Stock management tables created successfully!' as status;
