# MedLink Test Scripts - Execution Procedures

## Table of Contents
1. Backend API Testing (cURL/Postman)
2. Frontend UI Testing (Manual)
3. Mobile App Testing (Android Emulator)
4. Automated Testing Setup
5. Test Reporting

---

## 1. BACKEND API TESTING

### Prerequisites Setup

```bash
# Start Backend Server
cd e:\josan\IT342_MedLink_G4_Sumarago\backend
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Backend URL: http://localhost:8080
# Expected startup time: 10-15 seconds
```

### Test Script 1: Authentication Flow (15 minutes)

#### Step 1.1: Register New User

**Using cURL:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1"
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Token returned and not empty
- [ ] Message confirms registration
- [ ] User ID returned

#### Step 1.2: Login with Registered User

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "1"
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] JWT token returned
- [ ] Token can be decoded
- [ ] User ID matches registered user

**Store token for next tests:**
```bash
$TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Step 1.3: Validate Token by Accessing Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/appointments \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": []
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] No 401 Unauthorized error
- [ ] Endpoint accessible with token
- [ ] Appointments array returned (empty initially)

### Test Script 2: Doctor Management (10 minutes)

#### Step 2.1: Get All Doctors

```bash
curl -X GET http://localhost:8080/api/doctors \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dr. Smith",
      "specialty": "Cardiology",
      "qualifications": "MD, Board Certified",
      "yearsExperience": 15
    },
    {
      "id": 2,
      "name": "Dr. Jones",
      "specialty": "Neurology",
      "qualifications": "MD, PhD",
      "yearsExperience": 12
    }
  ]
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Doctors array not empty
- [ ] Each doctor has required fields
- [ ] Doctor IDs are unique

#### Step 2.2: Get Specific Doctor Profile

```bash
DOCTOR_ID=1
curl -X GET http://localhost:8080/api/doctors/$DOCTOR_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Dr. Smith",
    "specialty": "Cardiology",
    "qualifications": "MD, Board Certified",
    "yearsExperience": 15,
    "availability": {
      "monday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      "tuesday": ["09:00", "10:00", "11:00", "14:00", "15:00"],
      ...
    }
  }
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Doctor details match doctor list
- [ ] Availability schedule present
- [ ] Time slots in correct format

### Test Script 3: Appointment Management (20 minutes)

#### Step 3.1: Book Appointment

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": 1,
    "appointmentDate": "2026-05-20",
    "timeSlot": "10:00",
    "reason": "Regular checkup"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "appointmentId": 101,
    "doctorId": 1,
    "appointmentDate": "2026-05-20",
    "timeSlot": "10:00",
    "status": "CONFIRMED",
    "confirmationNumber": "APT-2026-05-20-001"
  }
}
```

**Verification:**
- [ ] HTTP Status: 201 Created
- [ ] Appointment ID generated
- [ ] Status is CONFIRMED
- [ ] Confirmation number provided
- [ ] Date and time match input

**Store appointment ID:**
```bash
$APPOINTMENT_ID="101"
```

#### Step 3.2: Get User's Appointments

```bash
curl -X GET http://localhost:8080/api/appointments/my-appointments \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "appointmentId": 101,
      "doctorName": "Dr. Smith",
      "appointmentDate": "2026-05-20",
      "timeSlot": "10:00",
      "reason": "Regular checkup",
      "status": "CONFIRMED"
    }
  ]
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Booked appointment appears in list
- [ ] Appointment details correct
- [ ] Doctor name populated

#### Step 3.3: Cancel Appointment

```bash
curl -X PUT http://localhost:8080/api/appointments/$APPOINTMENT_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "appointmentId": 101,
    "status": "CANCELLED"
  }
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Status changed to CANCELLED
- [ ] Appointment no longer shows in upcoming list

### Test Script 4: Payment Processing (10 minutes)

#### Step 4.1: Book Another Appointment for Payment Test

(Use Step 3.1 to book new appointment)

#### Step 4.2: Initiate Payment

```bash
curl -X POST http://localhost:8080/api/payments/process \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": 102,
    "amount": 50.00,
    "currency": "USD",
    "paymentMethod": "CREDIT_CARD",
    "cardNumber": "4111111111111111",
    "expiryDate": "12/25",
    "cvv": "123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transactionId": "TXN-2026-05-20-001",
    "status": "COMPLETED",
    "amount": 50.00,
    "appointmentId": 102
  }
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Transaction ID generated
- [ ] Payment status is COMPLETED
- [ ] Amount matches request

#### Step 4.3: Get Payment History

```bash
curl -X GET http://localhost:8080/api/payments/history \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "transactionId": "TXN-2026-05-20-001",
      "appointmentId": 102,
      "amount": 50.00,
      "status": "COMPLETED",
      "date": "2026-05-20T14:30:00Z"
    }
  ]
}
```

**Verification:**
- [ ] HTTP Status: 200 OK
- [ ] Transaction appears in history
- [ ] All transaction details correct

### Test Script 5: Error Handling (10 minutes)

#### Step 5.1: Invalid Email Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalidemail",
    "password": "Test123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email format",
  "error": "EMAIL_VALIDATION_FAILED"
}
```

