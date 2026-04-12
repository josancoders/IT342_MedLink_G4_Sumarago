package com.medlink.mobile.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.medlink.mobile.R
import com.medlink.mobile.api.AuthService
import com.medlink.mobile.api.RetrofitClient
import com.medlink.mobile.data.LoginRequest
import com.medlink.mobile.utils.SharedPrefsManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var loginButton: Button
    private lateinit var registerLink: TextView
    private lateinit var authService: AuthService
    private lateinit var prefsManager: SharedPrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize SharedPreferences Manager
        prefsManager = SharedPrefsManager(this)

        // Check if user is already logged in
        if (prefsManager.isLoggedIn()) {
            navigateToDashboard()
            return
        }

        // Initialize Retrofit service
        authService = RetrofitClient.getAuthService()

        // Initialize views
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        loginButton = findViewById(R.id.loginButton)
        registerLink = findViewById(R.id.registerLink)

        // Set up button listeners
        loginButton.setOnClickListener { performLogin() }
        registerLink.setOnClickListener { navigateToRegistration() }
    }

    private fun performLogin() {
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()

        // Validate inputs
        if (!validateInputs(email, password)) {
            return
        }

        // Show loading state
        loginButton.isEnabled = false
        loginButton.text = "Logging in..."

        // Make API call
        lifecycleScope.launch {
            try {
                val request = LoginRequest(email, password)
                val response = authService.login(request)

                if (response.isSuccessful) {
                    val body = response.body()
                    if (body != null && body.success) {
                        // Save token and user info
                        body.token?.let { prefsManager.saveToken(it) }
                        body.userId?.let { prefsManager.saveUserId(it) }
                        prefsManager.saveEmail(email)

                        Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        navigateToDashboard()
                    } else {
                        showError(body?.message ?: "Login failed")
                    }
                } else {
                    showError("Login failed: ${response.code()}")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                loginButton.isEnabled = true
                loginButton.text = "Login"
            }
        }
    }

    private fun validateInputs(email: String, password: String): Boolean {
        if (email.isEmpty()) {
            emailEditText.error = "Email is required"
            return false
        }

        if (!email.contains("@")) {
            emailEditText.error = "Invalid email format"
            return false
        }

        if (password.isEmpty()) {
            passwordEditText.error = "Password is required"
            return false
        }

        if (password.length < 6) {
            passwordEditText.error = "Password must be at least 6 characters"
            return false
        }

        return true
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    private fun navigateToDashboard() {
        val intent = Intent(this, DashboardActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun navigateToRegistration() {
        val intent = Intent(this, RegistrationActivity::class.java)
        startActivity(intent)
    }
}
