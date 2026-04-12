package com.medlink.mobile.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.medlink.mobile.R
import com.medlink.mobile.api.RetrofitClient
import com.medlink.mobile.data.RegisterRequest
import com.medlink.mobile.databinding.ActivityRegistrationBinding
import kotlinx.coroutines.launch

class RegistrationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegistrationBinding
    private val authService = RetrofitClient.getAuthService()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegistrationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
    }

    private fun setupUI() {
        binding.registerButton.setOnClickListener {
            handleRegistration()
        }

        binding.loginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun handleRegistration() {
        val name = binding.nameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString().trim()
        val confirmPassword = binding.confirmPasswordInput.text.toString().trim()

        // Validation
        if (!validateInputs(name, email, password, confirmPassword)) {
            return
        }

        // Show loading state
        binding.registerButton.isEnabled = false
        binding.registerButton.text = "Registering..."

        // API Call
        lifecycleScope.launch {
            try {
                val request = RegisterRequest(
                    name = name,
                    email = email,
                    password = password
                )

                val response = authService.register(request)

                if (response.isSuccessful) {
                    val authResponse = response.body()
                    if (authResponse != null && authResponse.success) {
                        showSuccess("Registration successful! Please login.")
                        goToLogin()
                    } else {
                        showError(authResponse?.message ?: "Registration failed")
                    }
                } else {
                    showError("Registration failed: ${response.message()}")
                }
            } catch (e: Exception) {
                showError("Error: ${e.message}")
            } finally {
                binding.registerButton.isEnabled = true
                binding.registerButton.text = "Register"
            }
        }
    }

    private fun validateInputs(name: String, email: String, password: String, confirmPassword: String): Boolean {
        return when {
            name.isEmpty() -> {
                showError("Name is required")
                false
            }
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
            password != confirmPassword -> {
                showError("Passwords do not match")
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

    private fun goToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}
