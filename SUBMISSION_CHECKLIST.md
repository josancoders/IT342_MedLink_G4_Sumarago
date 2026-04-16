# IT342 Phase 3 - Submission Checklist

Use this checklist to ensure all submission requirements are met before submitting Phase 3.

---

## CHECKLIST ITEMS

### ✅ 1. GitHub Repository Link
- **Required For:** Show project repository
- **Action Item:** 
  ```
  GitHub Link: https://github.com/<username>/<repo-name>
  ```
- **Verify:** 
  - [ ] Repository is public
  - [ ] All code is pushed
  - [ ] Branch is "main" or as specified

---

### ✅ 2. Final Commit
- **Required For:** Show completed work history
- **Action Items:**
  1. Stage all changes:
     ```bash
     cd e:\josan\IT342_MedLink_G4_Sumarago
     git add .
     ```
  2. Create commit with descriptive message:
     ```bash
     git commit -m "IT342 Phase 3 – Appointment Booking System Completed
     
     - Implemented complete JWT authentication system
     - Created appointment booking workflow
     - Built doctor appointment management interface
     - Added real-time appointment statistics
     - Integrated patient-to-doctor appointment flow"
     ```
  3. Push to GitHub:
     ```bash
     git push origin main
     ```
  4. Get commit information:
     ```bash
     git log -1 --format="%H %s"
     ```
     This will output: `<HASH> IT342 Phase 3 – Appointment Booking System Completed`

- **For Submission, You'll Need:**
  - [ ] Commit Hash (e.g., 3f2a8c1d9e4b7f6a2c1d)
  - [ ] Commit Message (provided above)
  - [ ] Commit Link: `https://github.com/<username>/<repo>/commit/<hash>`

---

### ✅ 3. Screenshots (4 Required)

#### Screenshot 1: Main Feature - Booking Form
- **Page:** BookAppointment.jsx
- **What to Show:**
  - Doctor information card at top
  - Date picker field
  - Time slot selection grid
  - Reason for visit textarea
  - "Proceed to Payment" button
- **File to Screenshot:** Access via `http://localhost:5173/book-appointment/:doctorId`
- **Save As:** `screenshot_1_booking_form.png`

#### Screenshot 2: Using the Feature - Entering Data
- **Page:** BookAppointment.jsx (completed form)
- **What to Show:**
  - Date field filled (e.g., 2026-04-17)
  - Time slot selected (highlighted)
  - Reason filled in (e.g., "Regular checkup")
  - All validation passed (no error messages)
- **Action:** Fill out the form completely, take screenshot
- **Save As:** `screenshot_2_form_filled.png`

#### Screenshot 3: Successful Output - Confirmation
- **Page:** AppointmentConfirmation.jsx
- **What to Show:**
  - ✅ "Appointment Confirmed Successfully" message
  - Confirmation number displayed
  - Appointment details (date, time, doctor name, reason)
  - Doctor information
  - "View My Appointments" or similar button
- **How to Get:** Complete the booking flow to reach this page
- **Save As:** `screenshot_3_confirmation.png`

#### Screenshot 4: Database Record - SQL Query
- **Database:** PostgreSQL or MySQL (as configured)
- **Table:** `appointments`
- **Query to Run:**
  ```sql
  SELECT 
    a.id,
    a.appointment_date,
    a.time_slot,
    a.reason,
    a.status,
    a.patient_id,
    a.doctor_id,
    u.full_name as patient_name,
    d.specialization,
    a.created_at
  FROM appointments a
  JOIN users u ON a.patient_id = u.id
  JOIN doctors d ON a.doctor_id = d.id
  ORDER BY a.created_at DESC
  LIMIT 5;
  ```
- **What to Show:**
  - Multiple appointment records in table format
  - Columns clearly visible: appointment_date, time_slot, reason, status, patient/doctor info
  - Date format readable
  - Status field shows "CONFIRMED" or similar
- **Tool:** Use pgAdmin, MySQL Workbench, or DBeaver
- **Save As:** `screenshot_4_database.png`

---

## SUBMISSION DOCUMENT TEMPLATE

Create a document (Word/PDF) with the following sections:

### Section 1: Project Overview
```
Project Name: MedLink - Healthcare Management System
Phase: Phase 3 - Main Feature Implementation
Feature: Appointment Booking System with Doctor Schedule Management
Team: IT342_MedLink_G4_Sumarago
```

### Section 2: Feature Description (Use from PHASE_3_FEATURE_SUMMARY.md)
```
Brief description of what the feature does:

Patient-side:
- Browse doctors and their profiles
- Book appointments by selecting date, time, and providing reason
- Proceed to payment
- Receive confirmation

Doctor-side:
- View all booked appointments
- Track appointment statistics
- Update appointment status
- Manage professional profile and schedule availability
```

### Section 3: Validations Implemented (Use from PHASE_3_FEATURE_SUMMARY.md)
```
Frontend:
- Date picker validates (no past dates)
- All form fields required
- Time slot required selection

Backend:
- JWT token validation
- Doctor existence check
- Reason field validation
- Error responses with proper HTTP status codes
```

### Section 4: How It Works (Use from PHASE_3_FEATURE_SUMMARY.md)
```
Patient Flow (step-by-step)
Doctor Flow (step-by-step)
Include screenshots at each step
```

