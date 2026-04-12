package com.medlink.mobile.data

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val token: String? = null,
    val userId: Long? = null
)
