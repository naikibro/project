package com.deltaforce.mobile.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mapbox.geojson.Point
import com.deltaforce.mobile.BuildConfig

@Composable
fun NavigationSnackbar(
    origin: Point,
    destination: Point,
    distanceInMeters: Number,
    onCancelNavigation: () -> Unit,
    onDebug: () -> Unit,
    modifier: Modifier = Modifier
) {
    val viewModel: NavigationViewModel = viewModel(
        factory = NavigationViewModel.provideFactory(BuildConfig.MAPBOX_ACCESS_TOKEN)
    )
    
    // Update the view model when distance or points change
    LaunchedEffect(origin, destination, distanceInMeters) {
        viewModel.updateDistance(origin, destination, distanceInMeters)
    }
    
    // Collect the navigation state
    val navigationState by viewModel.navigationState.collectAsState()

    Surface(
        modifier = modifier,
        color = MaterialTheme.colorScheme.surfaceContainer.copy(alpha = 0.8f),
        shape = MaterialTheme.shapes.medium,
        tonalElevation = 2.dp
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .widthIn(min = 200.dp, max = 300.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            NavigationMetrics(
                distance = navigationState.formattedDistance,
                eta = navigationState.estimatedTime
            )

            NavigationButtons(
                onStopNavigation = onCancelNavigation,
                onAlert = onDebug,
                onDanger = onDebug
            )
        }
    }
} 