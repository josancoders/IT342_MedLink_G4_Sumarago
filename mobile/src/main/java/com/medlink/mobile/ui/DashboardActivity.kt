package com.medlink.mobile.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.medlink.mobile.databinding.ActivityDashboardBinding
import com.medlink.mobile.utils.SharedPrefsManager

class DashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDashboardBinding
    private lateinit var prefsManager: SharedPrefsManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefsManager = SharedPrefsManager(this)

        setupUI()
    }

    private fun setupUI() {
        val email = prefsManager.getEmail()
        binding.welcomeText.text = "Welcome, $email!"

        binding.logoutButton.setOnClickListener {
            logout()
        }
    }

    private fun logout() {
        prefsManager.clear()
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }
}
