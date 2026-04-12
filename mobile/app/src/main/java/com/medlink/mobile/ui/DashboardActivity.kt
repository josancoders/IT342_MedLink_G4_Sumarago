package com.medlink.mobile.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.medlink.mobile.R
import com.medlink.mobile.utils.SharedPrefsManager

class DashboardActivity : AppCompatActivity() {

    private lateinit var welcomeTextView: TextView
    private lateinit var logoutButton: Button
    private lateinit var prefsManager: SharedPrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        // Initialize SharedPreferences Manager
        prefsManager = SharedPrefsManager(this)

        // Initialize views
        welcomeTextView = findViewById(R.id.welcomeTextView)
        logoutButton = findViewById(R.id.logoutButton)

        // Get user email from SharedPreferences
        val email = prefsManager.getEmail()
        welcomeTextView.text = "Welcome, $email!"

        // Set up logout button
        logoutButton.setOnClickListener { performLogout() }
    }

    private fun performLogout() {
        // Clear all user data
        prefsManager.clear()

        // Navigate back to login
        val intent = Intent(this, LoginActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        startActivity(intent)
        finish()
    }
}
