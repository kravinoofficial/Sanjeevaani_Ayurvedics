# Stock Management System Guide

## Overview
The Stock Management system allows administrators and pharmacists to manage medicines, equipment, supplies, and consumables inventory.

## Database Schema

### stock_items Table
Stores all stock items with their details.

```sql
CREATE TABLE stock_items (
  id UUID PRIMARY KEY,
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
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### stock_transactions Table
Tracks all stock movements and changes.

```sql
CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY,
  stock_item_id UUID REFERENCES stock_items(id),
  transaction_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference_number TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP
);
```

## Stock Categories

1. **Medicine** - Pharmaceutical drugs and medications
2. **Equipment** - Medical equipment and devices
3. **Supply** - Medical supplies (gloves, syringes, etc.)
4. **Consumable** - Consumable items (bandages, gauze, etc.)

## Features

### Admin Access (`/dashboard/admin/stock`)
- Add new stock items
- Edit existing items
- Record stock transactions (in/out/adjustment)
- View stock levels and alerts
- Filter by category
- Search items
- Track low stock and out of stock items

### Pharmacist Access (`/dashboard/pharmacist/stock`)
- Same features as admin
- Manage pharmacy inventory
- Record stock movements
- Monitor medicine expiry dates

## Setup Instructions

### 1. Create Database Tables
Run `scripts/create-stock-management.sql` in Supabase SQL Editor:
```bash
# This will create:
- stock_items table
- stock_transactions table
- Sample stock data
- Necessary indexes
```

### 2. Update Existing Database
If you already have a database, run the script to add the new tables without affecting existing data.

## Usage Guide

### Adding Stock Items

1. Navigate to Stock Management
2. Click "Add Stock Item"
3. Fill in the details:
   - **Name**: Item name (required)
   - **Category**: Select category (required)
   - **Unit**: Unit of measurement (required)
   - **Initial Quantity**: Starting quantity
   - **Min Quantity**: Minimum stock level for alerts
   - **Price**: Unit price in ₹
   - **Supplier**: Supplier name
   - **Location**: Storage location
   - **Expiry Date**: For medicines
   - **Batch Number**: For tracking

### Recording Transactions

1. Click "Stock In/Out" on any item
2. Select transaction type:
   - **Stock In**: Add stock (purchase, return)
   - **Stock Out**: Remove stock (sale, usage)
   - **Adjustment**: Set exact quantity (correction)
3. Enter quantity
4. Add reason (optional)
5. Add reference number (optional, e.g., PO number)
6. Click "Record Transaction"

### Stock Status Indicators

- **Out of Stock** (Red): Quantity = 0
- **Low Stock** (Yellow): Quantity < Min Quantity
- **In Stock** (Green): Quantity >= Min Quantity

## Stock Monitoring

### Dashboard Stats
- Total Items
- Out of Stock Count
- Low Stock Count
- In Stock Count

### Filters
- Search by name or description
- Filter by category
- View all or specific categories

## Best Practices

1. **Regular Updates**: Update stock levels after every transaction
2. **Min Quantity**: Set appropriate minimum quantities for alerts
3. **Expiry Tracking**: Monitor expiry dates for medicines
4. **Batch Numbers**: Record batch numbers for traceability
5. **Reference Numbers**: Use PO numbers or invoice numbers
6. **Reasons**: Document reasons for adjustments
7. **Regular Audits**: Perform periodic stock audits

## Transaction Types

### Stock In
- New purchases
- Returns from departments
- Corrections (increase)

### Stock Out
- Sales/dispensing
- Usage in treatments
- Damaged/expired items
- Corrections (decrease)

### Adjustment
- Physical count corrections
- System corrections
- Inventory reconciliation

## Reports (Coming Soon)

Future features will include:
- Stock movement reports
- Low stock alerts
- Expiry date reports
- Supplier-wise reports
- Category-wise analysis
- Transaction history
- Stock valuation

## API Integration

### Load Stock Items
```typescript
const { data } = await supabase
  .from('stock_items')
  .select('*')
  .order('name')
```

### Record Transaction
```typescript
const { error } = await supabase
  .from('stock_transactions')
  .insert({
    stock_item_id: itemId,
    transaction_type: 'in',
    quantity: 100,
    previous_quantity: 50,
    new_quantity: 150,
    reason: 'New purchase',
    reference_number: 'PO-12345',
    performed_by: userId
  })
```

## Troubleshooting

### Items Not Showing
- Check category filter
- Clear search term
- Verify database connection

### Transaction Failed
- Check quantity is valid
- Ensure sufficient stock for "out" transactions
- Verify user permissions

### Low Stock Not Alerting
- Check min_quantity is set correctly
- Verify current quantity
- Refresh the page

## Security

- Only Admin and Pharmacist roles can access
- All transactions are logged with user ID
- Audit trail maintained in stock_transactions table
- No deletion of transaction history

## Future Enhancements

- Barcode scanning
- Automated reorder points
- Supplier management
- Purchase order integration
- Stock transfer between locations
- Mobile app for stock taking
- Email alerts for low stock
- Expiry date notifications
