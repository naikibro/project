package com.deltaforce.mobile.network

import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.mockito.Mockito.*
import retrofit2.Call

class AlertServiceTest {

    private lateinit var alertApi: AlertApi
    private lateinit var alertService: AlertService
    private lateinit var dummyAlert: Alert
    private lateinit var dummyCall: Call<Alert>
    private lateinit var dummyListCall: Call<List<Alert>>

    @Before
    fun setUp() {
        alertApi = mock(AlertApi::class.java)
        alertService = AlertService(alertApi, "http://localhost/")
        dummyAlert = Alert(
            id = 1,
            title = "Test",
            description = "Test desc",
            type = "info",
            date = "2024-05-03T12:00:00Z",
            coordinates = mapOf("latitude" to 0.0, "longitude" to 0.0)
        )
        dummyCall = mock(Call::class.java) as Call<Alert>
        dummyListCall = mock(Call::class.java) as Call<List<Alert>>
    }

    @Test
    fun testGetAlerts() {
        `when`(alertApi.getAlerts()).thenReturn(dummyListCall)
        val result = alertService.getAlerts()
        assertEquals(dummyListCall, result)
        verify(alertApi).getAlerts()
    }

    @Test
    fun testGetAlert() {
        `when`(alertApi.getAlert(1)).thenReturn(dummyCall)
        val result = alertService.getAlert(1)
        assertEquals(dummyCall, result)
        verify(alertApi).getAlert(1)
    }

    @Test
    fun testGetAlertsNearMe() {
        `when`(alertApi.getAlertsNearMe(0.0, 0.0)).thenReturn(dummyListCall)
        val result = alertService.getAlertsNearMe(0.0, 0.0)
        assertEquals(dummyListCall, result)
        verify(alertApi).getAlertsNearMe(0.0, 0.0)
    }

    @Test
    fun testCreateAlert() {
        `when`(alertApi.createAlert(dummyAlert)).thenReturn(dummyCall)
        val result = alertService.createAlert(dummyAlert)
        assertEquals(dummyCall, result)
        verify(alertApi).createAlert(dummyAlert)
    }

    @Test
    fun testUpdateAlert() {
        `when`(alertApi.updateAlert(1, dummyAlert)).thenReturn(dummyCall)
        val result = alertService.updateAlert(1, dummyAlert)
        assertEquals(dummyCall, result)
        verify(alertApi).updateAlert(1, dummyAlert)
    }

    @Test
    fun testDeleteAlert() {
        val dummyUnitCall = mock(Call::class.java) as Call<Unit>
        `when`(alertApi.deleteAlert(1)).thenReturn(dummyUnitCall)
        val result = alertService.deleteAlert(1)
        assertEquals(dummyUnitCall, result)
        verify(alertApi).deleteAlert(1)
    }
}