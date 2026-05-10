# MedLink Test Plan - Complete Test Cases

## Overview
- **Project:** MedLink Healthcare Management System
- **Scope:** All Functional Requirements
- **Total Test Cases:** 23
- **Platforms:** Backend API, Web Frontend, Mobile App
- **Date Created:** May 10, 2026

---

## TEST CASES BY MODULE

### MODULE 1: AUTHENTICATION (5 Tests)

#### TC-AUTH-001: User Registration with Valid Data
| Field | Value |
|-------|-------|
| Test ID | AUTH-001 |
| Component | Registration Module |
| Priority | High |
| **Pre-condition** | User not registered in system |
| **Test Steps** | 1. Navigate to registration page<br>2. Enter Name: "John Doe"<br>3. Enter Email: "john@example.com"<br>4. Enter Password: "Test@123456"<br>5. Confirm Password: "Test@123456"<br>6. Click "Register" button |
| **Expected Result** | • User record created in database<br>• Success message displayed<br>• Redirected to login page<br>• Email stored correctly<br>• Password hashed in database |
| **Test Data** | name="John Doe", email="john@example.com", password="Test@123456" |
| **Pass Criteria** | User can log in with registered credentials |

#### TC-AUTH-002: User Login with Valid Credentials
| Field | Value |
|-------|-------|
| Test ID | AUTH-002 |
| Component | Login Module |
| Priority | High |
| **Pre-condition** | User registered with email: user@example.com, password: Test@123456 |
| **Test Steps** | 1. Navigate to login page<br>2. Enter Email: "user@example.com"<br>3. Enter Password: "Test@123456"<br>4. Click "Login" button |
| **Expected Result** | • JWT token generated<br>• Token stored in session storage<br>• User redirected to dashboard<br>• Session active<br>• Token valid for API calls |
| **Test Data** | email="user@example.com", password="Test@123456" |
| **Pass Criteria** | User dashboard displays, token present in storage |

#### TC-AUTH-003: Email Validation - Invalid Format
| Field | Value |
|-------|-------|
| Test ID | AUTH-003 |
| Component | Registration/Login Validation |
| Priority | High |
| **Pre-condition** | User on login page |
| **Test Steps** | 1. Enter Email: "invalidemail" (no @)<br>2. Enter valid password<br>3. Click "Login" button |
| **Expected Result** | • Error message: "Invalid email format"<br>• Login not attempted<br>• Login button remains enabled<br>• User stays on login page |
| **Test Data** | email="invalidemail" |
| **Pass Criteria** | Error message displays correctly |

#### TC-AUTH-004: Password Validation - Too Short
| Field | Value |
|-------|-------|
| Test ID | AUTH-004 |
| Component | Registration/Login Validation |
| Priority | High |
| **Pre-condition** | User on registration or login page |
| **Test Steps** | 1. Enter valid email<br>2. Enter Password: "123" (3 characters)<br>3. Click Submit button |
| **Expected Result** | • Error message: "Password must be at least 6 characters"<br>• Form not submitted<br>• User remains on current page |
| **Test Data** | password="123" |
| **Pass Criteria** | Validation error prevents submission |

#### TC-AUTH-005: Login Failure - Wrong Credentials
| Field | Value |
|-------|-------|
| Test ID | AUTH-005 |
| Component | Login Module |
| Priority | High |
| **Pre-condition** | Valid user exists in system |
| **Test Steps** | 1. Enter registered email: "user@example.com"<br>2. Enter incorrect password: "WrongPassword123"<br>3. Click "Login" button |
| **Expected Result** | • Error message displayed<br>• No token generated<br>• User stays on login page<br>• Account not locked<br>• Can retry login |
| **Test Data** | email="user@example.com", password="WrongPassword123" |
| **Pass Criteria** | Error shown, user can retry |

---

### MODULE 2: DOCTOR MANAGEMENT (3 Tests)

#### TC-DOC-001: Browse Doctors List
| Field | Value |
|-------|-------|
| Test ID | DOC-001 |
| Component | Doctor Discovery |
| Priority | High |
| **Pre-condition** | User logged in, 3+ doctors in database |
| **Test Steps** | 1. Navigate to "Browse Doctors" page<br>2. Wait for page to load<br>3. Verify all doctors display<br>4. Scroll through list |
| **Expected Result** | • All doctors displayed in grid/list<br>• Each card shows: name, specialty, rating<br>• Images load correctly<br>• No console errors<br>• Can scroll smoothly |
| **Test Data** | Sample doctors: Dr. Smith (Cardiology), Dr. Jones (Neurology), Dr. Brown (Dermatology) |
| **Pass Criteria** | All doctors visible, properly formatted |

