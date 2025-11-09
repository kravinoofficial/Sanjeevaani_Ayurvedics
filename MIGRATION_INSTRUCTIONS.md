# Remove Stock Quantity Migration

## What Changed
Removed the `stock_quantity` column from the `medicines` table to simplify the medicine management system.

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `scripts/remove-stock-quantity.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute the migration

### Option 2: Using Command Line
```bash
# If you have psql installed and configured
psql -h your-supabase-host -U postgres -d postgres -f scripts/remove-stock-quantity.sql
```

### Option 3: Manual Execution
Run this SQL command in your database:
```sql
ALTER TABLE medicines DROP COLUMN IF EXISTS stock_quantity;
```

## Verification
After running the migration, verify the change:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medicines';
```

You should see these columns:
- id
- name
- description
- unit
- price
- created_at
- updated_at

The `stock_quantity` column should no longer appear.

## Rollback (if needed)
If you need to restore the stock_quantity column:
```sql
ALTER TABLE medicines ADD COLUMN stock_quantity INTEGER DEFAULT 0;
```
