package com.deltaforce.mobile.auth

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.staticCompositionLocalOf
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

val LocalGoogleAuth = staticCompositionLocalOf<GoogleAuth> { 
    error("GoogleAuth not provided") 
}

class GoogleAuth(private val context: Context) {
    private val authApiService = AuthApiService()
    private val googleClientId = System.getenv("GOOGLE_CLIENT_ID")
    private val googleSignInClient: GoogleSignInClient by lazy {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestIdToken(googleClientId)
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    fun getSignInIntent() = googleSignInClient.signInIntent

    suspend fun handleSignInResult(task: Task<GoogleSignInAccount>): Result<GoogleAuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val account = task.getResult(ApiException::class.java)
                val idToken = account.idToken ?: throw Exception("ID token is null")
                
                val call = authApiService.handleGoogleAuthCallback()
                val response = suspendCancellableCoroutine<Response<GoogleAuthResponse>> { continuation ->
                    call.enqueue(object : Callback<GoogleAuthResponse> {
                        override fun onResponse(
                            call: Call<GoogleAuthResponse>,
                            response: Response<GoogleAuthResponse>
                        ) {
                            continuation.resume(response)
                        }

                        override fun onFailure(call: Call<GoogleAuthResponse>, t: Throwable) {
                            continuation.resumeWithException(t)
                        }
                    })
                }

                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Failed to authenticate with backend: ${response.code()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun signOut() {
        withContext(Dispatchers.IO) {
            googleSignInClient.signOut()
        }
    }

    fun getLastSignedInAccount(): GoogleSignInAccount? {
        return GoogleSignIn.getLastSignedInAccount(context)
    }
}

@Composable
fun rememberGoogleAuthState(
    onSignInSuccess: (GoogleAuthResponse) -> Unit = {},
    onSignInError: (String) -> Unit = {}
): GoogleAuthState {
    var state by remember { mutableStateOf(GoogleAuthState()) }
    val googleAuth = LocalGoogleAuth.current

    @Composable
    fun handleEvent(event: GoogleAuthEvent) {
        when (event) {
            is GoogleAuthEvent.SignIn -> {
                // This will be handled by the activity result
            }
            is GoogleAuthEvent.SignInResult -> {
                state = state.copy(isLoading = true)
                LaunchedEffect(Unit) {
                    googleAuth.handleSignInResult(event.task)
                        .onSuccess { response ->
                            state = state.copy(
                                isLoading = false,
                                isAuthenticated = true,
                                user = response,
                                error = null
                            )
                            onSignInSuccess(response)
                        }
                        .onFailure { error ->
                            state = state.copy(
                                isLoading = false,
                                isAuthenticated = false,
                                user = null,
                                error = error.message
                            )
                            onSignInError(error.message ?: "Unknown error occurred")
                        }
                }
            }
            is GoogleAuthEvent.SignOut -> {
                LaunchedEffect(Unit) {
                    try {
                        googleAuth.signOut()
                        state = state.copy(
                            isAuthenticated = false,
                            user = null,
                            error = null
                        )
                    } catch (e: Exception) {
                        state = state.copy(error = e.message ?: "Failed to sign out")
                    }
                }
            }
            is GoogleAuthEvent.CheckLastSignedInAccount -> {
                val account = googleAuth.getLastSignedInAccount()
                if (account != null) {
                    handleEvent(GoogleAuthEvent.SignInResult(com.google.android.gms.tasks.Tasks.forResult(account)))
                }
            }
        }
    }

    return state
}