#### TC-DOC-002: View Doctor Profile
| Field | Value |
|-------|-------|
| Test ID | DOC-002 |
| Component | Doctor Profile |
| Priority | High |
| **Pre-condition** | Doctors list displayed, user logged in |
| **Test Steps** | 1. Click on a doctor from the list<br>2. Wait for profile page to load<br>3. Verify all information displays |
| **Expected Result** | • Full name displayed<br>• Specialty shown<br>• Qualifications listed<br>• Experience years shown<br>• Availability calendar visible<br>• "Book Appointment" button present |
| **Test Data** | Doctor ID: 1 |
| **Pass Criteria** | All profile details visible, button functional |

#### TC-DOC-003: Doctor Availability Calendar
| Field | Value |
|-------|-------|
| Test ID | DOC-003 |
| Component | Doctor Schedule |
| Priority | High |
| **Pre-condition** | Doctor profile page open |
| **Test Steps** | 1. View availability calendar<br>2. Check date selection<br>3. Try selecting past date<br>4. Try selecting available date |
| **Expected Result** | • Available dates highlighted<br>• Past dates disabled/grayed out<br>• Time slots show for selected date<br>• Can select future dates<br>• Available slots are clickable |
| **Test Data** | Current date: 2026-05-10, Try: 2026-05-09 (past), 2026-05-20 (future) |
| **Pass Criteria** | Date selection works correctly |

---

### MODULE 3: APPOINTMENTS (7 Tests)

#### TC-APT-001: Book Appointment Successfully
| Field | Value |
|-------|-------|
| Test ID | APT-001 |
| Component | Appointment Booking |
| Priority | High |
| **Pre-condition** | User logged in, doctor selected |
| **Test Steps** | 1. Click "Book Appointment"<br>2. Select date: 2026-05-20<br>3. Select time: 10:00 AM<br>4. Enter reason: "Regular checkup"<br>5. Click "Confirm Booking" |
| **Expected Result** | • Appointment created in database<br>• Confirmation page displayed<br>• Confirmation number generated<br>• Details shown: doctor, date, time<br>• Appointment in user's list<br>• Email notification (if enabled) |
| **Test Data** | doctorId=1, date=2026-05-20, time=10:00, reason="Regular checkup" |
| **Pass Criteria** | Confirmation page appears with appointment details |

#### TC-APT-002: Booking Validation - Past Date
| Field | Value |
|-------|-------|
| Test ID | APT-002 |
| Component | Appointment Validation |
| Priority | High |
| **Pre-condition** | Booking form open, current date 2026-05-10 |
| **Test Steps** | 1. Try to select date: 2026-05-05 (past date)<br>2. Attempt to confirm |
| **Expected Result** | • Past dates cannot be selected<br>• Error message displayed<br>• Form prevents submission<br>• Date picker blocks past dates |
| **Test Data** | date=2026-05-05 (5 days in past) |
| **Pass Criteria** | Past date selection blocked |

#### TC-APT-003: Booking Validation - Missing Fields
| Field | Value |
|-------|-------|
| Test ID | APT-003 |
| Component | Appointment Validation |
| Priority | High |
| **Pre-condition** | Booking form with date and time selected |
| **Test Steps** | 1. Leave "Reason" field empty<br>2. Leave "Notes" field empty<br>3. Click "Confirm Booking" |
| **Expected Result** | • Error message: "Reason is required"<br>• Form not submitted<br>• Field highlighted in red<br>• User must fill all required fields |
| **Test Data** | reason="" (empty) |
| **Pass Criteria** | Validation error prevents booking |

#### TC-APT-004: View My Appointments
| Field | Value |
|-------|-------|
| Test ID | APT-004 |
| Component | Appointment History |
| Priority | High |
| **Pre-condition** | User has 2+ booked appointments |
| **Test Steps** | 1. Navigate to "My Appointments"<br>2. View appointment list<br>3. Check appointment details |
| **Expected Result** | • All appointments displayed<br>• Shows: doctor name, date, time, status<br>• Appointments sorted chronologically<br>• Can filter by status (upcoming, past, cancelled)<br>• Can view full details of each |
| **Test Data** | Appointments: APT001, APT002, APT003 |
| **Pass Criteria** | All appointments visible and sortable |

