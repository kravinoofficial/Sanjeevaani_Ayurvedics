-- Migrate medicines table to stock_items
-- This script merges the medicines functionality into stock management

-- Step 1: Migrate existing medicines to stock_items
INSERT INTO stock_items (name, category, description, unit, quantity, min_quantity, price)
SELECT 
  name,
  'tablet' as category,  -- Default category, adjust as needed
  description,
  unit,
  0 as quantity,  -- Start with 0 quantity
  10 as min_quantity,
  price
FROM medicines
ON CONFLICT DO NOTHING;

-- Step 2: Update medicine_prescriptions to reference stock_items instead of medicines
-- First, add a temporary column to store the mapping
ALTER TABLE medicine_prescriptions ADD COLUMN IF NOT EXISTS stock_item_id UUID REFERENCES stock_items(id);

-- Update the stock_item_id based on medicine name matching
UPDATE medicine_prescriptions mp
SET stock_item_id = si.id
FROM medicines m
JOIN stock_items si ON si.name = m.name
WHERE mp.medicine_id = m.id;

-- Step 3: Drop the old medicine_id foreign key constraint
ALTER TABLE medicine_prescriptions DROP CONSTRAINT IF EXISTS medicine_prescriptions_medicine_id_fkey;

-- Step 4: Drop the old medicine_id column
ALTER TABLE medicine_prescriptions DROP COLUMN IF EXISTS medicine_id;

-- Step 5: Rename stock_item_id to medicine_id for backward compatibility
ALTER TABLE medicine_prescriptions RENAME COLUMN stock_item_id TO medicine_id;

-- Step 6: Add foreign key constraint to stock_items
ALTER TABLE medicine_prescriptions 
ADD CONSTRAINT medicine_prescriptions_medicine_id_fkey 
FOREIGN KEY (medicine_id) REFERENCES stock_items(id);

-- Step 7: Drop the medicines table (optional - comment out if you want to keep it as backup)
-- DROP TABLE IF EXISTS medicines CASCADE;

-- Success message
SELECT 'Medicines successfully migrated to stock_items. Medicine prescriptions now reference stock_items.' AS result;
