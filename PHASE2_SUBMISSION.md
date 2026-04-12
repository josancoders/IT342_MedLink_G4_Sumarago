# IT342 Phase 2 - Mobile Development Summary
## MedLink Healthcare Management System

---

## GITHUB REPOSITORY

**Link**: https://github.com/josancoders/IT342_MedLink_G4_Sumarago  
**Branch**: main

---

## FINAL COMMIT

**Hash**: `b05fb0e`  
**Message**: `feat: Mobile Registration and Login Implementation`  
**Date**: April 12, 2026  
**Files**: 16 files created, 1191 lines of code

---

## HOW REGISTRATION WORKS

**Step 1: User Input**
- User opens app → Registration screen
- Enters: Name, Email, Password, Confirm Password
- Taps "Register" button

**Step 2: Client Validation**
- Name: Required, non-empty
- Email: Required, valid email format (regex validation)
- Password: Required, minimum 6 characters
- Confirm Password: Must match password field
- If validation fails → Shows error Toast message

**Step 3: API Request**
- Creates RegisterRequest JSON payload
- Sends POST request to `/api/auth/register`
- Backend URL: `http://192.168.1.100:8080`
- Uses Retrofit 2 + Coroutines for async call
- Button shows "Registering..." (loading state)

**Step 4: Backend Processing**
- Spring Boot receives request
- Validates input again (server-side)
- Checks if email already exists in User table
- If unique: Creates new user record
- If duplicate: Returns error message
- Hashes password using Spring Security
- Returns AuthResponse with success/error status

**Step 5: Response & Navigation**
- Success: Shows "Registration successful!" → Navigates to Login
- Error: Shows error message → User can retry
- Network error: Shows error → User can retry

**Database Record Created**:
```
User Table:
- id: 1
- name: John Doe  
- email: john@example.com
- password: $2a$10$...hashedPassword
- created_at: timestamp
```

---

## HOW LOGIN WORKS

**Step 1: Screen Display**
- App launches → Checks if already logged in (via SharedPreferences token)
- If logged in → Shows Dashboard
- If not logged in → Shows Login screen

**Step 2: User Input**
- Enters: Email, Password
- Taps "Login" button

**Step 3: Client Validation**
- Email: Required, valid format
- Password: Required, minimum 6 characters
- If validation fails → Shows error message
- User corrects and retries

**Step 4: API Request**
- Creates LoginRequest payload
- Sends POST request to `/api/auth/login`
- Button shows "Logging in..."
- Uses Retrofit 2 with Coroutines

**Step 5: Backend Authentication**
- Spring Boot receives login request
- Looks up user by email in database
- If user not found → Returns "Invalid credentials"
- If user found:
  - Compares password with stored hash
  - If match: Generates JWT token
  - If no match: Returns "Invalid credentials"

**Step 6: Token Storage & Session**
- Success: Saves token to SharedPreferences
- Saves user ID and email locally
- Navigates to Dashboard
- Session persists across app restarts

**Step 7: After Login**
- Dashboard shows: "Welcome, user@example.com!"
- Can access features (logout button)
- Token included in future API requests

---

## API INTEGRATION USED

### Endpoints

**Registration Endpoint**:
```
POST /api/auth/register
Request: {name, email, password}
Response: {success, message, token, userId}
```

**Login Endpoint**:
```
POST /api/auth/login
Request: {email, password}
Response: {success, message, token, userId}
```

### HTTP Client Technology

**Framework**: Retrofit 2.10.0
- Base URL: `http://192.168.1.100:8080`
- JSON Converter: Gson
- Async Framework: Coroutines 1.7.3
- HTTP Client: OkHttp3 4.11.0

**Implementation**:
```kotlin
Retrofit.Builder()
    .baseUrl(BASE_URL)
    .addConverterFactory(GsonConverterFactory.create())
    .build()
```

### Data Models

```kotlin
// Request models
data class RegisterRequest(name, email, password)
data class LoginRequest(email, password)

// Response model
data class AuthResponse(success, message, token?, userId?)
```

### Error Handling

- Network errors (no connection) → "Error: Unable to connect"
- Invalid credentials (401) → "Login failed"
- Email already exists (409) → "Email already registered"
- Server errors (500) → Shows error message
- Input validation errors → Real-time validation messages

### Local Storage

**SharedPreferences** stores:
- JWT Token (for authentication)
- User ID (for identification)
- User Email (for display)
- Login state (for session management)

### Flow Summary

```
User Input
    ↓
Client Validation (Kotlin)
    ↓
Retrofit API Request (async)
    ↓
Spring Boot Backend (AuthController)
    ↓
Database User Table (MySQL/PostgreSQL)
    ↓
JWT Token Generation (if successful)
    ↓
Response with Token (Retrofit)
    ↓
Store Token (SharedPreferences)
    ↓
Navigate to Dashboard
```

---

## FILE STRUCTURE

```
mobile/
├── src/main/java/com/medlink/mobile/
│   ├── api/
│   │   ├── AuthService.kt (Retrofit endpoints)
│   │   └── RetrofitClient.kt (HTTP client config)
│   ├── data/
│   │   └── AuthModels.kt (Data classes)
│   ├── ui/
│   │   ├── LoginActivity.kt
│   │   ├── RegistrationActivity.kt
│   │   └── DashboardActivity.kt
│   └── utils/
│       └── SharedPrefsManager.kt
├── res/layout/ (3 XML layouts)
├── res/drawable/ (button styles)
└── AndroidManifest.xml
```

---

## TECHNOLOGIES

- **Language**: Kotlin
- **Framework**: Android 34
- **HTTP**: Retrofit 2 + OkHttp3
- **Async**: Coroutines
- **UI**: Material Design 3
- **Storage**: SharedPreferences
- **Backend**: Spring Boot 3
- **Database**: MySQL/PostgreSQL

---

## SCREENSHOTS REQUIRED

1. **Registration Screen** - Empty form with fields
2. **Successful Registration** - Success message
3. **Login Screen** - Email/password form
4. **Successful Login** - Success message
5. **After Login/Dashboard** - Welcome message
6. **Database Record** - User table showing registered user

---

**Status**: ✅ Complete and Ready for Submission  
**Commit Hash**: `b05fb0e`  
**Repository**: https://github.com/josancoders/IT342_MedLink_G4_Sumarago

