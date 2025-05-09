package com.deltaforce.mobile

import AuthSession
import AuthSessionInterface
import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresApi
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.deltaforce.mobile.auth.GoogleAuthHelper
import com.deltaforce.mobile.network.AuthApiService
import com.deltaforce.mobile.ui.navigation.SidebarWithFab
import com.deltaforce.mobile.ui.theme.SupmapTheme
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.mapbox.api.directions.v5.models.RouteOptions
import com.mapbox.common.location.Location
import com.mapbox.geojson.Point
import com.mapbox.maps.CameraOptions
import com.mapbox.maps.EdgeInsets
import com.mapbox.maps.MapView
import com.mapbox.maps.plugin.animation.camera
import com.mapbox.maps.plugin.gestures.addOnMapClickListener
import com.mapbox.maps.plugin.locationcomponent.createDefault2DPuck
import com.mapbox.maps.plugin.locationcomponent.location
import com.mapbox.navigation.base.ExperimentalPreviewMapboxNavigationAPI
import com.mapbox.navigation.base.extensions.applyDefaultNavigationOptions
import com.mapbox.navigation.base.options.NavigationOptions
import com.mapbox.navigation.base.route.NavigationRoute
import com.mapbox.navigation.base.route.NavigationRouterCallback
import com.mapbox.navigation.base.route.RouterFailure
import com.mapbox.navigation.core.MapboxNavigation
import com.mapbox.navigation.core.directions.session.RoutesObserver
import com.mapbox.navigation.core.lifecycle.MapboxNavigationApp
import com.mapbox.navigation.core.lifecycle.MapboxNavigationObserver
import com.mapbox.navigation.core.lifecycle.requireMapboxNavigation
import com.mapbox.navigation.core.replay.route.ReplayProgressObserver
import com.mapbox.navigation.core.replay.route.ReplayRouteMapper
import com.mapbox.navigation.core.trip.session.LocationMatcherResult
import com.mapbox.navigation.core.trip.session.LocationObserver
import com.mapbox.navigation.ui.maps.camera.NavigationCamera
import com.mapbox.navigation.ui.maps.camera.data.MapboxNavigationViewportDataSource
import com.mapbox.navigation.ui.maps.location.NavigationLocationProvider
import com.mapbox.navigation.ui.maps.route.line.api.MapboxRouteLineApi
import com.mapbox.navigation.ui.maps.route.line.api.MapboxRouteLineView
import com.mapbox.navigation.ui.maps.route.line.model.MapboxRouteLineApiOptions
import com.mapbox.navigation.ui.maps.route.line.model.MapboxRouteLineViewOptions
import com.mapbox.search.SearchEngine
import com.mapbox.search.SearchEngineSettings
import com.mapbox.search.ApiType
import com.mapbox.search.common.CompletionCallback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import com.deltaforce.mobile.ui.search.SearchBottomSheet
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.ui.navigation.NavigationSnackbar
import com.mapbox.navigation.base.trip.model.RouteProgress
import com.mapbox.navigation.core.replay.MapboxReplayer
import com.mapbox.navigation.core.trip.session.RouteProgressObserver
import com.mapbox.maps.plugin.animation.MapAnimationOptions
import com.mapbox.maps.plugin.animation.easeTo
import com.mapbox.navigation.base.formatter.DistanceFormatterOptions
import com.mapbox.navigation.tripdata.progress.api.MapboxTripProgressApi
import com.mapbox.navigation.tripdata.progress.model.DistanceRemainingFormatter
import com.mapbox.navigation.tripdata.progress.model.EstimatedTimeToArrivalFormatter
import com.mapbox.navigation.tripdata.progress.model.TimeRemainingFormatter
import com.mapbox.navigation.tripdata.progress.model.TripProgressUpdateFormatter
import com.mapbox.navigation.core.trip.session.TripSessionState
import com.mapbox.navigation.core.trip.session.TripSessionStateObserver
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.Canvas
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.deltaforce.mobile.ui.navigation.NavigationViewModel
import androidx.activity.viewModels
import androidx.compose.material3.DrawerState
import androidx.compose.runtime.State
import androidx.lifecycle.LifecycleOwner
import com.deltaforce.mobile.network.Alert
import com.deltaforce.mobile.ui.alerts.CreateAlertModal
import com.deltaforce.mobile.ui.alerts.AlertData
import com.deltaforce.mobile.network.AlertService
import com.deltaforce.mobile.ui.alerts.AlertPopup
import com.mapbox.maps.plugin.annotation.annotations
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.core.content.ContextCompat
import androidx.core.graphics.drawable.DrawableCompat
import kotlin.math.pow
import kotlin.math.sqrt
import com.mapbox.maps.plugin.annotation.generated.OnPointAnnotationClickListener
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationManager
import com.mapbox.maps.plugin.annotation.generated.PointAnnotationOptions
import com.mapbox.maps.plugin.annotation.generated.createPointAnnotationManager
import com.deltaforce.mobile.network.AlertRatingService
import android.view.View
import com.mapbox.navigation.core.formatter.MapboxDistanceFormatter
import com.mapbox.navigation.tripdata.maneuver.api.MapboxManeuverApi
import com.mapbox.navigation.ui.components.maneuver.view.MapboxManeuverView

