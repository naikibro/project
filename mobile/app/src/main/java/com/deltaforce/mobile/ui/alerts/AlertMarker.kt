package com.deltaforce.mobile.ui.alerts

import androidx.compose.runtime.Composable
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.Alert
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import okhttp3.Interceptor
import okhttp3.Response

@Composable
fun AlertMarker(
    alert: Alert,
    annotationManager: PointAnnotationManager,
    onClick: (Alert) -> Unit
) {
    val iconId = when (alert.type) {
        "info" -> R.drawable.baseline_info_24
        "accident" -> R.drawable.baseline_car_crash_24
        "traffic_jam" -> R.drawable.baseline_traffic_24
        "road_closed" -> R.drawable.baseline_block_24
        "police_control" -> R.drawable.baseline_local_police_24
        "obstacle_on_road" -> R.drawable.baseline_report_24
        "warning" -> R.drawable.baseline_warning_24
        else -> R.drawable.baseline_info_24
    }

    val latitude = alert.coordinates["latitude"] as? Double ?: 0.0
    val longitude = alert.coordinates["longitude"] as? Double ?: 0.0

    val pointAnnotation = annotationManager.create(
        PointAnnotationOptions()
            .withPoint(com.mapbox.geojson.Point.fromLngLat(longitude, latitude))
            .withIconImage(iconId.toString())
            .withIconSize(1.0)
    )

    annotationManager.addClickListener { annotation ->
        if (annotation == pointAnnotation) {
            onClick(alert)
            true
        } else {
            false
        }
    }
}

class AuthInterceptor(private val tokenProvider: () -> String?) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenProvider()
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
} 