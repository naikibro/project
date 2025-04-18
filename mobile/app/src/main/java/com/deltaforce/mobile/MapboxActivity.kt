package com.deltaforce.mobile

import AuthSession
import AuthSessionInterface
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import com.deltaforce.mobile.ui.theme.SupmapTheme
import com.deltaforce.supmap.ui.navigation.SidebarWithFab
import com.mapbox.geojson.Point
import com.mapbox.maps.extension.compose.MapboxMap
import com.mapbox.maps.extension.compose.animation.viewport.rememberMapViewportState
import kotlinx.coroutines.launch

class MapboxActivity(private val authSession: AuthSessionInterface = AuthSession) : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (authSession.accessToken == null) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContent {
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
            val scope = rememberCoroutineScope()

            BackHandler {
                if (drawerState.isOpen) {
                    scope.launch {
                        drawerState.close()
                    }
                }
            }

            SupmapTheme {
                SidebarWithFab(
                    onSignOut = {
                        authSession.clear()
                        startActivity(Intent(this@MapboxActivity, MainActivity::class.java))
                        finish()
                    },
                    drawerState = drawerState
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .pointerInput(Unit) {
                                detectTapGestures {}
                            }
                    ) {
                        MapboxMap(
                            modifier = Modifier.fillMaxSize().testTag("Map View"),
                            mapViewportState = rememberMapViewportState {
                                setCameraOptions {
                                    zoom(2.0)
                                    center(Point.fromLngLat(-98.0, 39.5))
                                    pitch(0.0)
                                    bearing(0.0)
                                }
                            }
                        )
                    }
                }
            }
        }
    }
}