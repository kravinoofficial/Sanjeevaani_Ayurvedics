-- ============================================
-- MIGRATION: Add Medicine Categories Table
-- ============================================
-- This script creates a dynamic medicine categories table

-- Step 1: Create medicine_categories table
CREATE TABLE IF NOT EXISTS medicine_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_medicine_categories_name ON medicine_categories(name);
CREATE INDEX IF NOT EXISTS idx_medicine_categories_is_active ON medicine_categories(is_active);

-- Step 3: Insert default Ayurvedic medicine categories
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

-- Step 4: Add category_id to stock_items (if not exists)
DO $$ 
BEGIN
  -- Check if category column is TEXT (old enum)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_items' 
    AND column_name = 'category' 
    AND data_type = 'USER-DEFINED'
  ) THEN
    -- Migrate existing categories to new table
    INSERT INTO medicine_categories (name, is_active)
    SELECT DISTINCT 
      category::text as name,
      true as is_active
    FROM stock_items 
    WHERE category IS NOT NULL
    ON CONFLICT (name) DO NOTHING;
    
    -- Add new category_id column
    ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES medicine_categories(id);
    
    -- Migrate data from old category to category_id
    UPDATE stock_items si
    SET category_id = mc.id
    FROM medicine_categories mc
    WHERE LOWER(mc.name) = LOWER(si.category::text);
    
    -- Drop old category column (uncomment when ready)
    -- ALTER TABLE stock_items DROP COLUMN IF EXISTS category;
    
    RAISE NOTICE 'Migrated categories from enum to table';
  ELSE
    -- Just add category_id if it doesn't exist
    ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES medicine_categories(id);
    RAISE NOTICE 'Added category_id column';
  END IF;
END $$;

-- Step 5: Create index on stock_items category_id
CREATE INDEX IF NOT EXISTS idx_stock_items_category_id ON stock_items(category_id);

-- Step 6: Verify
SELECT 'Medicine categories created:' as status, COUNT(*) as count FROM medicine_categories;
SELECT 'Stock items with categories:' as status, COUNT(*) as count FROM stock_items WHERE category_id IS NOT NULL;
