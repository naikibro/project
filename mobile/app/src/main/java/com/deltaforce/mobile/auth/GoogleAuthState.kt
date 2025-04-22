package com.deltaforce.mobile.auth

import com.deltaforce.mobile.network.GoogleAuthResponse

data class GoogleAuthState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val user: GoogleAuthResponse? = null,
    val error: String? = null
)

sealed class GoogleAuthEvent {
    object SignIn : GoogleAuthEvent()
    object SignOut : GoogleAuthEvent()
    data class SignInResult(val task: com.google.android.gms.tasks.Task<com.google.android.gms.auth.api.signin.GoogleSignInAccount>) : GoogleAuthEvent()
    object CheckLastSignedInAccount : GoogleAuthEvent()
} 