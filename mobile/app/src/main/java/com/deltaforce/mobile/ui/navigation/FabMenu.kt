package com.deltaforce.mobile.ui.navigation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp

@Composable
fun FabMenu(
    isExpanded: Boolean,
    onMenuClick: () -> Unit,
    onSignOutClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.End,
        modifier = modifier
    ) {
        AnimatedVisibility(
            visible = isExpanded,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            Column(
                horizontalAlignment = Alignment.End,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                FloatingActionButton(
                    onClick = onSignOutClick,
                    modifier = Modifier
                        .padding(top = 8.dp)
                        .testTag("Settings")
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = "Settings"
                    )
                }
            }
        }

        FloatingActionButton(
            onClick = onMenuClick,
            modifier = Modifier.testTag("Menu FAB")
        ) {
            Icon(
                imageVector = Icons.Default.Menu,
                contentDescription = "Open Menu"
            )
        }
    }
} 