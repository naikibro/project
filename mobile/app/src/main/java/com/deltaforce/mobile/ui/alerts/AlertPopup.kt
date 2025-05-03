package com.deltaforce.mobile.ui.alerts

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.Button
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.deltaforce.mobile.network.Alert

@Composable
fun AlertPopup(
    alert: Alert,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = {
            Button(onClick = onDismiss) {
                Text("Close")
            }
        },
        title = {
            Text(alert.title, fontWeight = FontWeight.Bold, fontSize = 20.sp)
        },
        text = {
            Surface {
                androidx.compose.foundation.layout.Column {
                    Text("Type: ${alert.type}")
                    Text("Description: ${alert.description}")
                    Text("Date: ${alert.date}")
                    val lat = alert.coordinates["latitude"]
                    val lng = alert.coordinates["longitude"]
                    if (lat != null && lng != null) {
                        Text("Location: $lat, $lng")
                    }
                }
            }
        }
    )
}