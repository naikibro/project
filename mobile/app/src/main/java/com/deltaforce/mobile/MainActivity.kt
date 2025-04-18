package com.deltaforce.mobile

import AuthSession
import AuthSessionInterface
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.ui.auth.AuthBox
import com.deltaforce.mobile.ui.theme.SupmapTheme

class MainActivity(private val authSession: AuthSessionInterface = AuthSession) : ComponentActivity() {
    private lateinit var authApiService: AuthApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        authApiService = AuthApiService()

        if (authSession.accessToken != null) {
            startActivity(Intent(this, MapboxActivity::class.java))
            finish()
            return
        }

        enableEdgeToEdge()
        setContent {
            SupmapTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    WelcomeBox(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun WelcomeBox(
    modifier: Modifier = Modifier
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
        AuthBox()
    }
}

@Preview(showBackground = true)
@Composable
fun WelcomeBoxPreview() {
    SupmapTheme {
        WelcomeBox(
            modifier = Modifier
        )
    }
}
