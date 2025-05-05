package com.deltaforce.mobile.auth

import android.content.Context
import android.content.Intent
import android.util.Log
import com.deltaforce.mobile.BuildConfig
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.network.GoogleAuthResponse
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class GoogleAuthHelper(private val context: Context, private val authApiService: AuthApiService) {
    private val googleSignInClient: GoogleSignInClient by lazy {
        val clientId = BuildConfig.GOOGLE_CLIENT_ID
        if (clientId.isBlank()) {
            Log.e("GoogleAuthHelper", "Google Client ID is empty or null")
            throw IllegalStateException("Google Client ID is not configured. Please check your .env file and rebuild the app.")
        }
        
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestProfile()
            .requestId()
            .requestIdToken(clientId)
            .build()
            
        GoogleSignIn.getClient(context, gso).also {
            Log.d("GoogleAuthHelper", "Initialized GoogleSignInClient with client ID: $clientId")
        }
    }

    fun getSignInIntent(): Intent {
        return try {
            Log.d("GoogleAuthHelper", "Getting sign-in intent")
            googleSignInClient.signInIntent
        } catch (e: Exception) {
            Log.e("GoogleAuthHelper", "Failed to get sign-in intent", e)
            throw e
        }
    }

    suspend fun handleSignInResult(task: Task<GoogleSignInAccount>): Result<GoogleAuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                Log.d("GoogleAuthHelper", "Starting to handle sign-in result")
                val account = task.getResult(ApiException::class.java)
                Log.d("GoogleAuthHelper", "Successfully got GoogleSignInAccount: ${account.email}")
                
                val idToken = account.idToken
                if (idToken == null) {
                    Log.e("GoogleAuthHelper", "ID token is null")
                    return@withContext Result.failure(Exception("ID token is null"))
                }
                
                Log.d("GoogleAuthHelper", "Got ID token, length: ${idToken.length}")
                val call = authApiService.handleGoogleMobileAuth(idToken)
                Log.d("GoogleAuthHelper", "Making backend call with ID token")
                
                val response = suspendCancellableCoroutine<Response<GoogleAuthResponse>> { continuation ->
                    call.enqueue(object : Callback<GoogleAuthResponse> {
                        override fun onResponse(
                            call: Call<GoogleAuthResponse>,
                            response: Response<GoogleAuthResponse>
                        ) {
                            Log.d("GoogleAuthHelper", "Got response from backend: ${response.code()}")
                            if (!response.isSuccessful) {
                                Log.e("GoogleAuthHelper", "Backend error: ${response.errorBody()?.string()}")
                            }
                            continuation.resume(response)
                        }

                        override fun onFailure(call: Call<GoogleAuthResponse>, t: Throwable) {
                            Log.e("GoogleAuthHelper", "Backend call failed", t)
                            continuation.resumeWithException(t)
                        }
                    })
                }

                if (response.isSuccessful && response.body() != null) {
                    Log.d("GoogleAuthHelper", "Successfully authenticated with backend")
                    Result.success(response.body()!!)
                } else {
                    val errorBody = response.errorBody()?.string()
                    Log.e("GoogleAuthHelper", "Backend authentication failed: ${response.code()}, $errorBody")
                    Result.failure(Exception("Failed to authenticate with backend: ${response.code()}, $errorBody"))
                }
            } catch (e: ApiException) {
                Log.e("GoogleAuthHelper", "Google Sign-In failed with status: ${e.statusCode}", e)
                Result.failure(Exception("Google Sign-In failed: ${e.statusCode}"))
            } catch (e: Exception) {
                Log.e("GoogleAuthHelper", "Error handling sign-in result", e)
                Result.failure(e)
            }
        }
    }

    suspend fun signOut() {
        withContext(Dispatchers.IO) {
            try {
                googleSignInClient.signOut().addOnCompleteListener {
                    Log.d("GoogleAuthHelper", "Successfully signed out")
                }
            } catch (e: Exception) {
                Log.e("GoogleAuthHelper", "Error signing out", e)
                throw e
            }
        }
    }

    fun getLastSignedInAccount(): GoogleSignInAccount? {
        return try {
            GoogleSignIn.getLastSignedInAccount(context)?.also {
                Log.d("GoogleAuthHelper", "Found last signed in account: ${it.email}")
            }
        } catch (e: Exception) {
            Log.e("GoogleAuthHelper", "Error getting last signed in account", e)
            null
        }
    }
} 