package com.deltaforce.mobile.ui.alerts

import android.os.Build
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.Alert
import com.mapbox.geojson.Point
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Composable
fun CreateAlertForm(
    currentLocation: Point,
    onSubmit: (AlertData) -> Unit,
    onCancel: () -> Unit
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var category by remember { mutableStateOf(AlertCategory.INFO) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        OutlinedTextField(
            value = description,
            onValueChange = { description = it },
            label = { Text("Description") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3
        )

        AlertCategorySelector(
            selectedCategory = category,
            onCategorySelected = { category = it }
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = {
                    val alertData = AlertData(
                        title = title,
                        description = description,
                        category = category,
                        location = currentLocation
                    )
                    onSubmit(alertData)
                },
                enabled = title.isNotBlank() && description.isNotBlank()
            ) {
                Text("Create Alert")
            }
        }
    }
}

@Composable
private fun AlertCategorySelector(
    selectedCategory: AlertCategory,
    onCategorySelected: (AlertCategory) -> Unit
) {
    Column {
        Text(
            text = "Category",
            style = MaterialTheme.typography.labelLarge
        )
        FlowRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            AlertCategory.values().forEach { category ->
                FilterChip(
                    selected = category == selectedCategory,
                    onClick = { onCategorySelected(category) },
                    label = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                painter = painterResource(
                                    when (category) {
                                        AlertCategory.INFO -> R.drawable.baseline_info_24
                                        AlertCategory.ACCIDENT -> R.drawable.baseline_car_crash_24
                                        AlertCategory.TRAFFIC_JAM -> R.drawable.baseline_traffic_24
                                        AlertCategory.ROAD_CLOSED -> R.drawable.baseline_block_24
                                        AlertCategory.POLICE_CONTROL -> R.drawable.baseline_local_police_24
                                        AlertCategory.OBSTACLE_ON_ROAD -> R.drawable.baseline_report_24
                                        AlertCategory.WARNING -> R.drawable.baseline_warning_24
                                    }
                                ),
                                contentDescription = null
                            )
                            Text(category.name.replace("_", " "))
                        }
                    }
                )
            }
        }
    }
}

/* TODO : please make this work with backend model */
enum class AlertCategory(val backendValue: String) {
    INFO("info"),
    ACCIDENT("accident"),
    TRAFFIC_JAM("traffic_jam"),
    ROAD_CLOSED("road_closed"),
    POLICE_CONTROL("police_control"),
    OBSTACLE_ON_ROAD("obstacle_on_road"),
    WARNING("warning"),
}

data class AlertData(
    val title: String,
    val description: String,
    val category: AlertCategory,
    val location: Point
) {
    @RequiresApi(Build.VERSION_CODES.O)
    fun toAlert(): Alert {
        return Alert(
            title = title,
            description = description,
            type = category.backendValue,
            date = LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
            coordinates = mapOf(
                "latitude" to location.latitude(),
                "longitude" to location.longitude()
            )
        )
    }
}