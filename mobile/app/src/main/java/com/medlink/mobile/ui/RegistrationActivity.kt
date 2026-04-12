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
import com.medlink.mobile.data.RegisterRequest
import kotlinx.coroutines.launch

class RegistrationActivity : AppCompatActivity() {

    private lateinit var nameEditText: EditText
    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var confirmPasswordEditText: EditText
    private lateinit var registerButton: Button
    private lateinit var loginLink: TextView
    private lateinit var authService: AuthService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_registration)

        // Initialize Retrofit service
        authService = RetrofitClient.getAuthService()

        // Initialize views
        nameEditText = findViewById(R.id.nameEditText)
        emailEditText = findViewById(R.id.emailEditText)
        passwordEditText = findViewById(R.id.passwordEditText)
        confirmPasswordEditText = findViewById(R.id.confirmPasswordEditText)
        registerButton = findViewById(R.id.registerButton)
        loginLink = findViewById(R.id.loginLink)

        // Set up button listeners
        registerButton.setOnClickListener { performRegistration() }
        loginLink.setOnClickListener { navigateToLogin() }
    }

    private fun performRegistration() {
        val name = nameEditText.text.toString().trim()
        val email = emailEditText.text.toString().trim()
        val password = passwordEditText.text.toString().trim()
        val confirmPassword = confirmPasswordEditText.text.toString().trim()

        // Validate inputs
        if (!validateInputs(name, email, password, confirmPassword)) {
            return
        }

        // Show loading state
        registerButton.isEnabled = false
        registerButton.text = "Registering..."

        // Make API call
        lifecycleScope.launch {
            try {
                val request = RegisterRequest(name, email, password)
                val response = authService.register(request)

                if (response.isSuccessful) {
                    val body = response.body()
                    if (body != null && body.success) {
                        Toast.makeText(this@RegistrationActivity, "Registration successful! Please log in.", Toast.LENGTH_SHORT).show()
                        navigateToLogin()
                    } else {
                        showError(body?.message ?: "Registration failed")
                    }
                } else {
                    showError("Registration failed: ${response.code()}")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                registerButton.isEnabled = true
                registerButton.text = "Register"
            }
        }
    }

    private fun validateInputs(name: String, email: String, password: String, confirmPassword: String): Boolean {
        if (name.isEmpty()) {
            nameEditText.error = "Name is required"
            return false
        }

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

        if (password != confirmPassword) {
            confirmPasswordEditText.error = "Passwords do not match"
            return false
        }

        return true
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    private fun navigateToLogin() {
        val intent = Intent(this, LoginActivity::class.java)
        startActivity(intent)
        finish()
    }
}
