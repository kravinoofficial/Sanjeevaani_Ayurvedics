-- ============================================
-- MIGRATION: Add Suppliers Table and Update Stock Items
-- ============================================
-- This script adds the suppliers table and migrates existing stock items
-- to use supplier_id foreign key instead of supplier text field

-- ============================================
-- 1. CREATE SUPPLIERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- ============================================
-- 2. ADD SUPPLIER_ID COLUMN TO STOCK_ITEMS (if not exists)
-- ============================================

-- Add supplier_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_items' AND column_name = 'supplier_id'
  ) THEN
    ALTER TABLE stock_items ADD COLUMN supplier_id UUID REFERENCES suppliers(id);
    CREATE INDEX idx_stock_items_supplier ON stock_items(supplier_id);
  END IF;
END $$;

-- ============================================
-- 3. MIGRATE EXISTING SUPPLIER DATA
-- ============================================

-- Create suppliers from existing stock_items supplier text field (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_items' AND column_name = 'supplier'
  ) THEN
    -- Insert unique suppliers from stock_items
    INSERT INTO suppliers (name, is_active)
    SELECT DISTINCT 
      supplier as name,
      true as is_active
    FROM stock_items 
    WHERE supplier IS NOT NULL 
      AND supplier != ''
      AND NOT EXISTS (
        SELECT 1 FROM suppliers WHERE name = stock_items.supplier
      );

    -- Update stock_items to use supplier_id
    UPDATE stock_items si
    SET supplier_id = s.id
    FROM suppliers s
    WHERE si.supplier = s.name
      AND si.supplier IS NOT NULL
      AND si.supplier != '';

    -- Drop the old supplier text column
    ALTER TABLE stock_items DROP COLUMN IF EXISTS supplier;
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Show suppliers count
SELECT COUNT(*) as total_suppliers FROM suppliers;

-- Show active suppliers
SELECT COUNT(*) as active_suppliers FROM suppliers WHERE is_active = true;

-- Show stock items with suppliers
SELECT 
  COUNT(*) as items_with_supplier 
FROM stock_items 
WHERE supplier_id IS NOT NULL;

-- Show stock items without suppliers
SELECT 
  COUNT(*) as items_without_supplier 
FROM stock_items 
WHERE supplier_id IS NULL;

-- List all suppliers
SELECT 
  id,
  name,
  contact_person,
  phone,
  is_active,
  created_at
FROM suppliers
ORDER BY name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✓ Suppliers table created successfully';
  RAISE NOTICE '✓ Stock items migrated to use supplier_id';
  RAISE NOTICE '✓ Migration completed!';
END $$;