**Verification:**
- [ ] HTTP Status: 400 Bad Request
- [ ] Error message clear
- [ ] No user created

#### Step 5.2: Duplicate Email Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Email already registered",
  "error": "DUPLICATE_EMAIL"
}
```

**Verification:**
- [ ] HTTP Status: 409 Conflict
- [ ] Error message clear
- [ ] Not allowed to register duplicate

#### Step 5.3: Unauthorized Access Without Token

```bash
curl -X GET http://localhost:8080/api/appointments
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "JWT token is missing"
}
```

**Verification:**
- [ ] HTTP Status: 401 Unauthorized
- [ ] No access without token

---

## 2. FRONTEND UI TESTING (Manual)

### Prerequisites

```bash
# Terminal 1: Start Backend
cd backend
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Terminal 2: Start Frontend Dev Server
cd web
npm install
npm run dev

# Access at: http://localhost:5173
```

### Test Script 1: Complete Booking Journey (30 minutes)

#### Step 1.1: Navigate to Application

```
1. Open browser
2. Go to http://localhost:5173
3. Verify login page displays
4. Check: Title, Logo, Login form fields
```

**Expected Screen:**
- MedLink logo
- "Login" and "Register" buttons
- Email and Password input fields
- Error messages (if any) display clearly

**Verification Checklist:**
- [ ] Page title is "MedLink"
- [ ] All UI elements visible
- [ ] No console errors (press F12)

#### Step 1.2: Register New User

```
1. Click "Register" link
2. Fill: Name = "John Doe"
3. Fill: Email = "john@example.com"
4. Fill: Password = "Test@123456"
5. Fill: Confirm Password = "Test@123456"
6. Click "Register" button
```

**Expected Behavior:**
- Form validates
- Success message appears
- Auto-redirects to login (after 2-3 seconds)

**Verification Checklist:**
- [ ] All fields accept input
- [ ] No validation errors appear for valid data
- [ ] Success toast message shows
- [ ] Redirected to login page

#### Step 1.3: Login

```
1. Enter Email: "john@example.com"
2. Enter Password: "Test@123456"
3. Click "Login" button
4. Wait for dashboard to load
```

**Expected Behavior:**
- Login processes
- JWT token stored
- Redirects to dashboard

**Verification Checklist:**
- [ ] No errors on login
- [ ] Dashboard loads
- [ ] Welcome message shows user email
- [ ] Navigation menu displays

#### Step 1.4: Navigate to Find Doctors

```
1. Click "Find Doctors" in navigation
2. Wait for doctors list to load
3. Verify doctor cards display
```

**Expected Screen:**
- Grid of doctor cards
- Each card shows: Photo, Name, Specialty, Rating
- Doctor cards are clickable

**Verification Checklist:**
- [ ] At least 3 doctors visible
- [ ] Doctor information readable
- [ ] Cards styled professionally
- [ ] No broken images

#### Step 1.5: View Doctor Profile

```
1. Click on first doctor card
2. Wait for profile page to load
3. Examine profile details
```

**Expected Screen:**
- Doctor name, specialty, qualifications
- Years of experience
- Appointment availability calendar
- "Book Appointment" button

**Verification Checklist:**
- [ ] All details visible
- [ ] Calendar shows dates
- [ ] Button is clickable
- [ ] No loading errors

#### Step 1.6: Book Appointment

```
1. Click "Book Appointment" button
2. Booking form appears
3. Select Date: May 20, 2026 (future date)
4. Select Time: 10:00 AM
5. Enter Reason: "Regular checkup"
6. Click "Confirm Booking"
```

**Expected Behavior:**
- Form validates input
- Booking processes
- Confirmation page appears

**Verification Checklist:**
- [ ] Date picker works
- [ ] Time slots display
- [ ] Reason field accepts text
- [ ] Confirm button works

#### Step 1.7: Appointment Confirmation

**Expected Screen:**
- Confirmation number displayed
- Appointment details shown
- "View My Appointments" button

**Verification Checklist:**
- [ ] Confirmation number is unique
- [ ] All appointment details match input
- [ ] Can navigate to appointments list

#### Step 1.8: View My Appointments

```
1. Click "My Appointments" in navigation
2. View your booked appointment
3. Click on appointment for details
```

**Expected Screen:**
- List of user's appointments
- Shows: Doctor name, Date, Time, Status
- Can perform actions: View, Reschedule, Cancel

**Verification Checklist:**
- [ ] Booked appointment visible in list
- [ ] Appointment details correct
- [ ] Status shows "Confirmed"
- [ ] Action buttons available

### Test Script 2: Error Handling (20 minutes)

#### Step 2.1: Registration Validation

```
Test Case 1: Invalid Email
1. Go to register page
2. Enter Name: "Test"
3. Enter Email: "invalidemail" (no @)
4. Enter Password: "Test@123456"
5. Click Register
Expected: Error message about invalid email
```

**Verification:**
- [ ] Error message displays
- [ ] Registration prevented
- [ ] User stays on form

```
Test Case 2: Short Password
1. Enter Email: "test@example.com"
2. Enter Password: "123" (too short)
3. Click Register
Expected: Error about minimum 6 characters
```

**Verification:**
- [ ] Error shown immediately
- [ ] Registration prevented

```
Test Case 3: Password Mismatch
1. Password: "Test@123456"
2. Confirm Password: "Different123"
3. Click Register
Expected: Error about passwords not matching
```

**Verification:**
- [ ] Error displayed
- [ ] Form validation works

#### Step 2.2: Login Validation

```
Test Case 1: Wrong Password
1. Enter Email: "john@example.com"
2. Enter Password: "WrongPassword"
3. Click Login
Expected: Error message "Invalid credentials"
```

**Verification:**
- [ ] Error shows
- [ ] User stays on login
- [ ] Can retry

```
Test Case 2: Non-existent Email
1. Enter Email: "nonexistent@example.com"
2. Enter Password: "Test@123456"
3. Click Login
Expected: Error "Invalid credentials"
```

**Verification:**
- [ ] Error shows
- [ ] Does not reveal email doesn't exist
- [ ] User stays on form

#### Step 2.3: Booking Validation

```
Test Case 1: Past Date Selection
1. Go to booking form
2. Try to select date in past (e.g., May 5)
3. Verify date picker prevents selection
Expected: Past dates disabled/grayed out
```

**Verification:**
- [ ] Cannot select past dates
- [ ] Date picker blocks them
- [ ] Error message if attempted

```
Test Case 2: Missing Reason
1. Fill Date: May 20
2. Fill Time: 10:00 AM
3. Leave Reason empty
4. Click Confirm
Expected: Error "Reason is required"
```

**Verification:**
- [ ] Error displays
- [ ] Form not submitted
- [ ] Field highlighted

### Test Script 3: Session Management (10 minutes)

#### Step 3.1: Session Persistence

```
1. Login to application (use Test Script 1.2-1.3)
2. Note: You're on dashboard
3. Refresh page (F5 or Ctrl+R)
4. Expected: Still logged in, dashboard appears
```

**Verification:**
- [ ] Page reloads
- [ ] No redirect to login
- [ ] Dashboard displays
- [ ] Session token still valid

#### Step 3.2: Logout

```
1. Click "Logout" button (usually top-right)
2. Expected: Session cleared, redirected to login
```

**Verification:**
- [ ] Successfully logged out
- [ ] On login page
- [ ] localStorage cleared (check DevTools → Application → localStorage)

#### Step 3.3: Relogin After Logout

```
1. Enter credentials again
2. Login
3. Expected: New session created, new token
```

**Verification:**
- [ ] New JWT token generated
- [ ] Dashboard loads
- [ ] Fully functional

---

## 3. MOBILE APP TESTING

### Prerequisites Setup

```bash
# Terminal 1: Start Backend
cd backend
java -jar target/backend-0.0.1-SNAPSHOT.jar

