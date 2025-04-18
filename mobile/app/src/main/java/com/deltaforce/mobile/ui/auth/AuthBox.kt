package com.deltaforce.mobile.ui.auth

import AuthSession
import AuthSessionInterface
import DefaultAuthSession
import android.content.Intent
import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.MapboxActivity
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.network.SignInRequest
import com.deltaforce.mobile.network.SignInResponse
import com.deltaforce.mobile.network.SignUpRequest
import com.deltaforce.mobile.network.SignUpResponse
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@Composable
fun AuthBox(
    authApiService: AuthApiService = AuthApiService(),
    authSession: AuthSessionInterface = AuthSession
) {
    val context = LocalContext.current
    var showPasswordRecovery by remember { mutableStateOf(false) }

    if (showPasswordRecovery) {
        PasswordRecovery(
            authApiService = authApiService,
            onBack = { showPasswordRecovery = false }
        )
        return
    }

    var isSignIn by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var acceptedTerms by remember { mutableStateOf(false) }
    var acceptedPrivacyPolicy by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(errorMessage) {
        if (errorMessage.isNotEmpty()) {
            snackbarHostState.showSnackbar(errorMessage)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AuthToggleButtons(isSignIn, onToggle = { isSignIn = it })

            Spacer(modifier = Modifier.height(16.dp))

            AuthFields(
                isSignIn = isSignIn,
                username = username,
                onUsernameChange = { username = it },
                email = email,
                onEmailChange = { email = it },
                password = password,
                onPasswordChange = { password = it }
            )

            if (!isSignIn) {
                AuthTermsCheckboxes(
                    acceptedTerms = acceptedTerms,
                    onTermsChange = { acceptedTerms = it },
                    acceptedPrivacyPolicy = acceptedPrivacyPolicy,
                    onPrivacyChange = { acceptedPrivacyPolicy = it }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            AuthSubmitButton(
                isSignIn = isSignIn,
                username = username,
                email = email,
                password = password,
                acceptedTerms = acceptedTerms,
                acceptedPrivacyPolicy = acceptedPrivacyPolicy,
                loading = loading,
                onLoadingChange = { loading = it },
                onErrorMessageChange = { errorMessage = it },
                authApiService = authApiService,
                context = context,
                authSession = authSession
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (isSignIn) {
                TextButton(
                    onClick = { showPasswordRecovery = true },
                    modifier = Modifier.testTag("ForgotPasswordButton")
                ) {
                    Text("Forgot Password?")
                }

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedButton(
                    onClick = {},
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("GoogleSignInButton")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AccountCircle,
                            contentDescription = "Google Icon",
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Sign in with Google")
                    }
                }
            }
        }
    }
}

@Composable
fun AuthToggleButtons(isSignIn: Boolean, onToggle: (Boolean) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center
    ) {
        OutlinedButton(
            onClick = { onToggle(true) },
            enabled = !isSignIn
        ) {
            Text("Sign In")
        }
        Spacer(modifier = Modifier.width(16.dp))
        OutlinedButton(
            modifier = Modifier.testTag("SignupButton"),
            onClick = { onToggle(false) },
            enabled = isSignIn
        ) {
            Text("Sign Up")
        }
    }
}

@Composable
fun AuthFields(
    isSignIn: Boolean,
    username: String,
    onUsernameChange: (String) -> Unit,
    email: String,
    onEmailChange: (String) -> Unit,
    password: String,
    onPasswordChange: (String) -> Unit
) {
    if (!isSignIn) {
        OutlinedTextField(
            value = username,
            onValueChange = onUsernameChange,
            label = { Text("Username") },
            modifier = Modifier
                .fillMaxWidth()
                .testTag("UsernameField")
        )
        Spacer(modifier = Modifier.height(8.dp))
    }

    OutlinedTextField(
        value = email,
        onValueChange = onEmailChange,
        label = { Text("Email") },
        modifier = Modifier
            .fillMaxWidth()
            .testTag("EmailField"),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
    )
    Spacer(modifier = Modifier.height(8.dp))

    OutlinedTextField(
        value = password,
        onValueChange = onPasswordChange,
        label = { Text("Password") },
        modifier = Modifier.fillMaxWidth(),
        visualTransformation = PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
    )
}

@Composable
fun AuthTermsCheckboxes(
    acceptedTerms: Boolean,
    onTermsChange: (Boolean) -> Unit,
    acceptedPrivacyPolicy: Boolean,
    onPrivacyChange: (Boolean) -> Unit
) {
    Spacer(modifier = Modifier.height(8.dp))
    Row(verticalAlignment = Alignment.CenterVertically) {
        Checkbox(
            checked = acceptedTerms,
            onCheckedChange = onTermsChange,
            modifier = Modifier.testTag("TermsCheckbox")
        )
        Text(text = "Accept Terms")
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
        Checkbox(
            checked = acceptedPrivacyPolicy,
            onCheckedChange = onPrivacyChange,
            modifier = Modifier.testTag("PrivacyCheckbox")
        )
        Text(text = "Accept Privacy Policy")
    }
}

@Composable
fun AuthSubmitButton(
    isSignIn: Boolean,
    username: String,
    email: String,
    password: String,
    acceptedTerms: Boolean,
    acceptedPrivacyPolicy: Boolean,
    loading: Boolean,
    onLoadingChange: (Boolean) -> Unit,
    onErrorMessageChange: (String) -> Unit,
    authApiService: AuthApiService,
    context: android.content.Context,
    authSession: AuthSessionInterface,
) {
    Button(
        onClick = {
            onErrorMessageChange("")
            onLoadingChange(true)

            if (!isSignIn && (!acceptedTerms || !acceptedPrivacyPolicy)) {
                onErrorMessageChange("You must accept the Terms and Privacy Policy.")
                onLoadingChange(false)
                return@Button
            }

            CoroutineScope(Dispatchers.IO).launch {
                if (isSignIn) {
                    val request = SignInRequest(email, password)
                    authApiService.signIn(request).enqueue(object : Callback<SignInResponse> {
                        override fun onResponse(call: Call<SignInResponse>, response: Response<SignInResponse>) {
                            onLoadingChange(false)
                            if (response.isSuccessful) {
                                val token = response.body()?.accessToken ?: ""
                                Log.d("Auth", "Login successful, Token: $token")
                                authSession.setToken(token)
                                context.startActivity(Intent(context, MapboxActivity::class.java))
                            } else {
                                val errorBody = response.errorBody()?.string() ?: "Login failed."
                                Log.e("Auth", "Login error: $errorBody")
                                onErrorMessageChange(errorBody)
                            }
                        }

                        override fun onFailure(call: Call<SignInResponse>, t: Throwable) {
                            onLoadingChange(false)
                            val errorMessage = "Network error: ${t.message}"
                            Log.e("Auth", errorMessage)
                            onErrorMessageChange(errorMessage)
                        }
                    })
                } else {
                    val request = SignUpRequest(username, email, password, acceptedTerms, acceptedPrivacyPolicy)
                    authApiService.signUp(request).enqueue(object : Callback<SignUpResponse> {
                        override fun onResponse(call: Call<SignUpResponse>, response: Response<SignUpResponse>) {
                            onLoadingChange(false)
                            if (response.isSuccessful) {
                                val token = response.body()?.accessToken ?: ""
                                Log.d("Auth", "Signup successful, Token: $token")
                                context.startActivity(Intent(context, MapboxActivity::class.java))
                            } else {
                                val errorBody = response.errorBody()?.string() ?: "Signup failed."
                                Log.e("Auth", "Signup error: $errorBody")
                                onErrorMessageChange(errorBody)
                            }
                        }

                        override fun onFailure(call: Call<SignUpResponse>, t: Throwable) {
                            onLoadingChange(false)
                            val errorMessage = "Network error: ${t.message}"
                            Log.e("Auth", errorMessage)
                            onErrorMessageChange(errorMessage)
                        }
                    })
                }
            }
        },
        modifier = Modifier
            .fillMaxWidth()
            .testTag("SubmitButton"),
        enabled = !loading
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier
                    .size(24.dp)
                    .testTag("LoadingIndicator"),
                color = Color.White,
                strokeWidth = 2.dp
            )
        } else {
            Text(text = if (isSignIn) "Sign In" else "Sign Up")
        }
    }
}