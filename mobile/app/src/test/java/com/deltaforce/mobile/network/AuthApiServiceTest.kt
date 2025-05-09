package com.deltaforce.mobile.network

import junit.framework.TestCase.assertEquals
import junit.framework.TestCase.assertNotNull
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Before
import org.junit.Test
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class AuthApiServiceTest {

    private lateinit var mockWebServer: MockWebServer
    private lateinit var authApiService: AuthApi

    @Before
    fun setup() {
        mockWebServer = MockWebServer()
        mockWebServer.start()

        val retrofit = Retrofit.Builder()
            .baseUrl(mockWebServer.url("/"))
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        authApiService = retrofit.create(AuthApi::class.java)
    }

    @After
    fun tearDown() {
        mockWebServer.shutdown()
    }

    @Test
    fun signUp_parsesResponseCorrectly() = runBlocking {
        val responseJson = """{"accessToken": "dummy_token"}"""
        mockWebServer.enqueue(MockResponse().setResponseCode(200).setBody(responseJson))

        val signUpRequest = SignUpRequest(
            username = "testuser",
            email = "test@example.com",
            password = "password123",
            acceptedTerms = true,
            acceptedPrivacyPolicy = true
        )

        val response = authApiService.signUp(signUpRequest).execute()
        assertEquals(200, response.code())

        val body = response.body()
        assertNotNull(body)
        assertEquals("dummy_token", body!!.accessToken)
    }

    @Test
    fun signIn_parsesResponseCorrectly() = runBlocking {
        val responseJson = """
            {
                "accessToken": "dummy_token",
                "user": {
                    "id": "123",
                    "username": "testuser",
                    "email": "test@example.com",
                    "role": {
                        "id": 1,
                        "name": "User"
                    }
                }
            }
        """.trimIndent()
        mockWebServer.enqueue(MockResponse().setResponseCode(200).setBody(responseJson))

        val signInRequest = SignInRequest(email = "test@example.com", password = "password123")
        val response = authApiService.signIn(signInRequest).execute()

        assertEquals(200, response.code())
        val body = response.body()
        assertNotNull(body)
        assertEquals("dummy_token", body!!.accessToken)
        assertEquals("123", body.user.id)
        assertEquals("testuser", body.user.username)
        assertEquals("test@example.com", body.user.email)
        assertEquals(1, body.user.role.id)
        assertEquals("User", body.user.role.name)
    }

    @Test
    fun forgotPassword_parsesResponseCorrectly() = runBlocking {
        val responseJson = """{"message": "Password reset link sent"}"""
        mockWebServer.enqueue(MockResponse().setResponseCode(200).setBody(responseJson))

        val response = authApiService.forgotPassword(ForgotPasswordRequest("test@example.com")).execute()
        assertEquals(200, response.code())

        val body = response.body()
        assertNotNull(body)
    }

    @Test
    fun resetPassword_parsesResponseCorrectly() = runBlocking {
        val responseJson = """{"token": "reset_token", "newPassword": "new_password"}"""
        mockWebServer.enqueue(MockResponse().setResponseCode(200).setBody(responseJson))

        val response = authApiService.resetPassword(ResetPasswordRequest("dummy_token", "new_password")).execute()
        assertEquals(200, response.code())

        val body = response.body()
        assertNotNull(body)
    }
}