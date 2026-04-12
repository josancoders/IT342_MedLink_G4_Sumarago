package com.medlink.mobile.utils

import android.content.Context
import android.content.SharedPreferences

class SharedPrefsManager(context: Context) {
    private val sharedPreferences: SharedPreferences = 
        context.getSharedPreferences("medlink_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_EMAIL = "user_email"
    }

    fun saveToken(token: String) {
        sharedPreferences.edit().putString(KEY_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString(KEY_TOKEN, null)
    }

    fun saveUserId(userId: Long) {
        sharedPreferences.edit().putLong(KEY_USER_ID, userId).apply()
    }

    fun getUserId(): Long {
        return sharedPreferences.getLong(KEY_USER_ID, -1)
    }

    fun saveEmail(email: String) {
        sharedPreferences.edit().putString(KEY_EMAIL, email).apply()
    }

    fun getEmail(): String? {
        return sharedPreferences.getString(KEY_EMAIL, null)
    }

    fun isLoggedIn(): Boolean {
        return getToken() != null
    }

    fun clear() {
        sharedPreferences.edit().clear().apply()
    }
}
