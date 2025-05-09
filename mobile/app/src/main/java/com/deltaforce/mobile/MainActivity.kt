package com.deltaforce.mobile

import AuthSession
import AuthSessionInterface
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.ui.auth.AuthBox
import com.deltaforce.mobile.ui.theme.SupmapTheme
import android.util.Log

class MainActivity(private val authSession: AuthSessionInterface = AuthSession) : ComponentActivity() {
    private lateinit var authApiService: AuthApiService
    private val snackbarHostState = SnackbarHostState()
    private var hasLocationPermission by mutableStateOf(false)

    private val locationPermissionRequest = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasLocationPermission = when {
            permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true -> {
                Log.d("MainActivity", "Location permission granted")
                true
            }
            else -> {
                Log.e("MainActivity", "Location permission denied")
                false
            }
        }
        
        if (hasLocationPermission && authSession.accessToken != null) {
            navigateToMap()
        }
    }

    private fun checkAndRequestPermissions() {
        when {
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED -> {
                hasLocationPermission = true
                if (authSession.accessToken != null) {
                    navigateToMap()
                }
            }
            else -> {
                locationPermissionRequest.launch(arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                ))
            }
        }
    }

    private fun navigateToMap() {
        if (!hasLocationPermission) {
            return
        }
        startActivity(Intent(this, MapboxActivity::class.java))
        finish()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        authApiService = AuthApiService()
        checkAndRequestPermissions()

        enableEdgeToEdge()
        setContent {
            SupmapTheme {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    snackbarHost = {
                        SnackbarHost(hostState = snackbarHostState)
                    }
                ) { innerPadding ->
                    WelcomeBox(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        onAuthSuccess = {
                            if (hasLocationPermission) {
                                navigateToMap()
                            } else {
                                checkAndRequestPermissions()
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun WelcomeBox(
    modifier: Modifier = Modifier,
    onAuthSuccess: () -> Unit = {}
) {
    val logo: Int = if (isSystemInDarkTheme()) {
        R.drawable.logo_full_black
    } else {
        R.drawable.logo_full
    }

    Column(
        modifier = modifier
            .padding(16.dp)
            .fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Image(
            painter = painterResource(id = logo),
            contentDescription = "Welcome Image",
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp)
        )
        AuthBox(onAuthSuccess = onAuthSuccess)
    }
}