#### TC-APT-005: Cancel Appointment
| Field | Value |
|-------|-------|
| Test ID | APT-005 |
| Component | Appointment Management |
| Priority | High |
| **Pre-condition** | User has booked appointment (status: CONFIRMED) |
| **Test Steps** | 1. Navigate to "My Appointments"<br>2. Select appointment<br>3. Click "Cancel Appointment"<br>4. Confirm cancellation<br>5. Verify cancellation |
| **Expected Result** | • Appointment status changed to CANCELLED<br>• Confirmation message shown<br>• Appointment removed from upcoming list<br>• Doctor's slot released<br>• Cancellation recorded in history |
| **Test Data** | appointmentId=1, status=CONFIRMED |
| **Pass Criteria** | Appointment successfully cancelled |

#### TC-APT-006: Reschedule Appointment
| Field | Value |
|-------|-------|
| Test ID | APT-006 |
| Component | Appointment Management |
| Priority | Medium |
| **Pre-condition** | User has booked appointment |
| **Test Steps** | 1. Click "Reschedule"<br>2. Select new date: 2026-05-25<br>3. Select new time: 2:00 PM<br>4. Confirm reschedule |
| **Expected Result** | • Appointment date/time updated<br>• Old slot released<br>• New slot booked<br>• Confirmation message shown<br>• History shows rescheduled date |
| **Test Data** | appointmentId=1, newDate=2026-05-25, newTime=14:00 |
| **Pass Criteria** | Appointment successfully rescheduled |

#### TC-APT-007: Doctor View Appointments
| Field | Value |
|-------|-------|
| Test ID | APT-007 |
| Component | Doctor Dashboard |
| Priority | High |
| **Pre-condition** | Doctor logged in with 3+ appointments |
| **Test Steps** | 1. Login as doctor<br>2. Navigate to appointments<br>3. View all booked appointments<br>4. Check appointment details |
| **Expected Result** | • All appointments for that doctor shown<br>• Shows: patient name, date, time, reason, status<br>• Can update appointment status<br>• Can view patient details<br>• Statistics displayed (total, completed, pending) |
| **Test Data** | doctorId=1 |
| **Pass Criteria** | Doctor can view all their appointments |

---

### MODULE 4: PAYMENTS (3 Tests)

#### TC-PAY-001: Process Payment Successfully
| Field | Value |
|-------|-------|
| Test ID | PAY-001 |
| Component | Payment Processing |
| Priority | High |
| **Pre-condition** | Appointment booked, payment pending |
| **Test Steps** | 1. Click "Proceed to Payment"<br>2. Enter payment details (test data)<br>3. Review amount and details<br>4. Click "Pay Now"<br>5. Verify payment completion |
| **Expected Result** | • Payment processed successfully<br>• Transaction ID generated<br>• Payment status: COMPLETED<br>• Receipt displayed<br>• Appointment confirmed<br>• Email receipt sent |
| **Test Data** | amount=50.00 USD, card=4111111111111111 |
| **Pass Criteria** | Transaction ID appears, receipt shown |

#### TC-PAY-002: Payment Failure Handling
| Field | Value |
|-------|-------|
| Test ID | PAY-002 |
| Component | Payment Validation |
| Priority | High |
| **Pre-condition** | Payment form open |
| **Test Steps** | 1. Enter invalid payment details<br>2. Enter card: 4000000000000002 (decline)<br>3. Click "Pay Now"<br>4. Verify error handling |
| **Expected Result** | • Payment declined<br>• Error message: "Payment failed"<br>• Transaction ID not generated<br>• User prompted to retry<br>• Appointment not confirmed<br>• Funds not deducted |
| **Test Data** | card=4000000000000002 (test decline card) |
| **Pass Criteria** | Declined payment handled gracefully |

#### TC-PAY-003: Payment History
| Field | Value |
|-------|-------|
| Test ID | PAY-003 |
| Component | Payment History |
| Priority | Medium |
| **Pre-condition** | User has 2+ completed payments |
| **Test Steps** | 1. Navigate to "Payment History"<br>2. View all transactions<br>3. Click on transaction for details<br>4. Verify receipt can be downloaded |
| **Expected Result** | • All transactions listed<br>• Shows: date, amount, status, txn ID<br>• Can filter by date range<br>• Can download receipt/invoice<br>• Correct amounts and dates shown |
| **Test Data** | Transactions: TXN001, TXN002 |
| **Pass Criteria** | All transactions visible and downloadable |

