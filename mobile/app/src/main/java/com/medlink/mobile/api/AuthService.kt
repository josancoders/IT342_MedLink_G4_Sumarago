package com.medlink.mobile.api

import com.medlink.mobile.data.AuthResponse
import com.medlink.mobile.data.LoginRequest
import com.medlink.mobile.data.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthService {
    @POST("/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
}
