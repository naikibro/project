package com.deltaforce.mobile.ui.navigation

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.User
import kotlinx.coroutines.launch

@Composable
fun SidebarWithFab(
    onSignOut: () -> Unit,
    onSearchClick: () -> Unit,
    onCenterLocation: () -> Unit,
    onAlert: () -> Unit,
    user: User?,
    isLocationCentered: Boolean,
    drawerState: DrawerState,
    content: @Composable (PaddingValues) -> Unit
) {
    var isFabExpanded by remember { mutableStateOf(false) }
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
                    // Profile section with avatar
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp)
                            .clickable {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.supmap.fr/sign-in"))
                                context.startActivity(intent)
                            },
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        elevation = CardDefaults.cardElevation(
                            defaultElevation = 2.dp
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            if (user != null) {
                                AsyncImage(
                                    model = user.profilePicture,
                                    contentDescription = "Profile picture",
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop,
                                    error = painterResource(id = R.drawable.baseline_person_24)
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Profile picture",
                                    modifier = Modifier.size(64.dp)
                                )
                            }
                            Column {
                                if (user != null) {
                                    Text(
                                        text = user.username,
                                        style = MaterialTheme.typography.titleLarge
                                    )
                                    Text(
                                        text = user.email,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                } else {
                                    Text(
                                        text = "Guest User",
                                        style = MaterialTheme.typography.titleLarge
                                    )
                                    Text(
                                        text = "Sign in to access your profile",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

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
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.Bottom
                ) {
                    FloatingActionButton(
                        onClick = { onCenterLocation(); },
                        modifier = Modifier.testTag("Center Location FAB")
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = ""
                        )
                    }
                    FloatingActionButton(
                        onClick = { onAlert() },
                        modifier = Modifier.testTag("Alert FAB")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = ""
                        )
                    }
                    FloatingActionButton(
                        onClick = {
                            onSearchClick()
                        },
                        modifier = Modifier.testTag("Search FAB")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search a place"
                        )
                    }
                    FabMenu(
                        isExpanded = isFabExpanded,
                        onMenuClick = { isFabExpanded = !isFabExpanded },
                        onSignOutClick = {
                            isFabExpanded = false
                            scope.launch { drawerState.open() }
                        }
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