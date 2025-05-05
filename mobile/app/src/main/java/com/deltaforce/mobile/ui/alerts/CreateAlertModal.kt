package com.deltaforce.mobile.ui.alerts

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.tooling.preview.Preview
import com.mapbox.geojson.Point


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateAlertModal(
    isVisible: Boolean,
    currentLocation: Point,
    onDismiss: () -> Unit,
    onSubmit: (AlertData) -> Unit
) {
    if (isVisible) {
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            modifier = Modifier
                .fillMaxSize()
                .fillMaxWidth(),
            shape = MaterialTheme.shapes.large
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Create New Alert",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close"
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                CreateAlertForm(
                    currentLocation = currentLocation,
                    onSubmit = onSubmit,
                    onCancel = onDismiss
                )
            }
        }
    }
}

@Preview(showBackground = true, name = "CreateAlertModal")
@Composable
private fun CreateAlertModalPreview() {
    MaterialTheme {
        CreateAlertModal(
            isVisible = true,
            currentLocation = Point.fromLngLat(0.0, 0.0),
            onDismiss = {},
            onSubmit = {}
        )
    }
}