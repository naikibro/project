package com.deltaforce.mobile

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import com.deltaforce.mobile.ui.navigation.SidebarWithFab
import com.deltaforce.mobile.ui.theme.SupmapTheme

class MapboxActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SupmapTheme {
                SidebarWithFab(
                    onSignOut = {
                        AuthSession.setToken(null)
                        startActivity(Intent(this@MapboxActivity, MainActivity::class.java))
                        finish()
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        Text(text = "This is the map activity")
                    }
                }
            }
        }
    }
}
