package com.deltaforce.mobile.ui.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.mapbox.geojson.Point
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import kotlin.math.roundToInt

data class NavigationState(
    val distanceInMeters: Number = 0,
    val isNavigating: Boolean = false,
    val estimatedTime: String = "",
    val formattedDistance: String = ""
)

class NavigationViewModel(
    private val mapboxAccessToken: String
) : ViewModel() {

    private val client = OkHttpClient()

    private val _navigationState = MutableStateFlow(NavigationState())
    val navigationState: StateFlow<NavigationState> = _navigationState.asStateFlow()

    /**
     * Now takes origin & destination so that we can fetch a real ETA.
     */
    fun updateDistance(
        origin: Point,
        destination: Point,
        distanceInMeters: Number
    ) {
        viewModelScope.launch {
            // Format the distance immediately
            val formatted = formatDistance(distanceInMeters)

            // Hit the Matrix API to get a real‐world ETA
            val eta = try {
                fetchETA(origin, destination)
            } catch (e: Exception) {
                // fallback to static
                defaultETA(distanceInMeters)
            }

            _navigationState.value = _navigationState.value.copy(
                distanceInMeters = distanceInMeters,
                formattedDistance = formatted,
                estimatedTime = eta
            )
        }
    }

    private fun formatDistance(distanceInMeters: Number): String {
        return when {
            distanceInMeters.toInt() >= 1_000 -> {
                val km = (distanceInMeters.toDouble() / 1_000.0 * 10).roundToInt() / 10.0
                "$km km"
            }
            else -> "${distanceInMeters.toInt()} m"
        }
    }

    /** 
     * Fallback in case the network‐call fails. 
     */
    private fun defaultETA(distanceInMeters: Number): String {
        val speedKmPerHour = 5.0
        val hours = (distanceInMeters.toDouble() / 1000.0) / speedKmPerHour
        val minutes = (hours * 60).roundToInt()
        return formatSeconds(minutes * 60.0)
    }

    /**
     * Suspends on IO, calls the Mapbox Matrix API, parses out durations[0][1].
     */
    private suspend fun fetchETA(origin: Point, destination: Point): String =
        withContext(Dispatchers.IO) {
            val coords = "${origin.longitude()},${origin.latitude()};" +
                         "${destination.longitude()},${destination.latitude()}"
            val url = "https://api.mapbox.com/directions-matrix/v1/" +
                      "mapbox/driving-traffic/$coords" +
                      "?access_token=$mapboxAccessToken"

            val req = Request.Builder().url(url).build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) throw Exception("Matrix API failed: ${resp.code}")
                val body = resp.body?.string() ?: throw Exception("Empty body")
                val root = JSONObject(body)
                val durations = root.getJSONArray("durations")
                // durations is an array of arrays; [0][1] is origin→destination
                val sec = durations
                    .getJSONArray(0)
                    .getDouble(1)
                formatSeconds(sec)
            }
        }

    /**
     * Turn raw seconds into "H h M min" or "M min".
     */
    private fun formatSeconds(seconds: Double): String {
        val totalMin = (seconds / 60).roundToInt()
        return if (totalMin >= 60) {
            val h = totalMin / 60
            val m = totalMin % 60
            "${h} h ${m} min"
        } else {
            "${totalMin} min"
        }
    }

    companion object {
        fun provideFactory(mapboxAccessToken: String): ViewModelProvider.Factory {
            return object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return NavigationViewModel(mapboxAccessToken) as T
                }
            }
        }
    }
}
