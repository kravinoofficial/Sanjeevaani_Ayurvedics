# Quick Reference Guide

## 🔑 Default Login Credentials

After setup, use these credentials:
- **Email**: admin@hospital.com
- **Password**: admin123 (or what you set during setup)

## 📋 Common Tasks

### As Admin

#### Add a New User
1. Navigate to **Users** page
2. Click **Add User** button
3. Fill in: Email, Password, Full Name, Role
4. Click **Create User**

#### Add Medicine to Inventory
1. Navigate to **Medicines** page
2. Click **Add Medicine** button
3. Fill in: Name, Unit, Stock Quantity, Price, Description
4. Click **Add Medicine**

#### View Reports
1. Navigate to **Reports** page
2. View real-time statistics cards
3. Monitor low stock alerts

### As Receptionist

#### Register a New Patient
1. Navigate to **Patients** page
2. Click **Add Patient** button
3. Fill in patient details
4. Click **Add Patient**

#### Create OP Registration
1. Navigate to **OP Registration** page
2. Select patient from dropdown
3. Add any notes
4. Click **Register Patient**

### As Doctor

#### Serve a Patient
1. Navigate to **OP List** page
2. Click **Serve** button for a patient
3. Add medicine prescriptions:
   - Click **Add Medicine**
   - Select medicine, quantity, dosage, instructions
4. Add physical treatments:
   - Click **Add Treatment**
   - Enter treatment type, duration, instructions
5. Click **Complete & Submit**

### As Pharmacist

#### Process Prescription
1. Navigate to **Prescriptions** page
2. View pending prescriptions
3. Click **Served** to mark as dispensed
4. Or click **Cancel** if needed

### As Physical Medicine

#### Process Treatment
1. Navigate to **Treatments** page
2. View pending treatments
3. Click **Served** to mark as completed
4. Or click **Cancel** if needed

## 🔍 Search & Filter

### Search Patients
- Use search bar on Patients page
- Search by: Patient ID, Name

### Search Medicines
- Use search bar on Medicines page
- Search by: Medicine name, Description

### Search Users
- Use search bar on Users page
- Search by: Name, Email, Role

## 📊 Understanding Status Badges

### User Status
- 🟢 **Active** - User can login and access system
- 🔴 **Inactive** - User cannot login

### Stock Status
- 🟢 **In Stock** - Quantity ≥ 10
- 🟡 **Low Stock** - Quantity < 10
- 🔴 **Out of Stock** - Quantity = 0

### Prescription Status
- 🟡 **Pending** - Waiting to be processed
- 🟢 **Served** - Completed/Dispensed
- 🔴 **Cancelled** - Cancelled by staff

### OP Registration Status
- 🟡 **Waiting** - Patient in queue
- 🟢 **Completed** - Doctor has served patient

## 🎨 Color Coding

### Role Colors
- 🟣 **Admin** - Purple
- 🔵 **Receptionist** - Blue
- 🟢 **Doctor** - Green
- 🟠 **Pharmacist** - Orange
- 🌸 **Physical Medicine** - Pink

## ⚡ Keyboard Shortcuts

- **Tab** - Navigate between form fields
- **Enter** - Submit forms
- **Esc** - Close modals (when implemented)

## 🔔 Important Notes

### For Admins
- Always create a strong password for new users
- Regularly check low stock medicines
- Monitor pending prescriptions and treatments
- Keep medicine inventory updated

### For Receptionists
- Ensure patient ID is unique
- Verify patient details before registration
- Add relevant notes in OP registration

### For Doctors
- Review patient details before prescribing
- Specify clear dosage instructions
- Add treatment duration for physical therapy
- Complete consultation to update status

### For Pharmacists
- Check medicine availability before serving
- Verify patient identity
- Update stock after dispensing (future feature)
- Cancel only when necessary

### For Physical Medicine Staff
- Review treatment instructions carefully
- Verify patient identity
- Mark as served only after completion
- Cancel only when necessary

## 🚨 Troubleshooting Quick Fixes

### Can't Login
1. Check email and password
2. Verify account is active (ask admin)
3. Clear browser cache
4. Try different browser

### Page Not Loading
1. Refresh the page (F5)
2. Check internet connection
3. Clear browser cache
4. Contact admin

### Can't See Data
1. Verify you have correct permissions
2. Check if data exists
3. Try searching with different terms
4. Refresh the page

### Form Not Submitting
1. Check all required fields are filled
2. Verify data format (numbers, emails)
3. Check for error messages
4. Try again after a moment

## 📱 Mobile Usage

### Best Practices
- Use landscape mode for tables
- Scroll horizontally on wide tables
- Use search to find specific items
- Tap menu icon for navigation

## 🔐 Security Best Practices

1. **Never share your password**
2. **Logout when leaving workstation**
3. **Use strong passwords**
4. **Report suspicious activity**
5. **Don't access from public computers**

## 📞 Getting Help

### If You Need Help
1. Check this Quick Reference
2. Review SETUP.md for technical issues
3. Check FEATURES.md for feature details
4. Contact your system administrator

## 💡 Tips & Tricks

### Efficiency Tips
- Use search instead of scrolling
- Bookmark frequently used pages
- Keep patient IDs handy
- Use clear, concise notes
- Process prescriptions promptly

### Data Entry Tips
- Double-check patient details
- Use standard abbreviations
- Be specific in instructions
- Include all relevant information
- Verify before submitting

## 🎯 Workflow Summary

### Patient Journey
```
Receptionist → Doctor → Pharmacist/Physical Medicine
   (Register)  (Prescribe)    (Dispense/Treat)
```

### Medicine Workflow
```
Admin → Doctor → Pharmacist
(Add)  (Prescribe) (Dispense)
```

### Treatment Workflow
```
Doctor → Physical Medicine
(Prescribe)  (Provide Treatment)
```

---

**Remember**: This system is designed to improve patient care and hospital efficiency. Use it responsibly and accurately!

For detailed feature information, see [FEATURES.md](FEATURES.md)
For setup instructions, see [SETUP.md](SETUP.md)
