package com.deltaforce.mobile.network

import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import com.deltaforce.mobile.BuildConfig

data class SignUpRequest(
    val username: String,
    val email: String,
    val password: String,
    val acceptedTerms: Boolean,
    val acceptedPrivacyPolicy: Boolean
)

data class SignUpResponse(
    val accessToken: String
)

data class SignInRequest(
    val email: String,
    val password: String
)

data class Role(
    val id: Int,
    val name: String
)

data class User(
    val id: String,
    val username: String,
    val email: String,
    val role: Role
)

data class SignInResponse(
    val accessToken: String,
    val user: User
)

data class ForgotPasswordRequest(
    val email: String
)

data class ForgotPasswordResponse(
    val message: String
)

data class ResetPasswordRequest(
    val token: String,
    val newPassword: String
)

data class ResetPasswordResponse(
    val token: String,
    val newPassword: String
)

interface AuthApi {
    @POST("auth/signup")
    fun signUp(@Body signUpRequest: SignUpRequest): Call<SignUpResponse>

    @POST("auth/signin")
    fun signIn(@Body signInRequest: SignInRequest): Call<SignInResponse>

    @POST("auth/forgot-password")
    fun forgotPassword(@Body forgotPasswordRequest: ForgotPasswordRequest): Call<ForgotPasswordResponse>

    @POST("auth/reset-password")
    fun resetPassword(@Body resetPasswordRequest: ResetPasswordRequest): Call<ResetPasswordResponse>
}

class AuthApiService(private val authApi: AuthApi? = null, baseUrl: String = BuildConfig.API_URL) {

    private val api: AuthApi = authApi ?: run {
        val retrofit: Retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(AuthApi::class.java)
    }

    fun signUp(signUpRequest: SignUpRequest): Call<SignUpResponse> {
        return api.signUp(signUpRequest)
    }

    fun signIn(signInRequest: SignInRequest): Call<SignInResponse> {
        return api.signIn(signInRequest)
    }

    fun forgotPassword(email: String): Call<ForgotPasswordResponse> {
        val request = ForgotPasswordRequest(email)
        return api.forgotPassword(request)
    }

    fun resetPassword(token: String, newPassword: String): Call<ResetPasswordResponse> {
        val request = ResetPasswordRequest(token, newPassword)
        return api.resetPassword(request)
    }
}