### Section 5: API Endpoints Documentation (Use from PHASE_3_FEATURE_SUMMARY.md)
```
List all endpoints:
- POST /api/appointments (create)
- GET /api/appointments (patient's appointments)
- GET /api/appointments/doctor/my-appointments (doctor's appointments)
- GET /api/appointments/doctor/stats (doctor statistics)
- PUT /api/appointments/{id} (update status)
- DELETE /api/appointments/{id} (cancel)
And others...
```

### Section 6: Database Schema (Use from PHASE_3_FEATURE_SUMMARY.md)
```
Tables:
- Appointments (with columns and relationships)
- Doctors (updated with schedule field)
- Users (authentication details)
```

### Section 7: Screenshots
```
4 screenshots embedded here:
1. Main Feature - Booking Form
2. Using Feature - Form Filled
3. Output - Confirmation Page
4. Database - Query Results
```

### Section 8: GitHub Information
```
Repository Link: https://github.com/...
Final Commit Hash: abc123def456...
Commit Link: https://github.com/.../commit/abc123...
```

---

## FINAL VERIFICATION BEFORE SUBMISSION

### Code Quality
- [ ] Code is clean and well-formatted
- [ ] Error handling implemented
- [ ] All commented code removed
- [ ] No hard-coded test data remaining

### Database
- [ ] Database populated with test appointment records
- [ ] Relationships properly established (patient → user, doctor → user, appointment → patient)(appointment → doctor)
- [ ] At least 2-3 appointment records exist for demo

### Security
- [ ] JWT authentication working
- [ ] Protected endpoints require token
- [ ] Token stored in localStorage
- [ ] Token included in API calls

### Functionality
- [ ] Patient can complete full booking flow
- [ ] Doctor can view appointments
- [ ] Status updates work
- [ ] No console errors in DevTools
- [ ] No 404 or 500 errors in network requests

### Documentation
- [ ] README.md is updated
- [ ] PHASE_3_FEATURE_SUMMARY.md is complete
- [ ] All APIs documented
- [ ] Database schema documented

---

## SUBMISSION PACKAGE CONTENTS

Your final submission should include:

```
📦 IT342_Phase_3_Submission/
├── 📄 GITHUB_LINK.txt
│   └── Contains: https://github.com/...
├── 📄 FINAL_COMMIT_INFO.txt
│   └── Contains: Commit hash, message, link
├── 📷 Screenshots/
│   ├── screenshot_1_booking_form.png
│   ├── screenshot_2_form_filled.png
│   ├── screenshot_3_confirmation.png
│   └── screenshot_4_database.png
├── 📄 SUBMISSION_REPORT.docx (or .pdf)
│   ├── Project Overview
│   ├── Feature Description
│   ├── Validations Implemented
│   ├── How It Works
│   ├── API Endpoints
│   ├── Database Schema
│   ├── Screenshots with Labels
│   └── GitHub/Commit Information
└── 📄 PHASE_3_FEATURE_SUMMARY.md
    └── Technical reference document
```

---

## QUICK START TO SUBMISSION

### Step 1: Prepare Code
```bash
cd e:\josan\IT342_MedLink_G4_Sumarago
git add .
git commit -m "IT342 Phase 3 – Appointment Booking System Completed"
git push origin main
git log -1 --format="%H"  # Copy this hash
```

### Step 2: Gather Information
- [ ] Get GitHub repository URL
- [ ] Get commit hash from above
- [ ] Get commit URL: `https://github.com/<user>/<repo>/commit/<hash>`

### Step 3: Test & Screenshot
- [ ] Start backend: `cd backend && ./mvnw spring-boot:run`
- [ ] Start frontend: `cd web && npm run dev`
- [ ] Complete booking flow in browser
- [ ] Take 3 screenshots (form, filled, confirmation)
- [ ] Take database screenshot (query results)

### Step 4: Create Report
- [ ] Copy template above
- [ ] Fill in with your information
- [ ] Paste PHASE_3_FEATURE_SUMMARY.md content
- [ ] Embed 4 screenshots
- [ ] Add GitHub/commit links
- [ ] Export as PDF

### Step 5: Submit
- [ ] Verify all items in Final Verification checklist
- [ ] Package all files
- [ ] Submit as requested

---

## COMMON ISSUES & SOLUTIONS

### Issue: Appointment not saving to database
**Solution:** 
- Check backend is running
- Verify JWT token is valid
- Check console for error messages
- Ensure database is started

### Issue: Screenshots blank or showing errors
**Solution:**
- Ensure both backend and frontend are running
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors
- Verify you're logged in as patient/doctor

### Issue: Database query returns no results
**Solution:**
- Book at least one appointment first
- Verify appointments table exists (check in DB client)
- Run query against correct database
- Check table name (could be `appointment` not `appointments`)

### Issue: Commit history not showing
**Solution:**
- Verify git is initialized: `git status`
- Check remote is set: `git remote -v`
- Make sure you're in the correct directory
- Push changes: `git push origin main`

---

**Total Screenshot Count Needed:** 4 (1 main feature, 1 using feature, 1 output, 1 database)
**Total Estimated Time to Completion:** 30-45 minutes
**All Required Information:** ✅ Complete in PHASE_3_FEATURE_SUMMARY.md

