# MedLink Mobile Application

## Overview
Mobile application for MedLink Healthcare Management System built with Kotlin and Android.

## Features
- User Registration with validation
- User Login with backend API integration
- Session management with SharedPreferences
- Dashboard after successful login
- Input validation (email, password)
- Error handling and user feedback
- Token storage for authentication

## Project Structure

```
mobile/
├── src/main/
│   ├── java/com/medlink/mobile/
│   │   ├── api/
│   │   │   ├── AuthService.kt          # Retrofit API interface
│   │   │   └── RetrofitClient.kt       # Retrofit configuration
│   │   ├── data/
│   │   │   └── AuthModels.kt           # Data models (Request/Response)
│   │   ├── ui/
│   │   │   ├── LoginActivity.kt        # Login screen
│   │   │   ├── RegistrationActivity.kt # Registration screen
│   │   │   └── DashboardActivity.kt    # Dashboard after login
│   │   └── utils/
│   │       └── SharedPrefsManager.kt   # Local storage manager
│   ├── res/
│   │   ├── layout/
│   │   │   ├── activity_login.xml
│   │   │   ├── activity_registration.xml
│   │   │   └── activity_dashboard.xml
│   │   ├── drawable/
│   │   │   ├── button_background.xml
│   │   │   └── button_background_logout.xml
│   │   └── values/
│   │       └── strings.xml
│   └── AndroidManifest.xml

├── build.gradle.kts
└── README.md
```

## Technologies Used
- **Language**: Kotlin
- **UI**: XML Layouts, Material Design
- **Networking**: Retrofit 2, OkHttp3
- **Async**: Coroutines
- **Storage**: SharedPreferences
- **Build System**: Gradle

## Setup Instructions

### Prerequisites
- Android Studio Iguana or later
- Android SDK 24+ (Min SDK: 24, Target SDK: 34)
- Kotlin 1.9+
- Java 11+

### Installation

1. **Open Android Studio** and open the project

2. **Update Backend URL** in `RetrofitClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://YOUR_BACKEND_IP:8080"
   ```

3. **Sync Gradle**:
   - File → Sync Now

4. **Run the app**:
   - Select device/emulator
   - Click Run (▶️)

### Configuration

#### Backend URL
Edit `mobile/src/main/java/com/medlink/mobile/api/RetrofitClient.kt`:
```kotlin
private const val BASE_URL = "http://192.168.1.100:8080"
```

Change IP address to match your backend:
- Local machine: `127.0.0.1`
- Network: `192.168.x.x`
- Production: Your domain

## API Integration

### Registration Flow
1. User enters: Name, Email, Password, Confirm Password
2. Client validates input
3. Sends POST request to `/api/auth/register`
4. Backend validates and creates user
5. Success: Navigate to Login
6. Error: Show error message

### Login Flow
1. User enters: Email, Password
2. Client validates input
3. Sends POST request to `/api/auth/login`
4. Backend validates credentials
5. Success: Save token, navigate to Dashboard
6. Error: Show error message

### API Endpoints

**Registration**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "userId": 1
}
```

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": 1
}
```

## Code Structure

### Activities

#### LoginActivity
- Handles user login
- Validates email and password
- Makes API call to backend
- Saves authentication token
- Redirects to Dashboard on success

#### RegistrationActivity
- Handles user registration
- Validates all inputs (name, email, password)
- Ensures password confirmation matches
- Makes API call to backend
- Redirects to Login on success

#### DashboardActivity
- Shows welcome message
- Displays user email
- Provides logout functionality
- Clears session on logout

### Services

#### AuthService (Retrofit Interface)
```kotlin
@POST("/api/auth/register")
suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

@POST("/api/auth/login")
suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
```

### Utilities

#### SharedPrefsManager
Manages local storage of:
- Authentication token
- User ID
- User email
- Login state

## Validation Rules

### Registration
- **Name**: Required, non-empty
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters
- **Confirm Password**: Must match password field

### Login
- **Email**: Required, valid email format
- **Password**: Required, minimum 6 characters

## Error Handling

The app handles:
- Network errors (no internet connection)
- API errors (invalid credentials, server errors)
- Input validation errors
- JSON parsing errors
- Toast messages for user feedback

## Security Features

1. **Password Storage**: Passwords not stored locally
2. **Token Management**: JWT token stored securely in SharedPreferences
3. **HTTPS Ready**: Can be configured for HTTPS in production
4. **Input Validation**: All inputs validated before sending

## Testing

### Manual Testing
1. Register new user with valid data
2. Register with invalid email (should fail)
3. Register with mismatched passwords (should fail)
4. Login with registered email and password
5. Login with wrong password (should fail)
6. Logout and verify session cleared

### Testing Credentials
```
Email: test@medlink.com
Password: password123
```

## Future Enhancements

- [ ] Google Sign-In integration
- [ ] Biometric authentication
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Appointment booking
- [ ] Doctor search and filtering
- [ ] Prescription viewing
- [ ] Payment integration

## Dependencies

- androidx.appcompat:appcompat (1.6.1)
- com.google.android.material:material (1.11.0)
- retrofit2:retrofit (2.10.0)
- com.squareup.okhttp3:okhttp (4.11.0)
- kotlinx-coroutines (1.7.3)
- androidx.lifecycle:lifecycle-runtime-ktx (2.6.2)

## Development Guidelines

1. **Kotlin Style Guide**: Follow Kotlin official conventions
2. **Layout Design**: Use MaterialDesign 3 principles
3. **Error Handling**: Always catch exceptions and show user feedback
4. **Logging**: Use Timber or logcat for debugging
5. **Testing**: Write unit tests for validation logic

## Troubleshooting

### "Unable to resolve host" error
- Check backend URL in RetrofitClient.kt
- Ensure backend is running
- Check internet connection
- Use correct IP address for your network

### "Email already exists" error
- User is already registered
- Use different email or login instead

### "Invalid credentials" error
- Email or password is incorrect
- Check caps lock
- Ensure user is registered first

### Port not accessible
- Check firewall settings
- Ensure backend port 8080 is open
- Try with localhost instead of IP

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/mobile-auth

# Make changes and commit
git add mobile/
git commit -m "feat: Mobile registration and login implementation"

# Push to remote
git push origin feature/mobile-auth
```

## Support & Documentation

For issues or questions:
1. Check logs in Logcat
2. Review backend API responses
3. Check internet connectivity
4. Verify backend is running

---

**App Version**: 1.0  
**Target SDK**: Android 34  
**Min SDK**: Android 24 (7.0)  
**Language**: Kotlin  
**Last Updated**: April 12, 2026
