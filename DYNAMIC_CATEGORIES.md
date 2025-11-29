# Dynamic Medicine Categories System

## Summary
Converted hardcoded medicine categories to a dynamic database-driven system with full CRUD management.

## Changes Made

### 1. Database Migration (`scripts/add-medicine-categories.sql`)
- Created `medicine_categories` table with fields: id, name, description, is_active
- Added indexes for performance
- Inserted default Ayurvedic categories (Lehyam, Rasayanam, Arishtam, etc.)
- Added `category_id` foreign key to `stock_items` table
- Migration script handles conversion from old enum to new table

### 2. API Routes
**`/api/medicine-categories`**
- GET: Fetch all categories
- POST: Create new category (admin/staff only)

**`/api/medicine-categories/[id]`**
- PUT: Update category (admin/staff only)
- DELETE: Delete category (admin/staff only, prevents deletion if in use)

### 3. Management Page (`/dashboard/admin/categories`)
- Full CRUD interface for managing categories
- Search functionality
- Toggle active/inactive status
- Prevents deletion of categories in use
- Accessible by Admin and Staff roles

### 4. Updated Stock Management Pages
**Admin Stock (`/dashboard/admin/stock`)**
- Loads categories dynamically from database
- Category filter dropdown populated from active categories
- Add/Edit modals use dynamic category dropdowns

**Pharmacist Stock (`/dashboard/pharmacist/stock`)**
- Same dynamic category loading as admin
- All category dropdowns populated from database

### 5. Navigation Updates
- Added "Medicine Categories" link to Admin navigation
- Added "Medicine Categories" link to Staff navigation

## Database Schema

```sql
CREATE TABLE medicine_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- stock_items now references categories
ALTER TABLE stock_items 
  ADD COLUMN category_id UUID REFERENCES medicine_categories(id);
```

## How to Use

### 1. Run Migration
Execute `scripts/add-medicine-categories.sql` in Supabase SQL Editor to:
- Create the categories table
- Insert default categories
- Add category_id to stock_items

### 2. Manage Categories
- Admin/Staff: Navigate to "Medicine Categories"
- Add new categories as needed
- Edit descriptions
- Toggle active/inactive status
- Delete unused categories

### 3. Stock Management
- When adding/editing stock items, select from available active categories
- Categories are loaded dynamically
- Only active categories appear in dropdowns

## Benefits

1. **Flexibility**: Add/remove categories without code changes
2. **Consistency**: Single source of truth for categories
3. **Control**: Enable/disable categories as needed
4. **Safety**: Prevents deletion of categories in use
5. **Scalability**: Easy to add new medicine types

## Role Access

- **Admin**: Full access to category management
- **Staff**: Full access to category management
- **Pharmacist**: Can view and use categories in stock management
- **Others**: Read-only access through stock pages

## Default Categories

1. Lehyam - Semi-solid preparations with honey or jaggery base
2. Rasayanam - Rejuvenating tonics and supplements
3. Arishtam - Fermented liquid preparations
4. Aasavam - Fermented herbal wines
5. Tablet - Compressed herbal tablets
6. Choornam - Herbal powders
7. Ointment - External application preparations
8. Kashayam - Herbal decoctions
9. Thailam - Medicated oils