class MapboxActivity(private val authSession: AuthSessionInterface = AuthSession) : ComponentActivity() {
    // ===== Properties =====

    // Authentication
    private lateinit var authApiService: AuthApiService
    private lateinit var googleAuthHelper: GoogleAuthHelper

    // Map Components
    private var mapView: MapView? = null
    private var viewportDataSource: MapboxNavigationViewportDataSource? = null
    private var navigationCamera: NavigationCamera? = null
    private var routeLineApi: MapboxRouteLineApi? = null
    private var routeLineView: MapboxRouteLineView? = null
    private var replayProgressObserver: ReplayProgressObserver? = null
    private val navigationLocationProvider = NavigationLocationProvider()
    private val replayRouteMapper = ReplayRouteMapper()
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var currentPoint: Point? = null
    private var destinationPoint: Point? = null
    private var coroutineScope: CoroutineScope? = null
    private var searchEngine: SearchEngine? = null

    // Maneuver Components
    private var maneuverApi: MapboxManeuverApi? = null
    private var maneuverView: MapboxManeuverView? = null

    // State Management
    private val isBottomSheetVisible = MutableStateFlow(false)
    private val selectedDestination = MutableStateFlow<Point?>(null)
    private val isLocationCentered = MutableStateFlow(false)
    private val snackbarHostState = SnackbarHostState()
    private val isNavigating = MutableStateFlow(false)
    private val currentRouteProgress = MutableStateFlow<RouteProgress?>(null)
    private val replayer = MapboxReplayer()
    private val navigationViewModel: NavigationViewModel by viewModels()
    private val isAlertModalVisible = MutableStateFlow(false)
    private val selectedAlert = MutableStateFlow<Alert?>(null)
    private val nearbyAlerts = MutableStateFlow<List<Alert>>(emptyList())

    private var alertAnnotationManager: PointAnnotationManager? = null

    // Navigation Components
    private val tripProgressApi: MapboxTripProgressApi by lazy {
        val distanceFormatterOptions = DistanceFormatterOptions.Builder(this).build()
        val formatter = TripProgressUpdateFormatter.Builder(this)
            .distanceRemainingFormatter(DistanceRemainingFormatter(distanceFormatterOptions))
            .timeRemainingFormatter(TimeRemainingFormatter(this))
            .estimatedTimeToArrivalFormatter(EstimatedTimeToArrivalFormatter(this))
            .build()
        MapboxTripProgressApi(formatter)
    }

    private val alertRatingService: AlertRatingService by lazy {
        AlertRatingService(tokenProvider = { authSession.accessToken })
    }

    // Store the current set of navigation routes (primary + alternatives)
    private var currentNavigationRoutes: List<NavigationRoute> = emptyList()
    private var selectedRouteIndex: Int = 0

    // ===== Lifecycle Methods =====

