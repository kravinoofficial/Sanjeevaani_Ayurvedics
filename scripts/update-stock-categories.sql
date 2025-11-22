-- Update stock categories to Ayurvedic medicine types

-- Step 1: Drop the constraint and column that uses the enum
ALTER TABLE stock_items DROP COLUMN IF EXISTS category;

-- Step 2: Drop the old enum type
DROP TYPE IF EXISTS stock_category;

-- Step 3: Create new enum with Ayurvedic categories
CREATE TYPE stock_category AS ENUM ('lehyam', 'rasayanam', 'arishtam', 'aasavam', 'tablet', 'choornam', 'ointment', 'kashayam', 'thailam');

-- Step 4: Add the column back with the new enum
ALTER TABLE stock_items ADD COLUMN category stock_category NOT NULL DEFAULT 'tablet';

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stock_items_category ON stock_items(category);

-- Success message
SELECT 'Stock categories updated successfully to Ayurvedic medicine types' AS result;