# Terminal 2: Open Android Studio
# Launch Pixel 7 API 34 emulator
# Deploy mobile app to emulator
```

### Test Script 1: Mobile Authentication Flow (20 minutes)

#### Step 1.1: App Launch

```
1. Launch MedLink app on emulator
2. Expected: Login screen appears with:
   - MedLink logo
   - Email input field
   - Password input field
   - Login button
   - "Register" link
```

**Verification Checklist:**
- [ ] App launches without crashing
- [ ] UI elements visible and readable
- [ ] No console errors (check logcat)

#### Step 1.2: Mobile Registration

```
1. Click "Register" link on login screen
2. Fill form:
   - Name: "Mobile User"
   - Email: "mobileuser@example.com"
   - Password: "MobilePass123"
   - Confirm Password: "MobilePass123"
3. Click "Register" button
4. Expected: Success message, navigate to login
```

**Verification Checklist:**
- [ ] Form displays correctly
- [ ] All fields editable
- [ ] Register button works
- [ ] Success toast appears
- [ ] Redirects to login
- [ ] No app crash

#### Step 1.3: Mobile Login

```
1. Enter Email: "mobileuser@example.com"
2. Enter Password: "MobilePass123"
3. Click "Login" button
4. Wait for processing
```

**Expected Screen:**
- Dashboard with welcome message
- Shows: "Welcome, mobileuser@example.com"
- Logout button visible

**Verification Checklist:**
- [ ] Login successful
- [ ] No errors displayed
- [ ] Dashboard loads
- [ ] Session active

### Test Script 2: Session Persistence (10 minutes)

#### Step 2.1: Close and Relaunch App

```
1. App is logged in (from Test 1.3)
2. Press Home button (goes to home screen)
3. Swipe away app (closes completely)
4. Tap app icon to relaunch
5. Expected: Auto-redirects to dashboard
```

**Verification Checklist:**
- [ ] App reopens
- [ ] Automatically on dashboard
- [ ] No login required
- [ ] Session token still valid

#### Step 2.2: Logout

```
1. Click "Logout" button on dashboard
2. Expected: Returns to login screen, session cleared
```

**Verification Checklist:**
- [ ] Session cleared
- [ ] On login screen
- [ ] Token removed from SharedPreferences
- [ ] Must login to access app again

### Test Script 3: Mobile Validation Testing (10 minutes)

#### Step 3.1: Invalid Email

```
1. On login screen
2. Enter Email: "invalidemail" (no @)
3. Enter Password: "Test123"
4. Click Login
Expected: Error toast showing email format message
```

**Verification:**
- [ ] Error shows as toast
- [ ] Clear error message
- [ ] Login not attempted

#### Step 3.2: Short Password

```
1. Enter Email: "test@example.com"
2. Enter Password: "123" (< 6 chars)
3. Click Login
Expected: Error "Password too short"
```

**Verification:**
- [ ] Error displayed
- [ ] Clear message
- [ ] Form not submitted

---

## 4. AUTOMATED TESTING

### Backend Unit Tests

```bash
cd backend
mvn clean test

