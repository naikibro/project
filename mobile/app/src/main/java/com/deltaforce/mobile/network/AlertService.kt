package com.deltaforce.mobile.network

import com.deltaforce.mobile.BuildConfig
import com.deltaforce.mobile.ui.alerts.AuthInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient

data class Alert(
    val id: Int? = null,
    val title: String,
    val description: String,
    val type: String,
    val date: String, // ISO 8601 format
    val coordinates: Map<String, Any> // Adjust type as needed
)

interface AlertApi {
    @GET("alerts")
    fun getAlerts(): Call<List<Alert>>

    @GET("alerts/{id}")
    fun getAlert(@Path("id") id: Int): Call<Alert>

    @GET("alerts/near-me")
    fun getAlertsNearMe(@Query("latitude") latitude: Double, @Query("longitude") longitude: Double): Call<List<Alert>>

    @POST("alerts")
    fun createAlert(@Body alert: Alert): Call<Alert>

    @PUT("alerts/{id}")
    fun updateAlert(@Path("id") id: Int, @Body alert: Alert): Call<Alert>

    @DELETE("alerts/{id}")
    fun deleteAlert(@Path("id") id: Int): Call<Unit>
}

class AlertService(
    alertApi: AlertApi? = null,
    baseUrl: String = BuildConfig.API_URL,
    tokenProvider: () -> String?
) {
    private val api: AlertApi = alertApi ?: run {
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenProvider))
            .build()
        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(AlertApi::class.java)
    }

    fun getAlerts(): Call<List<Alert>> = api.getAlerts()

    fun getAlert(id: Int): Call<Alert> = api.getAlert(id)

    fun getAlertsNearMe(latitude: Double, longitude: Double): Call<List<Alert>> = api.getAlertsNearMe(latitude, longitude)

    fun createAlert(alert: Alert): Call<Alert> = api.createAlert(alert)

    fun updateAlert(id: Int, alert: Alert): Call<Alert> = api.updateAlert(id, alert)

    fun deleteAlert(id: Int): Call<Unit> = api.deleteAlert(id)
}