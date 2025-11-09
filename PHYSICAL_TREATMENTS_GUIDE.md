# Physical Treatments Management Guide

## Overview
The Physical Treatments system allows doctors to prescribe physical therapy treatments to patients, and physical medicine staff to manage and serve these prescriptions.

## Database Schema

### physical_treatments Table
Stores the master list of available physical treatment types.

```sql
CREATE TABLE physical_treatments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_unit TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### physical_treatment_prescriptions Table
Stores prescriptions for physical treatments given to patients.

```sql
CREATE TABLE physical_treatment_prescriptions (
  id UUID PRIMARY KEY,
  op_registration_id UUID REFERENCES op_registrations(id),
  treatment_id UUID REFERENCES physical_treatments(id),
  treatment_type TEXT NOT NULL,
  instructions TEXT,
  duration TEXT,
  status prescription_status DEFAULT 'pending',
  prescribed_by UUID REFERENCES users(id),
  served_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Setup Instructions

### 1. Create Database Tables
Run the updated `supabase/schema.sql` file in your Supabase SQL Editor to create the tables.

### 2. Add Sample Treatments
Run `scripts/add-sample-treatments.sql` to populate the physical_treatments table with common treatment types:
- Physiotherapy
- Massage Therapy
- Heat Therapy
- Cold Therapy
- Ultrasound Therapy
- Electrical Stimulation
- Exercise Therapy
- Manual Therapy
- Hydrotherapy
- Traction Therapy

## User Roles and Features

### Admin
**Access:** `/dashboard/admin/physical-treatments`

**Features:**
- View all physical treatment types
- Add new treatment types
- Edit existing treatment types
- Search treatments by name

**How to Use:**
1. Navigate to "Physical Treatments" from the admin dashboard
2. Click "Add Treatment" to create a new treatment type
3. Fill in:
   - Treatment Name (required)
   - Duration Unit (e.g., sessions, weeks, days)
   - Description (optional)
4. Click "Edit" on any treatment to modify its details

### Physical Medicine Staff
**Access:** `/dashboard/physical-medicine/manage-treatments`

**Features:**
- View all available treatment types
- Search treatments by name
- Reference treatment information

**How to Use:**
1. Navigate to "Manage Treatments" from the physical medicine dashboard
2. Browse or search for treatment types
3. View treatment details including duration units and descriptions

### Doctors
**Access:** `/dashboard/doctor/serve/[id]`

**Features:**
- Prescribe physical treatments to patients
- Select from available treatment types
- Specify duration and instructions
- Combine with medicine prescriptions

**How to Use:**
1. Navigate to "OP List" and click "Serve" on a patient
2. Scroll to the "Physical Treatments" section
3. Click "Add Treatment" to add a new treatment prescription
4. Select treatment type from dropdown
5. Enter duration (e.g., "30 minutes", "2 weeks")
6. Add specific instructions (optional)
7. Click "Complete & Serve Patient" to save

## Workflow

### 1. Doctor Prescribes Treatment
```
Doctor → Serve Patient → Add Physical Treatment → Select Type → Enter Details → Complete
```

### 2. Physical Medicine Staff Serves Treatment
```
Physical Medicine → Treatments → View Pending → Mark as Served
```

## API Integration

### Load Available Treatments
```typescript
const { data: treatments } = await supabase
  .from('physical_treatments')
  .select('*')
  .order('name')
```

### Create Treatment Prescription
```typescript
const { error } = await supabase
  .from('physical_treatment_prescriptions')
  .insert({
    op_registration_id: registrationId,
    treatment_id: treatmentId,
    treatment_type: treatmentName,
    instructions: instructions,
    duration: duration,
    prescribed_by: doctorId,
  })
```

### Update Prescription Status
```typescript
const { error } = await supabase
  .from('physical_treatment_prescriptions')
  .update({ 
    status: 'served',
    served_by: staffId 
  })
  .eq('id', prescriptionId)
```

## Navigation Structure

### Admin Navigation
- Dashboard
- Users
- Doctors
- Medicines
- **Physical Treatments** ← New
- Reports

### Physical Medicine Navigation
- Dashboard
- Treatments
- **Manage Treatments** ← New

## Best Practices

1. **Treatment Types**: Keep treatment names clear and standardized
2. **Duration Units**: Use consistent units (sessions, weeks, days, minutes)
3. **Instructions**: Provide specific, actionable instructions for each treatment
4. **Status Tracking**: Always update status when treatments are served

## Troubleshooting

### Treatments Not Showing in Dropdown
- Ensure physical_treatments table is populated
- Check that treatments are ordered by name
- Verify database connection

### Cannot Add New Treatment Type
- Verify admin permissions
- Check that treatment name is not empty
- Ensure database table exists

### Prescription Not Saving
- Verify treatment_id or treatment_type is provided
- Check op_registration_id is valid
- Ensure user has doctor role

## Future Enhancements

Potential features to add:
- Treatment scheduling and appointments
- Progress tracking for ongoing treatments
- Treatment history and outcomes
- Integration with billing system
- Treatment protocols and templates
- Multi-session treatment plans
