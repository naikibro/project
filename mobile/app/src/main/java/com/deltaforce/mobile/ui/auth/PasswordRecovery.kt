package com.deltaforce.mobile.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.network.ForgotPasswordRequest
import com.deltaforce.mobile.network.ResetPasswordRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PasswordRecovery(
    authApiService: AuthApiService = AuthApiService(),
    onBack: () -> Unit
) {
    var isResetPassword by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var token by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var successMessage by remember { mutableStateOf("") }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(errorMessage) {
        if (errorMessage.isNotEmpty()) {
            snackbarHostState.showSnackbar(errorMessage)
            errorMessage = ""
        }
    }

    LaunchedEffect(successMessage) {
        if (successMessage.isNotEmpty()) {
            snackbarHostState.showSnackbar(successMessage)
            successMessage = ""
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text(if (isResetPassword) "Reset Password" else "Forgot Password") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .padding(innerPadding),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (!isResetPassword) {
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("EmailField"),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        loading = true
                        errorMessage = ""
                        successMessage = ""

                        val request = ForgotPasswordRequest(email)
                        authApiService.forgotPassword(request).enqueue(object : Callback<Unit> {
                            override fun onResponse(call: Call<Unit>, response: Response<Unit>) {
                                loading = false
                                if (response.isSuccessful) {
                                    successMessage = "Password reset link sent to your email"
                                } else {
                                    errorMessage = response.errorBody()?.string() ?: "Failed to send reset link"
                                }
                            }

                            override fun onFailure(call: Call<Unit>, t: Throwable) {
                                loading = false
                                errorMessage = "Network error: ${t.message}"
                            }
                        })
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("SubmitButton"),
                    enabled = !loading && email.isNotEmpty()
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
                        Text("Send Reset Link")
                    }
                }
            } else {
                OutlinedTextField(
                    value = token,
                    onValueChange = { token = it },
                    label = { Text("Reset Token") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("TokenField")
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it },
                    label = { Text("New Password") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("NewPasswordField"),
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                )

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        loading = true
                        errorMessage = ""
                        successMessage = ""

                        val request = ResetPasswordRequest(token, newPassword)
                        authApiService.resetPassword(request).enqueue(object : Callback<Unit> {
                            override fun onResponse(call: Call<Unit>, response: Response<Unit>) {
                                loading = false
                                if (response.isSuccessful) {
                                    successMessage = "Password reset successful"
                                    onBack()
                                } else {
                                    errorMessage = response.errorBody()?.string() ?: "Failed to reset password"
                                }
                            }

                            override fun onFailure(call: Call<Unit>, t: Throwable) {
                                loading = false
                                errorMessage = "Network error: ${t.message}"
                            }
                        })
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("SubmitButton"),
                    enabled = !loading && token.isNotEmpty() && newPassword.isNotEmpty()
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
                        Text("Reset Password")
                    }
                }
            }
        }
    }
} 