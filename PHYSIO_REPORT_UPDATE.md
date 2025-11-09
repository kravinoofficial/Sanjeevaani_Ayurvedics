# Physical Medicine Report Feature

## Overview
Added a report text field for physical medicine practitioners to document treatment sessions when marking treatments as served.

## Database Changes

### Migration Required
Run the following SQL script to add the report field:

```bash
# Using Supabase CLI
supabase db execute -f scripts/add-report-field.sql

# Or run directly in Supabase SQL Editor
```

The script adds a `report` TEXT column to the `physical_treatment_prescriptions` table.

## Features Added

### 1. Report Modal for Serving Treatment
- When marking a treatment as served, a modal appears
- Physical medicine practitioner must enter a report
- Report is required before submission
- Modal shows treatment details for context with blue theme

### 2. Report Modal for Canceling Treatment
- When canceling a treatment, a modal appears
- Physical medicine practitioner must enter a cancellation reason
- Reason is required before canceling
- Modal shows treatment details for context with red theme

### 3. Report Display
- Completed treatments show the report in a green box
- Cancelled treatments show the reason in a red box
- Reports are displayed with proper formatting (whitespace preserved)
- Easy to read and review past treatment sessions and cancellation reasons

### 4. User Experience
- Clean modal interface with treatment context
- Large text area for detailed reports/reasons
- Validation to ensure report/reason is not empty
- Click outside modal to cancel
- Color-coded interface (blue for serving, red for canceling)

## Usage

### Marking as Served
1. Physical medicine practitioner opens a treatment from their list
2. Clicks "Mark as Served" button
3. Modal appears with treatment details (blue theme)
4. Enters comprehensive report about:
   - Treatment provided
   - Patient response
   - Observations
   - Recommendations
5. Clicks "Submit & Mark as Served"
6. Treatment is marked as served with the report saved

### Canceling Treatment
1. Physical medicine practitioner opens a treatment from their list
2. Clicks "Cancel Treatment" button
3. Modal appears with treatment details (red theme)
4. Enters cancellation reason such as:
   - Patient unavailable
   - Equipment issue
   - Medical contraindication
   - Other reasons
5. Clicks "Submit & Cancel Treatment"
6. Treatment is marked as cancelled with the reason saved

## Files Modified

- `supabase/schema.sql` - Added report column to table definition
- `scripts/add-report-field.sql` - Migration script
- `app/dashboard/physical-medicine/treatments/[id]/page.tsx` - Added report UI and logic

## Benefits

- Better documentation of treatment sessions
- Improved patient care tracking
- Historical record of treatments provided
- Professional reporting system