# Expected Output:
# [INFO] Running medlink.backend.service.AuthServiceTest
# [INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
# [INFO] Total time: 12.345 s
# [INFO] BUILD SUCCESS
```

**Verification:**
- [ ] All tests pass
- [ ] No test failures
- [ ] Build succeeds

### Frontend Tests

```bash
cd web
npm test

# Expected Output:
# PASS  src/__tests__/Login.test.jsx
# PASS  src/__tests__/Registration.test.jsx
# PASS  src/__tests__/AppointmentForm.test.jsx
# Test Suites: 4 passed, 4 total
# Tests: 12 passed, 12 total
```

**Verification:**
- [ ] All test suites pass
- [ ] 100% pass rate
- [ ] No skipped tests

### Mobile Tests

```bash
cd mobile
./gradlew.bat test

# Expected Output:
# :app:testDebugUnitTest
# BUILD SUCCESSFUL
# 8 tests passed
```

**Verification:**
- [ ] Build succeeds
- [ ] All tests pass
- [ ] No build errors

---

## 5. TEST REPORTING

### Generate Test Report

```bash
# Backend
cd backend
mvn clean test
# Report location: target/surefire-reports/

# Frontend
cd web
npm test -- --coverage
# Report location: coverage/

# Create summary
cd..
echo "All tests completed successfully" > TEST_REPORT.txt
date >> TEST_REPORT.txt
```

### Document Results

Create file: `TEST_RESULTS.md`

```markdown
# Test Execution Results - May 10, 2026

## Summary
- Total Tests: 23
- Passed: 22
- Failed: 1
- Pass Rate: 95.65%

## By Module
- Authentication: 5/5 passed
- Doctor Management: 3/3 passed
- Appointments: 7/7 passed
- Payments: 3/3 passed
- Dashboard: 3/3 passed

## Issues Found
1. Minor: Error message not showing on login failure (FIXED)
2. Performance: Reschedule takes 2s instead of 1s (FIXED)

## Recommendations
- Implement real-time updates via WebSocket
- Add integration tests for payment flows
- Set up CI/CD pipeline for automated testing

## Approved By
[Your Name] - Quality Assurance Lead
Date: May 10, 2026
```

---

**End of Test Scripts**
