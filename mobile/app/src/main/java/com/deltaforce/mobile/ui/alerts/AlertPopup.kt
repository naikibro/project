package com.deltaforce.mobile.ui.alerts

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.Alert
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.Duration
import java.time.temporal.ChronoUnit

@RequiresApi(Build.VERSION_CODES.O)
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
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    painter = painterResource(
                        when (alert.type) {
                            "info" -> R.drawable.baseline_info_24
                            "accident" -> R.drawable.baseline_car_crash_24
                            "traffic_jam" -> R.drawable.baseline_traffic_24
                            "road_closed" -> R.drawable.baseline_block_24
                            "police_control" -> R.drawable.baseline_local_police_24
                            "obstacle_on_road" -> R.drawable.baseline_report_24
                            "warning" -> R.drawable.baseline_warning_24
                            else -> R.drawable.baseline_info_24
                        }
                    ),
                    contentDescription = "Alert type icon",
                    modifier = Modifier.size(24.dp)
                )
                Text(alert.title, fontWeight = FontWeight.Bold, fontSize = 20.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier.padding(vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Description
                Text(
                    text = alert.description,
                    style = MaterialTheme.typography.bodyLarge
                )

                // Time ago
                val dateTime = LocalDateTime.parse(alert.date, DateTimeFormatter.ISO_DATE_TIME)
                val now = LocalDateTime.now()
                val duration = Duration.between(dateTime, now)
                val timeAgo = when {
                    duration.toMinutes() < 1 -> "Just now"
                    duration.toHours() < 1 -> "${duration.toMinutes()} minutes ago"
                    duration.toDays() < 1 -> "${duration.toHours()} hours ago"
                    else -> "${duration.toDays()} days ago"
                }
                Text(
                    text = timeAgo,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Location
                val lat = alert.coordinates["latitude"]
                val lng = alert.coordinates["longitude"]
                if (lat != null && lng != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(R.drawable.baseline_location_pin_24),
                            contentDescription = "Location",
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = String.format("%.6f, %.6f", lat, lng),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
    )
}