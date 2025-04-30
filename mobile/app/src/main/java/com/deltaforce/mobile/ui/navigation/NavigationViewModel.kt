package com.deltaforce.mobile.ui.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

data class NavigationState(
    val distanceInMeters: Number = 0,
    val isNavigating: Boolean = false,
    val estimatedTime: String = "",
    val formattedDistance: String = ""
)

class NavigationViewModel : ViewModel() {
    private val _navigationState = MutableStateFlow(NavigationState())
    val navigationState: StateFlow<NavigationState> = _navigationState.asStateFlow()

    fun updateDistance(distanceInMeters: Number) {
        viewModelScope.launch {
            _navigationState.value = _navigationState.value.copy(
                distanceInMeters = distanceInMeters,
                formattedDistance = formatDistance(distanceInMeters),
                estimatedTime = calculateETA(distanceInMeters)
            )
        }
    }

    fun setNavigating(isNavigating: Boolean) {
        viewModelScope.launch {
            _navigationState.value = _navigationState.value.copy(
                isNavigating = isNavigating
            )
        }
    }

    private fun formatDistance(distanceInMeters: Number): String {
        return when {
            distanceInMeters.toInt() >= 1000 -> {
                val km = (distanceInMeters.toInt() / 1000.0 * 10).roundToInt() / 10.0
                "$km km"
            }
            else -> {
                val m = distanceInMeters.toInt()
                "$m m"
            }
        }
    }

    private fun calculateETA(distanceInMeters: Number): String {
        // Assuming average walking speed of 5 km/h
        val speedKmPerHour = 5.0
        val distanceKm = distanceInMeters.toDouble() / 1000.0
        val hours = distanceKm / speedKmPerHour
        val minutes = (hours * 60).roundToInt()
        
        return when {
            minutes >= 60 -> {
                val hours = minutes / 60
                val remainingMinutes = minutes % 60
                "$hours h $remainingMinutes min"
            }
            else -> "$minutes min"
        }
    }
} 