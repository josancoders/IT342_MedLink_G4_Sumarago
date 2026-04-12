package com.medlink.mobile.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Change this to your backend IP/domain
    private const val BASE_URL = "http://192.168.1.100:8080"
    
    private var retrofit: Retrofit? = null

    fun getClient(): Retrofit {
        if (retrofit == null) {
            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!
    }

    fun getAuthService(): AuthService {
        return getClient().create(AuthService::class.java)
    }
}
