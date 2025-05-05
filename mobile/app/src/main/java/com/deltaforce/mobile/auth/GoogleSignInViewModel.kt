package com.deltaforce.mobile.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.deltaforce.mobile.network.GoogleAuthResponse
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class GoogleSignInState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val user: GoogleAuthResponse? = null,
    val error: String? = null
)

sealed class GoogleSignInEvent {
    object SignIn : GoogleSignInEvent()
    object SignOut : GoogleSignInEvent()
    data class SignInResult(val task: Task<GoogleSignInAccount>) : GoogleSignInEvent()
    object CheckLastSignedInAccount : GoogleSignInEvent()
}

class GoogleSignInViewModel(
    val googleAuthHelper: GoogleAuthHelper
) : ViewModel() {

    private val _state = MutableStateFlow(GoogleSignInState())
    val state: StateFlow<GoogleSignInState> = _state.asStateFlow()

    fun onEvent(event: GoogleSignInEvent) {
        when (event) {
            is GoogleSignInEvent.SignIn -> {
                // This will be handled by the activity result
            }
            is GoogleSignInEvent.SignInResult -> {
                viewModelScope.launch {
                    _state.value = _state.value.copy(isLoading = true)
                    googleAuthHelper.handleSignInResult(event.task)
                        .onSuccess { response ->
                            _state.value = _state.value.copy(
                                isLoading = false,
                                isAuthenticated = true,
                                user = response,
                                error = null
                            )
                        }
                        .onFailure { error ->
                            _state.value = _state.value.copy(
                                isLoading = false,
                                isAuthenticated = false,
                                user = null,
                                error = error.message
                            )
                        }
                }
            }
            is GoogleSignInEvent.SignOut -> {
                viewModelScope.launch {
                    try {
                        googleAuthHelper.signOut()
                        _state.value = _state.value.copy(
                            isAuthenticated = false,
                            user = null,
                            error = null
                        )
                    } catch (e: Exception) {
                        _state.value = _state.value.copy(
                            error = e.message ?: "Failed to sign out"
                        )
                    }
                }
            }
            is GoogleSignInEvent.CheckLastSignedInAccount -> {
                val account = googleAuthHelper.getLastSignedInAccount()
                if (account != null) {
                    onEvent(GoogleSignInEvent.SignInResult(
                        com.google.android.gms.tasks.Tasks.forResult(account)
                    ))
                }
            }
        }
    }
} 