---

### MODULE 5: DASHBOARD (3 Tests)

#### TC-DASH-001: Patient Dashboard Display
| Field | Value |
|-------|-------|
| Test ID | DASH-001 |
| Component | Patient Dashboard |
| Priority | High |
| **Pre-condition** | Patient logged in, has appointments |
| **Test Steps** | 1. Navigate to dashboard<br>2. Verify all widgets load<br>3. Check upcoming appointments<br>4. View statistics |
| **Expected Result** | • Welcome message displays<br>• Upcoming appointments shown (3-5)<br>• Statistics: total appts, completed, pending<br>• Quick actions available<br>• Recent activity feed displays<br>• No console errors |
| **Test Data** | User: patient@example.com |
| **Pass Criteria** | Dashboard loads fully without errors |

#### TC-DASH-002: Doctor Dashboard Display
| Field | Value |
|-------|-------|
| Test ID | DASH-002 |
| Component | Doctor Dashboard |
| Priority | High |
| **Pre-condition** | Doctor logged in with appointments |
| **Test Steps** | 1. Navigate to doctor dashboard<br>2. View profile section<br>3. Check today's appointments<br>4. Review statistics |
| **Expected Result** | • Doctor profile info displayed<br>• Today's appointments listed<br>• Statistics: total patients, appts today, completed<br>• Can update profile<br>• Can manage schedule<br>• Performance metrics shown |
| **Test Data** | User: doctor@example.com |
| **Pass Criteria** | Doctor dashboard displays all sections |

#### TC-DASH-003: Appointment History Filtering
| Field | Value |
|-------|-------|
| Test ID | DASH-003 |
| Component | Appointment History |
| Priority | Medium |
| **Pre-condition** | User with multiple appointment types (upcoming, completed, cancelled) |
| **Test Steps** | 1. Open appointment history<br>2. View all appointments<br>3. Apply filters: upcoming, completed, cancelled<br>4. Verify sorting and filtering |
| **Expected Result** | • All appointments displayed initially<br>• Filter buttons work correctly<br>• Correct appointments shown per filter<br>• Results sorted chronologically<br>• Pagination works if needed |
| **Test Data** | Filter: upcoming, completed, cancelled |
| **Pass Criteria** | Filtering works correctly |

---

## REGRESSION TEST CHECKLIST

### Functionality Checklist
- [ ] User registration works end-to-end
- [ ] User login works end-to-end
- [ ] Password reset functionality (if implemented)
- [ ] Doctor list displays correctly
- [ ] Doctor profile shows all details
- [ ] Appointment booking process completes
- [ ] Appointment cancellation works
- [ ] Appointment rescheduling works
- [ ] Payment processing functions
- [ ] Dashboard displays correctly
- [ ] Logout clears session

### Validation Checklist
- [ ] Email format validation works
- [ ] Password length validation works
- [ ] Password matching validation works
- [ ] Date picker prevents past dates
- [ ] Required fields are enforced
- [ ] Error messages are clear
- [ ] Success messages display correctly

### Security Checklist
- [ ] JWT tokens generated correctly
- [ ] Protected endpoints require authentication
- [ ] Tokens expire appropriately
- [ ] Passwords hashed in database
- [ ] No sensitive data in logs
- [ ] CORS configured correctly
- [ ] SQL injection prevented

### Performance Checklist
- [ ] Pages load in < 3 seconds
- [ ] API calls complete < 1 second
- [ ] Mobile app responsive
- [ ] No memory leaks
- [ ] Database queries optimized
- [ ] Large data sets handled properly

### UI/UX Checklist
- [ ] All buttons functional
- [ ] Navigation works correctly
- [ ] Responsive design works
- [ ] Mobile layouts correct
- [ ] Error messages helpful
- [ ] Loading states visible
- [ ] No broken links

### Database Checklist
- [ ] Records created correctly
- [ ] Relationships maintained
- [ ] Data integrity preserved
- [ ] Transactions rollback on error
- [ ] No orphaned records
- [ ] Cascade deletes work

---

## Test Environment

**Backend:** Spring Boot 3.5.11 on localhost:8080
**Frontend:** React on localhost:5173
**Mobile:** Android Emulator (Pixel 7, API 34)
**Database:** H2 In-Memory (testing)
**Browser:** Chrome/Firefox
**OS:** Windows 11

---

**End of Test Plan**
