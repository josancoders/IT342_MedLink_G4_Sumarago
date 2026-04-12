package com.medlink.mobile.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.medlink.mobile.R
import com.medlink.mobile.api.RetrofitClient
import com.medlink.mobile.data.LoginRequest
import com.medlink.mobile.databinding.ActivityLoginBinding
import com.medlink.mobile.utils.SharedPrefsManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private val authService = RetrofitClient.getAuthService()
    private lateinit var prefsManager: SharedPrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefsManager = SharedPrefsManager(this)

        // Check if already logged in
        if (prefsManager.isLoggedIn()) {
            goToDashboard()
        }

        setupUI()
    }

    private fun setupUI() {
        binding.loginButton.setOnClickListener {
            handleLogin()
        }

        binding.registerLink.setOnClickListener {
            startActivity(Intent(this, RegistrationActivity::class.java))
            finish()
        }
    }

    private fun handleLogin() {
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString().trim()

        // Validation
        if (!validateInputs(email, password)) {
            return
        }

        // Show loading state
        binding.loginButton.isEnabled = false
        binding.loginButton.text = "Logging in..."

        // API Call
        lifecycleScope.launch {
            try {
                val request = LoginRequest(
                    email = email,
                    password = password
                )

                val response = authService.login(request)

                if (response.isSuccessful) {
                    val authResponse = response.body()
                    if (authResponse != null && authResponse.success) {
                        // Save token and user info
                        authResponse.token?.let { prefsManager.saveToken(it) }
                        authResponse.userId?.let { prefsManager.saveUserId(it) }
                        prefsManager.saveEmail(email)

                        showSuccess("Login successful!")
                        goToDashboard()
                    } else {
                        showError(authResponse?.message ?: "Login failed")
                    }
                } else {
                    showError("Login failed: Invalid credentials")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                binding.loginButton.isEnabled = true
                binding.loginButton.text = "Login"
            }
        }
    }

    private fun validateInputs(email: String, password: String): Boolean {
        return when {
            email.isEmpty() -> {
                showError("Email is required")
                false
            }
            !isValidEmail(email) -> {
                showError("Please enter a valid email")
                false
            }
            password.isEmpty() -> {
                showError("Password is required")
                false
            }
            password.length < 6 -> {
                showError("Password must be at least 6 characters")
                false
            }
            else -> true
        }
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    private fun showSuccess(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    private fun goToDashboard() {
        startActivity(Intent(this, DashboardActivity::class.java))
        finish()
    }
}
