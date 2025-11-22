-- ============================================
-- MIGRATION: Convert supplier text to supplier_id
-- Run this ONLY if you have an old 'supplier' text column
-- ============================================

-- Step 1: Check if old supplier column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_items' AND column_name = 'supplier'
  ) THEN
    RAISE NOTICE 'Found old supplier column, migrating...';
    
    -- Step 2: Create suppliers from existing text values
    INSERT INTO suppliers (name, is_active)
    SELECT DISTINCT 
      supplier as name,
      true as is_active
    FROM stock_items 
    WHERE supplier IS NOT NULL 
      AND supplier != ''
    ON CONFLICT DO NOTHING;
    
    -- Step 3: Update stock_items to use supplier_id
    UPDATE stock_items si
    SET supplier_id = s.id
    FROM suppliers s
    WHERE si.supplier = s.name
      AND si.supplier IS NOT NULL
      AND si.supplier != '';
    
    -- Step 4: Show what will be migrated
    RAISE NOTICE 'Migrated % stock items', (
      SELECT COUNT(*) FROM stock_items WHERE supplier_id IS NOT NULL
    );
    
    -- Step 5: Drop old column (uncomment when ready)
    -- ALTER TABLE stock_items DROP COLUMN supplier;
    
    RAISE NOTICE 'Migration complete! Uncomment the DROP COLUMN line to remove old column.';
  ELSE
    RAISE NOTICE 'No old supplier column found. Already using supplier_id!';
  END IF;
END $$;

-- Verify migration
SELECT 
  si.name as item_name,
  si.supplier as old_supplier_text,
  s.name as new_supplier_name,
  si.supplier_id
FROM stock_items si
LEFT JOIN suppliers s ON si.supplier_id = s.id
WHERE si.supplier IS NOT NULL OR si.supplier_id IS NOT NULL
LIMIT 10;
