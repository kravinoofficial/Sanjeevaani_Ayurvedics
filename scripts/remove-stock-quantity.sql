-- Migration: Remove stock_quantity from medicines table
-- This script removes the stock tracking feature from the medicines table

-- Remove the stock_quantity column
ALTER TABLE medicines DROP COLUMN IF EXISTS stock_quantity;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully removed stock_quantity column from medicines table';
END $$;