    @SuppressLint("Lifecycle")
    @RequiresApi(Build.VERSION_CODES.P)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initializeComponents()
        setupMapAndNavigation()
        setupComposeUI()
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // Switch to overview mode on screen rotation
        navigationCamera?.requestNavigationCameraToOverview()
    }

    // ===== Initialization Methods =====

    @RequiresApi(Build.VERSION_CODES.P)
    private fun initializeComponents() {
        authApiService = AuthApiService()
        googleAuthHelper = GoogleAuthHelper(this, authApiService)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        initializeSearchEngine()
    }

    @RequiresApi(Build.VERSION_CODES.P)
    private fun initializeSearchEngine() {
        searchEngine = SearchEngine.createSearchEngineWithBuiltInDataProviders(
            ApiType.GEOCODING,
            SearchEngineSettings(),
            mainExecutor,
            object : CompletionCallback<Unit> {
                override fun onComplete(result: Unit) {
                    Log.d("MapboxActivity", "Search engine initialized successfully")
                }

                override fun onError(e: Exception) {
                    Log.e("MapboxActivity", "Error initializing search engine", e)
                }
            }
        )
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun setupMapAndNavigation() {
        if (authSession.accessToken == null) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED) {
            initializeMapComponents()
        } else {
            locationPermissionRequest.launch(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION))
        }
    }

    // ===== Map and Navigation Methods =====

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("MissingPermission")
    private fun initializeMapComponents() {
        setupMapView()
        setupViewportDataSource()
        setupNavigationCamera()
        setupRouteLine()
        setupManeuverComponents()
        updateCurrentLocation()
    }

    private fun setupManeuverComponents() {
        val distanceFormatterOptions = DistanceFormatterOptions.Builder(this).build()
        val distanceFormatter = MapboxDistanceFormatter(distanceFormatterOptions)
        maneuverApi = MapboxManeuverApi(distanceFormatter)
        maneuverView = MapboxManeuverView(this).apply {
            visibility = View.GONE
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun setupMapView() {
        mapView = MapView(this).apply {
            setupInitialLocation()
            setupLocationComponent()
            setupMapClickListener()
            setupAlertAnnotationManager()
        }
    }

    @SuppressLint("MissingPermission")
    private fun MapView.setupInitialLocation() {
        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                currentPoint = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                val currentLocation = currentPoint!!
                mapboxMap.setCamera(
                    CameraOptions.Builder()
                        .center(currentLocation)
                        .zoom(15.0)
                        .bearing(0.0)
                        .pitch(0.0)
                        .build()
                )
                isLocationCentered.value = true
            }
        }
    }

    private fun MapView.setupLocationComponent() {
        location.apply {
            setLocationProvider(navigationLocationProvider)
            locationPuck = createDefault2DPuck(withBearing = true)
            pulsingEnabled = true
            enabled = true
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun MapView.setupAlertAnnotationManager() {
        alertAnnotationManager = this.annotations.createPointAnnotationManager()
        updateAlertAnnotations()
    }

    private fun updateAlertAnnotations() {
        alertAnnotationManager?.deleteAll()
        nearbyAlerts.value.forEach { alert ->
            val point = Point.fromLngLat(
                (alert.coordinates["longitude"] as Number).toDouble(),
                (alert.coordinates["latitude"] as Number).toDouble()
            )

            val tintColor = when (alert.type) {
                "info"            -> ContextCompat.getColor(this, R.color.alert_info)        // ex. bleu clair
                "warning"         -> ContextCompat.getColor(this, R.color.alert_warning)     // ex. jaune/orange
                "error"           -> ContextCompat.getColor(this, R.color.alert_error)       // ex. rouge vif
                "accident"        -> ContextCompat.getColor(this, R.color.alert_accident)    // ex. bordeaux
                "traffic_jam"     -> ContextCompat.getColor(this, R.color.alert_traffic)     // ex. orange foncé
                "road_closed"     -> ContextCompat.getColor(this, R.color.alert_closed)      // ex. gris foncé
                "police_control"  -> ContextCompat.getColor(this, R.color.alert_police)      // ex. bleu marine
                "obstacle_on_road"-> ContextCompat.getColor(this, R.color.alert_obstacle)    // ex. violet
                else              -> ContextCompat.getColor(this, R.color.alert_default)     // ex. gris clair
            }

            try {
                // Load and tint the Drawable
                val origDrawable = ContextCompat.getDrawable(this, R.drawable.baseline_location_pin_24)
                    ?: throw IllegalArgumentException("Drawable not found: baseline_location_pin_24")

                val wrapped = DrawableCompat.wrap(origDrawable).mutate()
                DrawableCompat.setTint(wrapped, tintColor)

                // Convert to Bitmap
                val width = wrapped.intrinsicWidth.takeIf { it > 0 } ?: 48
                val height = wrapped.intrinsicHeight.takeIf { it > 0 } ?: 48
                val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bmp)
                wrapped.setBounds(0, 0, width, height)
                wrapped.draw(canvas)

                // Create the annotation
                alertAnnotationManager?.create(
                    PointAnnotationOptions()
                        .withPoint(point)
                        .withIconImage(bmp)
                        .withIconSize(1.2)
                )

                // Clean up
                bmp.recycle()
            } catch (e: Exception) {
                Log.e("ALERTS", "Error creating annotation for alert=$alert", e)
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun MapView.setupMapClickListener() {
        // Set up click listener for point annotations
        alertAnnotationManager?.addClickListener(OnPointAnnotationClickListener { annotation ->
            // Find the corresponding alert for this annotation
            val clickedPoint = annotation.point
            val matchingAlert = nearbyAlerts.value.find { alert ->
                val alertPoint = Point.fromLngLat(
                    (alert.coordinates["longitude"] as Number).toDouble(),
                    (alert.coordinates["latitude"] as Number).toDouble()
                )
                alertPoint.longitude() == clickedPoint.longitude() &&
                alertPoint.latitude() == clickedPoint.latitude()
            }

            matchingAlert?.let { alert ->
                // Show the alert popup
                selectedAlert.value = alert
                // Center the map on the clicked annotation
                mapboxMap.easeTo(
                    CameraOptions.Builder()
                        .center(clickedPoint)
                        .zoom(15.0)
                        .build(),
                    MapAnimationOptions.Builder()
                        .duration(1000)
                        .build()
                )
            }
            true // Return true to indicate the event was handled
        })

        // Only handle map clicks if they're not on an annotation
        mapboxMap.addOnMapClickListener { point ->
            // If there are multiple routes, cycle to the next one as primary
            if (currentNavigationRoutes.size > 1) {
                selectedRouteIndex = (selectedRouteIndex + 1) % currentNavigationRoutes.size
                val reordered = currentNavigationRoutes.toMutableList()
                // Move selected route to front
                val selected = reordered.removeAt(selectedRouteIndex)
                Log.d("ROUTES", "User selected route index $selectedRouteIndex as primary")
                mapboxNavigation.setNavigationRoutes(reordered)
                routeLineApi?.setNavigationRoutes(reordered) { value ->
                    mapView?.mapboxMap?.style?.apply {
                        routeLineView?.renderRouteDrawData(this, value)
                    }
                }
            } else {
                // Fallback: original behavior
                cancelNavigation()
                calculateRouteToDestination(point)
            }
            true
        }
    }

    private fun setupViewportDataSource() {
        viewportDataSource = MapboxNavigationViewportDataSource(mapView!!.mapboxMap).apply {
            val pixelDensity = resources.displayMetrics.density
            followingPadding = EdgeInsets(
                180.0 * pixelDensity,
                40.0 * pixelDensity,
                150.0 * pixelDensity,
                40.0 * pixelDensity
            )
        }
    }

    private fun setupNavigationCamera() {
        navigationCamera = NavigationCamera(
            mapView!!.mapboxMap,
            mapView!!.camera,
            viewportDataSource!!
        )
    }

    private fun setupRouteLine() {
        routeLineApi = MapboxRouteLineApi(MapboxRouteLineApiOptions.Builder().build())
        routeLineView = MapboxRouteLineView(MapboxRouteLineViewOptions.Builder(this).build())
    }

    // ===== Navigation Control Methods =====

    @SuppressLint("MissingPermission")
    private fun calculateRouteToDestination(point: Point? = null) {
        val destination = point ?: selectedDestination.value ?: return
        destinationPoint = destination
        if (coroutineScope == null) return

        if (!hasLocationPermission()) return

        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                val origin = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                requestMultipleRoutes(origin, destination)
            } else {
                handleLocationError()
            }
        }.addOnFailureListener { e ->
            Log.e("MapboxActivity", "Error getting location", e)
            showRouteError()
        }
    }

    // Request up to 3 alternative routes
    private fun requestMultipleRoutes(origin: Point, destination: Point) {
        mapboxNavigation.requestRoutes(
            RouteOptions.builder()
                .applyDefaultNavigationOptions()
                .coordinatesList(listOf(origin, destination))
                .alternatives(true) // Ask for alternatives
                .build(),
            object : NavigationRouterCallback {
                override fun onCanceled(routeOptions: RouteOptions, routerOrigin: String) {
                    Log.e("MapboxActivity", "Route calculation canceled")
                    showRouteError()
                }
                override fun onFailure(reasons: List<RouterFailure>, routeOptions: RouteOptions) {
                    Log.e("MapboxActivity", "Route calculation failed: \\${reasons.joinToString()}")
                    showRouteError()
                }
                override fun onRoutesReady(routes: List<NavigationRoute>, routerOrigin: String) {
                    if (routes.isEmpty()) {
                        showRouteError()
                        return
                    }
                    // Limit to 3 routes (primary + 2 alternatives)
                    val limitedRoutes = routes.take(3)
                    Log.d("ROUTES", "Initial routes received: \\${limitedRoutes.size}")
                    currentNavigationRoutes = limitedRoutes // <-- Store all routes
                    selectedRouteIndex = 0 // Always start with the first as primary

                    // Draw all routes
                    routeLineApi?.setNavigationRoutes(limitedRoutes) { value ->
                        mapView?.mapboxMap?.style?.apply {
                            routeLineView?.renderRouteDrawData(this, value)
                        }
                    }
                    // Start navigation with all routes (primary + alternatives)
                    startNavigation(limitedRoutes)
                }
            }
        )
    }

    private fun hasLocationPermission(): Boolean {
        return ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED || ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestRoute(origin: Point, destination: Point) {
        mapboxNavigation.requestRoutes(
            RouteOptions.builder()
                .applyDefaultNavigationOptions()
                .coordinatesList(listOf(origin, destination))
                .layersList(listOf(mapboxNavigation.getZLevel(), null))
                .build(),
            object : NavigationRouterCallback {
                override fun onCanceled(routeOptions: RouteOptions, routerOrigin: String) {
                    Log.e("MapboxActivity", "Route calculation canceled")
                    showRouteError()
                }
                override fun onFailure(reasons: List<RouterFailure>, routeOptions: RouteOptions) {
                    Log.e("MapboxActivity", "Route calculation failed: ${reasons.joinToString()}")
                    showRouteError()
                }
                override fun onRoutesReady(routes: List<NavigationRoute>, routerOrigin: String) {
                    if (routes.isEmpty()) {
                        showRouteError()
                        return
                    }
                    startNavigation(routes)
                }
            }
        )
    }

    private fun handleLocationError() {
        Log.e("MapboxActivity", "Could not get current location")
        coroutineScope?.launch {
            snackbarHostState.showSnackbar(
                message = "Could not get your current location. Please try again.",
                withDismissAction = true
            )
        }
    }

    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    private fun startNavigation(routes: List<NavigationRoute>) {
        if (routes.isEmpty()) return

        currentRouteProgress.value = null
        mapboxNavigation.setNavigationRoutes(routes)
        isNavigating.value = true

        // Show maneuver view when navigation starts
        maneuverView?.visibility = View.VISIBLE

        registerNavigationObservers()
        startNavigationSession()
        updateCameraForNavigation()
    }

    private fun registerNavigationObservers() {
        mapboxNavigation.registerTripSessionStateObserver(tripSessionStateObserver)
        mapboxNavigation.registerRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.registerRouteProgressObserver(replayProgressObserver!!)
    }

    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    @SuppressLint("MissingPermission")
    private fun startNavigationSession() {
        if (!hasLocationPermission()) return
        navigationCamera?.requestNavigationCameraToFollowing()
        mapboxNavigation.startTripSession()
        mapboxNavigation.mapboxReplayer.play()
    }

    @SuppressLint("MissingPermission")
    private fun updateCameraForNavigation() {
        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                val currentLocation = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                mapView?.mapboxMap?.easeTo(
                    CameraOptions.Builder()
                        .center(currentLocation)
                        .zoom(5.0)
                        .bearing(0.0)
                        .pitch(0.0)
                        .build(),
                    MapAnimationOptions.Builder()
                        .duration(1000)
                        .build()
                )
                isLocationCentered.value = true
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun cancelNavigation() {
        unregisterNavigationObservers()
        stopNavigationSession()
        clearNavigationState()
        clearRouteLine()

        // Hide maneuver view when navigation is cancelled
        maneuverView?.visibility = View.GONE
    }

    private fun unregisterNavigationObservers() {
        mapboxNavigation.unregisterTripSessionStateObserver(tripSessionStateObserver)
        mapboxNavigation.unregisterRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.unregisterRouteProgressObserver(replayProgressObserver!!)
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    private fun stopNavigationSession() {
        mapboxNavigation.stopTripSession()
        centerOnCurrentLocation()
        navigationCamera?.requestNavigationCameraToOverview()
        mapboxNavigation.mapboxReplayer.stop()
    }

    private fun clearNavigationState() {
        mapboxNavigation.setNavigationRoutes(emptyList())
        isNavigating.value = false
        currentRouteProgress.value = null
    }

    private fun clearRouteLine() {
        routeLineApi?.clearRouteLine { result ->
            result.fold(
                { error -> Log.e("MapboxActivity", "Error clearing route line: $error") },
                {
                    routeLineApi?.setNavigationRoutes(emptyList()) { routeSetValue ->
                        mapView?.mapboxMap?.style?.apply {
                            routeLineView?.renderRouteDrawData(this, routeSetValue)
                        }
                    }
                }
            )
        }
    }

    // ===== Location Methods =====

    @RequiresApi(Build.VERSION_CODES.O)
    private fun centerOnCurrentLocation() {
        if (!hasLocationPermission()) {
            requestLocationPermission()
            return
        }

        if (!isNavigating.value) {
            mapboxNavigation.stopTripSession()
        }

        updateCurrentLocation()
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun requestLocationPermission() {
        locationPermissionRequest.launch(arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        ))
    }

    @SuppressLint("MissingPermission")
    private fun updateCurrentLocation() {

        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                currentPoint = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                mapView?.mapboxMap?.easeTo(
                    CameraOptions.Builder()
                        .center(currentPoint)
                        .zoom(15.0)
                        .bearing(0.0)
                        .pitch(0.0)
                        .build(),
                    MapAnimationOptions.Builder()
                        .duration(1000)
                        .build()
                )
                isLocationCentered.value = true
                fetchNearbyAlerts(lastLocation.latitude, lastLocation.longitude)
            }
        }
    }

    private fun displayCurrentLocationPuck() {
        mapView?.location?.apply {
            locationPuck = createDefault2DPuck(withBearing = true)
            enabled = true
            pulsingEnabled = true
        }
    }

    private fun fetchNearbyAlerts(latitude: Double, longitude: Double) {
        coroutineScope?.launch {
            try {
                val alertService = AlertService(
                    tokenProvider = { authSession.accessToken }
                )
                val response = withContext(Dispatchers.IO) {
                    alertService.getAlertsNearMe(latitude, longitude).execute()
                }

                if (response.isSuccessful) {
                    Log.d("NEARBY ALERTS", "Nearby alerts: ${response.body()}")
                    nearbyAlerts.value = response.body() ?: emptyList()
                } else {
                    throw Exception("Failed to fetch alerts: \\${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("MapboxActivity", "Error fetching alerts", e)
                snackbarHostState.showSnackbar(
                    message = "Failed to fetch alerts. Please try again.",
                    withDismissAction = true
                )
            }
        }
    }

    // ===== UI Methods =====

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("MissingPermission")
    private fun setupComposeUI() {
        setContent {
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
            val scope = rememberCoroutineScope()
            val context = LocalContext.current
            val isNavigatingState = isNavigating.collectAsState()
            val routeProgressState = currentRouteProgress.collectAsState()
            val lifecycleOwner = LocalLifecycleOwner.current
            val isAlertModalVisibleState = isAlertModalVisible.collectAsState()

            setupCoroutineScope(scope)
            setupLifecycleObserver(lifecycleOwner)
            setupBackHandler(drawerState, scope)

            SupmapTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    SidebarWithFab(
                        onSignOut = { handleSignOut(scope, context) },
                        onSearchClick = { showDestinationInput() },
                        onCenterLocation = { centerOnCurrentLocation() },
                        onAlert = { isAlertModalVisible.value = true },
                        isLocationCentered = isLocationCentered.collectAsState().value,
                        user = authSession.currentUser,
                        drawerState = drawerState
                    ) {
                        MapContent(
                            isNavigatingState = isNavigatingState,
                            routeProgressState = routeProgressState
                        )

                        currentPoint?.let { point ->
                            CreateAlertModal(
                                isVisible = isAlertModalVisibleState.value,
                                currentLocation = point,
                                onDismiss = { isAlertModalVisible.value = false },
                                onSubmit = { alertData ->
                                    handleAlertCreation(alertData)
                                    isAlertModalVisible.value = false
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    @Composable
    private fun setupCoroutineScope(scope: CoroutineScope) {
        DisposableEffect(Unit) {
            coroutineScope = scope
            onDispose {
                coroutineScope = null
            }
        }
    }

    @Composable
    private fun setupLifecycleObserver(lifecycleOwner: LifecycleOwner) {
        DisposableEffect(lifecycleOwner) {
            val observer = LifecycleEventObserver { _, event ->
                when (event) {
                    Lifecycle.Event.ON_START -> mapView?.onStart()
                    Lifecycle.Event.ON_STOP -> mapView?.onStop()
                    Lifecycle.Event.ON_DESTROY -> mapView?.onDestroy()
                    else -> {}
                }
            }
            lifecycleOwner.lifecycle.addObserver(observer)
            onDispose {
                lifecycleOwner.lifecycle.removeObserver(observer)
            }
        }
    }

    @Composable
    private fun setupBackHandler(drawerState: DrawerState, scope: CoroutineScope) {
        BackHandler {
            if (drawerState.isOpen) {
                scope.launch {
                    drawerState.close()
                }
            }
        }
    }

    private fun handleSignOut(scope: CoroutineScope, context: Context) {
        scope.launch {
            try {
                googleAuthHelper.signOut()
                Log.d("MapboxActivity", "Successfully signed out from Google")
            } catch (e: Exception) {
                Log.e("MapboxActivity", "Error signing out from Google", e)
            }

            authSession.clear()
            startActivity(Intent(context, MainActivity::class.java))
            finish()
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    @SuppressLint("StateFlowValueCalledInComposition")
    @Composable
    private fun MapContent(
        isNavigatingState: State<Boolean>,
        routeProgressState: State<RouteProgress?>
    ) {
        val alert = selectedAlert.collectAsState().value
        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectTapGestures {}
                }
        ) {
            mapView?.let { view ->
                AndroidView(
                    factory = { view },
                    modifier = Modifier.fillMaxSize().testTag("Map View")
                )
            }

            // Top-aligned column for navigation UI
            if (isNavigatingState.value) {
                Column(
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .fillMaxWidth()
                        .padding(top = 16.dp, start = 16.dp, end = 16.dp)
                ) {
                    NavigationSnackbar(
                        distanceInMeters = routeProgressState.value?.distanceRemaining ?: 0,
                        onCancelNavigation = { cancelNavigation() },
                        onAlert = { isAlertModalVisible.value = true },
                        modifier = Modifier.fillMaxWidth(),
                        origin = currentPoint!!,
                        destination = destinationPoint!!,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    maneuverView?.let { view ->
                        AndroidView(
                            factory = { view },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(96.dp)
                        )
                    }
                }
            }

            DestinationBottomSheet()
            if (!isNavigatingState.value) {
                SnackbarHost(
                    hostState = snackbarHostState,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // Update alerts when nearbyAlerts changes
            val alertsList by nearbyAlerts.collectAsState()
            LaunchedEffect(alertsList) {
                displayCurrentLocationPuck()
                updateAlertAnnotations()
            }

            alert?.let {
                AlertPopup(
                    alert = it,
                    onDismiss = { selectedAlert.value = null },
                    onRatingSubmit = { ratingDto ->
                        coroutineScope?.launch {
                            try {
                                withContext(Dispatchers.IO) {
                                    val response = alertRatingService.rateAlert(it.id!!, ratingDto).execute()
                                    if (!response.isSuccessful) {
                                        withContext(Dispatchers.Main) {
                                            snackbarHostState.showSnackbar(
                                                message = "Failed to submit rating",
                                                withDismissAction = true
                                            )
                                        }
                                    }
                                }
                            } catch (e: Exception) {
                                withContext(Dispatchers.Main) {
                                    snackbarHostState.showSnackbar(
                                        message = "Error submitting rating: ${e.message}",
                                        withDismissAction = true
                                    )
                                }
                            }
                        }
                    },
                    alertRatingService = alertRatingService
                )
            }
        }
    }

    @Composable
    private fun DestinationBottomSheet() {
        SearchBottomSheet(
            isVisible = isBottomSheetVisible.collectAsState().value,
            onDismiss = { isBottomSheetVisible.value = false },
            onDestinationSelected = { point ->
                selectedDestination.value = point
                calculateRouteToDestination()
            },
            snackbarHostState = snackbarHostState
        )
    }

    private fun showDestinationInput() {
        isBottomSheetVisible.value = true
    }

    private fun showRouteError() {
        coroutineScope?.launch {
            snackbarHostState.showSnackbar(
                message = "Could not find a route to this destination. Please try another one.",
                withDismissAction = true
            )
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun handleAlertCreation(alertData: AlertData) {
        coroutineScope?.launch {
            try {
                val alertService = AlertService(
                    tokenProvider = { authSession.accessToken }
                )
                val response = withContext(Dispatchers.IO) {
                    alertService.createAlert(alertData.toAlert()).execute()
                }

                if (response.isSuccessful) {
                    snackbarHostState.showSnackbar(
                        message = "Alert created successfully",
                        withDismissAction = true
                    )
                } else {
                    throw Exception("Failed to create alert: \\${response.code()}")
                }
            } catch (e: Exception) {
                Log.e("MapboxActivity", "Error creating alert", e)
                snackbarHostState.showSnackbar(
                    message = "Failed to create alert. Please try again.",
                    withDismissAction = true
                )
            }
        }
    }

    // ===== Navigation Observers =====

    @RequiresApi(Build.VERSION_CODES.O)
    private val locationPermissionRequest =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            when {
                permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true -> {
                    initializeMapComponents()
                    centerOnCurrentLocation()
                }
                else -> {
                    Log.e("MapboxActivity", "Location permissions denied")
                }
            }
        }

    private val routesObserver = RoutesObserver { routeUpdateResult ->
        val routes = routeUpdateResult.navigationRoutes
        if (routes.isNotEmpty()) {
            currentNavigationRoutes = routes // <-- Always update
            selectedRouteIndex = 0 // Optionally reset to primary
            routeLineApi?.setNavigationRoutes(routes) { value ->
                mapView?.mapboxMap?.style?.apply {
                    routeLineView?.renderRouteDrawData(this, value)
                }
            }
        }
    }

    private val locationObserver = object : LocationObserver {
        override fun onNewRawLocation(rawLocation: Location) {}
        override fun onNewLocationMatcherResult(locationMatcherResult: LocationMatcherResult) {
            val enhancedLocation = locationMatcherResult.enhancedLocation
            currentPoint = Point.fromLngLat(enhancedLocation.longitude, enhancedLocation.latitude)
            navigationLocationProvider.changePosition(
                location = enhancedLocation,
                keyPoints = locationMatcherResult.keyPoints,
            )
            viewportDataSource?.onLocationChanged(enhancedLocation)
            viewportDataSource?.evaluate()
            navigationCamera?.requestNavigationCameraToFollowing()
        }
    }

    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    private val mapboxNavigation: MapboxNavigation by requireMapboxNavigation(
        onResumedObserver = object : MapboxNavigationObserver {
            override fun onAttached(mapboxNavigation: MapboxNavigation) {
                mapboxNavigation.registerRoutesObserver(routesObserver)
                mapboxNavigation.registerLocationObserver(locationObserver)
                replayProgressObserver = ReplayProgressObserver(mapboxNavigation.mapboxReplayer)
                mapboxNavigation.registerRouteProgressObserver(replayProgressObserver!!)
                mapboxNavigation.startReplayTripSession()
            }

            override fun onDetached(mapboxNavigation: MapboxNavigation) {
                mapboxNavigation.unregisterRoutesObserver(routesObserver)
                mapboxNavigation.unregisterLocationObserver(locationObserver)
                replayProgressObserver?.let { observer ->
                    mapboxNavigation.unregisterRouteProgressObserver(observer)
                }
                mapboxNavigation.mapboxReplayer.stop()
            }
        },
        onInitialize = this::initNavigation
    )

    @SuppressLint("MissingPermission")
    private val routeProgressObserver =
        RouteProgressObserver { routeProgress ->
            maneuverApi?.getManeuvers(routeProgress)?.let { maneuvers ->
                Log.d("MANEUVER", "Maneuvers: $maneuvers")
                maneuverView?.renderManeuvers(maneuvers)
                maneuverView?.visibility = View.VISIBLE
            }

            Log.d("ROUTE_PROGRESS", "Distance remaining: ${routeProgress.distanceRemaining}")
            currentRouteProgress.value = routeProgress

            fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                val origin = Point.fromLngLat(loc.longitude, loc.latitude)
                destinationPoint?.let { dest ->
                    navigationViewModel.updateDistance(
                        origin,
                        dest,
                        routeProgress.distanceRemaining
                    )
                }
            }

            tripProgressApi.getTripProgress(routeProgress).let { update ->
                Log.d("TRIP_PROGRESS", "Formatted distance: ${update.distanceRemaining}")
            }
        }

    private val tripSessionStateObserver =
        TripSessionStateObserver { state ->
            Log.d("TRIP_SESSION", "Session state changed: $state")
            when (state) {
                TripSessionState.STARTED -> {
                    Log.d("TRIP_SESSION", "Trip session started")
                }
                TripSessionState.STOPPED -> {
                    Log.d("TRIP_SESSION", "Trip session stopped")
                    currentRouteProgress.value = null
                }
            }
        }

    private fun initNavigation() {
        MapboxNavigationApp.setup(NavigationOptions.Builder(this).build())

        mapView?.location?.apply {
            setLocationProvider(navigationLocationProvider)
            locationPuck = createDefault2DPuck()
            enabled = true
        }

        replayProgressObserver = ReplayProgressObserver(
            mapboxReplayer = replayer,
            replayRouteMapper = replayRouteMapper
        )
    }
}