# Supplier Management Integration

## Summary
Integrated supplier management system with stock management to use database-stored suppliers instead of text input.

## Changes Made

### 1. Admin Stock Management Page (`app/dashboard/admin/stock/page.tsx`)
- Changed supplier input from text field to dropdown select
- Updated to use `supplier_id` (UUID) instead of `supplier` (text)
- Added supplier data loading from API
- Updated stock items query to include supplier relationship
- Display supplier name from joined data in table

### 2. Pharmacist Stock Management Page (`app/dashboard/pharmacist/stock/page.tsx`)
- Applied same supplier integration as admin page
- Changed supplier input from text field to dropdown select
- Updated to use `supplier_id` foreign key
- Added supplier data loading from API
- Updated stock items query to include supplier relationship
- Display supplier name from joined data in table
- Staff role also uses this page for stock management

### 3. Database Schema (`supabase/schema.sql`)
- Already has `supplier_id UUID REFERENCES suppliers(id)` in stock_items table
- Proper foreign key relationship established

### 4. Sample Data (`scripts/sample-data.sql`)
- Added 5 sample Ayurvedic medicine suppliers
- Updated stock items to use Ayurvedic categories (lehyam, rasayanam, arishtam, etc.)
- Linked stock items to suppliers using supplier_id

### 5. Supplier Management System (Already Implemented)
- Full CRUD operations at `/dashboard/admin/suppliers`
- API routes: `/api/suppliers` and `/api/suppliers/[id]`
- Features: Add, Edit, Delete, Toggle Active Status
- Search and filter functionality

## How It Works

1. **Suppliers Page**: Manage all suppliers with contact details
2. **Stock Management**: When adding/editing stock items, select supplier from dropdown
3. **Database**: Stores supplier_id as foreign key reference
4. **Display**: Shows supplier name in stock table via JOIN query

## Navigation
- Suppliers (Admin only): `/dashboard/admin/suppliers`
- Stock Management (Admin): `/dashboard/admin/stock`
- Stock Management (Pharmacist & Staff): `/dashboard/pharmacist/stock`

## Migration Scripts Created
1. `scripts/add-suppliers-simple.sql` - Simple migration to add suppliers table
2. `scripts/add-suppliers-table.sql` - Full migration with data preservation
3. `scripts/migrate-supplier-column.sql` - Migrate old supplier text column

## Next Steps
1. Run `scripts/add-suppliers-simple.sql` in Supabase SQL Editor
2. Add your suppliers via the Suppliers management page
3. Test adding new stock items with supplier selection
4. Verify supplier filtering and reporting features

## Role Access
- **Admin**: Full access to suppliers and stock management
- **Pharmacist**: Stock management with supplier selection (read-only suppliers)
- **Staff**: Stock management with supplier selection (read-only suppliers)
