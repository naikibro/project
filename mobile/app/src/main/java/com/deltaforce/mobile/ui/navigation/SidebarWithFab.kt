package com.deltaforce.supmap.ui.navigation

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

@Composable
fun SidebarWithFab(
    onSignOut: () -> Unit,
    drawerState: DrawerState,
    content: @Composable (PaddingValues) -> Unit
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    ModalNavigationDrawer(
        scrimColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
        drawerState = drawerState,
        gesturesEnabled = !drawerState.isClosed,
        drawerContent = {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Spacer(modifier = Modifier.weight(1f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        TextButton(
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.supmap.fr/privacy-policy"))
                                context.startActivity(intent)
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Privacy Policies")
                        }

                        TextButton(
                            onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.supmap.fr/terms-and-conditions"))
                                context.startActivity(intent)
                                scope.launch { drawerState.close() }
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Terms of Service")
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedButton(
                        onClick = {
                            onSignOut()
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Sign Out")
                    }
                }
            }
        }
    ) {
        Scaffold(
            floatingActionButton = {
                FloatingActionButton(
                    onClick = {
                        scope.launch { drawerState.open() }
                    },
                    modifier = Modifier.testTag("Hamburger")
                ) {
                    Icon(
                        imageVector = Icons.Default.Menu,
                        contentDescription = "Open Sidebar"
                    )
                }
            },
            content = { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    content(innerPadding)
                }
            }
        )
    }
}

@Preview(showBackground = true, name = "Sidebar Closed")
@Composable
fun SidebarWithFabPreviewClosed() {
    MaterialTheme {
        SidebarWithFab(
            onSignOut = { },
            drawerState = rememberDrawerState(DrawerValue.Closed)
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                Text(text = "Preview of Main Content (Sidebar Closed)")
            }
        }
    }
}

@Preview(showBackground = true, name = "Sidebar Open")
@Composable
fun SidebarWithFabPreviewOpen() {
    MaterialTheme {
        SidebarWithFab(
            onSignOut = { },
            drawerState = rememberDrawerState(DrawerValue.Open)
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                Text(text = "Preview of Main Content (Sidebar Open)")
            }
        }
    }
}