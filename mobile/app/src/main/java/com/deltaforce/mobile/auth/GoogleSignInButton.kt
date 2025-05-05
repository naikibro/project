package com.deltaforce.mobile.auth

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.MapboxActivity
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.GoogleAuthResponse
import com.google.android.gms.auth.api.signin.GoogleSignIn
import AuthSession

@Composable
fun GoogleSignInButton(
    viewModel: GoogleSignInViewModel,
    onSignInSuccess: (GoogleAuthResponse) -> Unit = {},
    onSignInError: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val state = viewModel.state.collectAsState()
    val authSession = remember { AuthSession }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        Log.d("GoogleSignInButton", "Sign-in result received with code: ${result.resultCode}")
        when (result.resultCode) {
            Activity.RESULT_OK -> {
                try {
                    Log.d("GoogleSignInButton", "Processing sign-in result...")
                    val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
                    viewModel.onEvent(GoogleSignInEvent.SignInResult(task))
                } catch (e: Exception) {
                    Log.e("GoogleSignInButton", "Error processing sign-in result", e)
                    onSignInError("Error processing sign-in: ${e.message}")
                }
            }
            Activity.RESULT_CANCELED -> {
                Log.d("GoogleSignInButton", "Sign-in was cancelled by user")
                onSignInError("Sign-in was cancelled")
            }
            else -> {
                Log.e("GoogleSignInButton", "Sign-in failed with result code: ${result.resultCode}")
                onSignInError("Sign-in failed with code: ${result.resultCode}")
            }
        }
    }

    // Check for existing sign-in on composition
    LaunchedEffect(Unit) {
        Log.d("GoogleSignInButton", "Checking for existing sign-in")
        viewModel.onEvent(GoogleSignInEvent.CheckLastSignedInAccount)
    }

    // Handle state changes
    LaunchedEffect(state.value) {
        when {
            state.value.isLoading -> {
                Log.d("GoogleSignInButton", "Sign-in in progress...")
            }
            state.value.user != null -> {
                Log.d("GoogleSignInButton", "Sign-in successful, redirecting to MapboxActivity")
                val response = state.value.user!!
                authSession.setToken(response.accessToken)
                authSession.setUser(response.user)
                onSignInSuccess(response)
                
                val intent = Intent(context, MapboxActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                }
                context.startActivity(intent)
            }
            state.value.error != null -> {
                Log.e("GoogleSignInButton", "Sign-in error: ${state.value.error}")
                onSignInError(state.value.error!!)
            }
        }
    }

    Button(
        onClick = {
            Log.d("GoogleSignInButton", "Starting Google Sign-In flow")
            try {
                launcher.launch(viewModel.googleAuthHelper.getSignInIntent())
            } catch (e: Exception) {
                Log.e("GoogleSignInButton", "Error launching sign-in intent", e)
                onSignInError("Error starting sign-in: ${e.message}")
            }
        },
        enabled = !state.value.isLoading,
        modifier = modifier
    ) {
        Icon(
            painter = painterResource(id = R.drawable.logo_mini),
            contentDescription = "Google Icon",
            modifier = Modifier.size(24.dp)
        )
        Text(
            text = if (state.value.isLoading) "Signing in..." else "Sign in with Google",
            modifier = Modifier.padding(start = 8.dp)
        )
    }
}