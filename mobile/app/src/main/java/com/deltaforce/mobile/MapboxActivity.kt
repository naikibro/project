package com.deltaforce.mobile

import AuthSession
import AuthSessionInterface
import android.Manifest
import android.annotation.SuppressLint
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
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
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.deltaforce.mobile.ui.navigation.NavigationViewModel
import androidx.activity.viewModels

class MapboxActivity(private val authSession: AuthSessionInterface = AuthSession) : ComponentActivity() {
    private lateinit var authApiService: AuthApiService
    private lateinit var googleAuthHelper: GoogleAuthHelper
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
    private val isBottomSheetVisible = MutableStateFlow(false)
    private val selectedDestination = MutableStateFlow<Point?>(null)
    private val isLocationCentered = MutableStateFlow(false)
    private val snackbarHostState = SnackbarHostState()
    private val isNavigating = MutableStateFlow(false)
    private val currentRouteProgress = MutableStateFlow<RouteProgress?>(null)
    private val replayer = MapboxReplayer()
    private val navigationViewModel: NavigationViewModel by viewModels()

    private val tripProgressApi: MapboxTripProgressApi by lazy {
        val distanceFormatterOptions = DistanceFormatterOptions.Builder(this).build()
        val formatter = TripProgressUpdateFormatter.Builder(this)
            .distanceRemainingFormatter(DistanceRemainingFormatter(distanceFormatterOptions))
            .timeRemainingFormatter(TimeRemainingFormatter(this))
            .estimatedTimeToArrivalFormatter(EstimatedTimeToArrivalFormatter(this))
            .build()
        MapboxTripProgressApi(formatter)
    }

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


    @SuppressLint("Lifecycle")
    @RequiresApi(Build.VERSION_CODES.P)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        authApiService = AuthApiService()
        googleAuthHelper = GoogleAuthHelper(this, authApiService)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        // Initialize SearchEngine
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

        setContent {
            val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
            val scope = rememberCoroutineScope()
            val context = LocalContext.current
            val isNavigatingState = isNavigating.collectAsState()
            val routeProgressState = currentRouteProgress.collectAsState()
            val lifecycleOwner = LocalLifecycleOwner.current
            DisposableEffect(Unit) {
                coroutineScope = scope
                onDispose {
                    coroutineScope = null
                }
            }

            DisposableEffect(lifecycleOwner) {
                val observer = LifecycleEventObserver { _, event ->
                    when (event) {
                        Lifecycle.Event.ON_START -> {
                            mapView?.onStart()
                        }
                        Lifecycle.Event.ON_STOP -> {
                            mapView?.onStop()
                        }
                        Lifecycle.Event.ON_DESTROY -> {
                            mapView?.onDestroy()
                        }
                        else -> {}
                    }
                }
                lifecycleOwner.lifecycle.addObserver(observer)
                onDispose {
                    lifecycleOwner.lifecycle.removeObserver(observer)
                }
            }

            BackHandler {
                if (drawerState.isOpen) {
                    scope.launch {
                        drawerState.close()
                    }
                }
            }
            SupmapTheme {
                Box(modifier = Modifier.fillMaxSize()) {
                    SidebarWithFab(
                        onSignOut = {
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
                        },
                        onSearchClick = { showDestinationInput() },
                        onCenterLocation = { centerOnCurrentLocation() },
                        onDebug = {
                            Log.d("POSITION", fusedLocationClient.lastLocation.toString())
                        },
                        isLocationCentered = isLocationCentered.collectAsState().value,
                        drawerState = drawerState
                    ) {
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
                            DestinationBottomSheet()

                            if (isNavigatingState.value) {
                                NavigationSnackbar(
                                    distanceInMeters = routeProgressState.value?.distanceRemaining
                                        ?: 0,
                                    onCancelNavigation = { cancelNavigation() },
                                    onDebug = {
                                        Log.d(
                                            "ROUTE PROGRESS STATE",
                                            routeProgressState.toString()
                                        )

                                        Log.d(
                                            "ROUTE PROGRESS STATE 2",
                                            routeProgressState.value.toString()
                                        )

                                        Log.d(
                                            "REPLAYER ",
                                            replayer.toString()
                                        )
                                    },
                                    modifier = Modifier
                                        .align(Alignment.TopStart)
                                        .padding(16.dp),
                                    origin = currentPoint!!,
                                    destination = destinationPoint!!,
                                )
                            } else {
                                SnackbarHost(
                                    hostState = snackbarHostState,
                                    modifier = Modifier.align(Alignment.Center)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    @SuppressLint("MissingPermission")
    private fun initializeMapComponents() {
        mapView = MapView(this).apply {
            // Get the last known location and center the map on it
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
                } else {
                    // Fallback to a default location if last location is not available
                    currentPoint = Point.fromLngLat(0.0, 0.0)
                    mapboxMap.setCamera(
                        CameraOptions.Builder()
                            .center(currentPoint!!)
                            .zoom(2.0)
                            .build()
                    )
                }
            }

            mapView?.location?.apply {
                setLocationProvider(navigationLocationProvider)
                locationPuck = createDefault2DPuck(withBearing = true)
                pulsingEnabled = true
                enabled = true
            }

            // Add click listener for route calculation
            mapboxMap.addOnMapClickListener { point ->
                cancelNavigation()
                calculateRouteToDestination(point)
                true
            }
        }

        viewportDataSource = MapboxNavigationViewportDataSource(mapView!!.mapboxMap).apply {
            val pixelDensity = resources.displayMetrics.density
            followingPadding = EdgeInsets(
                180.0 * pixelDensity,
                40.0 * pixelDensity,
                150.0 * pixelDensity,
                40.0 * pixelDensity
            )
        }

        navigationCamera = NavigationCamera(
            mapView!!.mapboxMap,
            mapView!!.camera,
            viewportDataSource!!
        )

        routeLineApi = MapboxRouteLineApi(MapboxRouteLineApiOptions.Builder().build())
        routeLineView = MapboxRouteLineView(MapboxRouteLineViewOptions.Builder(this).build())
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

    private fun calculateRouteToDestination(point: Point? = null) {
        val destination = point ?: selectedDestination.value ?: return
        destinationPoint = destination  // Set the destination point
        if (coroutineScope == null) return

        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                val origin = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
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
            } else {
                Log.e("MapboxActivity", "Could not get current location")
                coroutineScope?.launch {
                    snackbarHostState.showSnackbar(
                        message = "Could not get your current location. Please try again.",
                        withDismissAction = true
                    )
                }
            }
        }.addOnFailureListener { e ->
            Log.e("MapboxActivity", "Error getting location", e)
            showRouteError()
        }
    }

    private val routesObserver = RoutesObserver { routeUpdateResult ->
        if (routeUpdateResult.navigationRoutes.isNotEmpty()) {
            routeLineApi?.setNavigationRoutes(routeUpdateResult.navigationRoutes) { value ->
                mapView?.mapboxMap?.style?.apply {
                    routeLineView?.renderRouteDrawData(this, value)
                }
            }
            viewportDataSource?.onRouteChanged(routeUpdateResult.navigationRoutes.first())
            viewportDataSource?.evaluate()
            navigationCamera?.requestNavigationCameraToOverview()
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

            // Get the formatted trip progress update
            tripProgressApi.getTripProgress(routeProgress).let { update ->
                Log.d("TRIP_PROGRESS", "Formatted distance: ${update.distanceRemaining}")
            }


        }

    private val tripSessionStateObserver =
        TripSessionStateObserver { state ->
            Log.d("TRIP_SESSION", "Session state changed: $state")
            when (state) {
                TripSessionState.STARTED -> {
                    // Trip session started, we can now receive route progress updates
                    Log.d("TRIP_SESSION", "Trip session started")
                }

                TripSessionState.STOPPED -> {
                    // Trip session stopped, clear the progress
                    Log.d("TRIP_SESSION", "Trip session stopped")
                    currentRouteProgress.value = null
                }
            }
        }

    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    private fun startNavigation(routes: List<NavigationRoute>) {
        if (routes.isEmpty()) return

        // Clear any existing route progress
        currentRouteProgress.value = null

        // Set up the route
        mapboxNavigation.setNavigationRoutes(routes)
        isNavigating.value = true

        // Register observers in the correct order
        mapboxNavigation.registerTripSessionStateObserver(tripSessionStateObserver)
        mapboxNavigation.registerRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.registerRouteProgressObserver(replayProgressObserver!!)

        // Start the trip session
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        navigationCamera?.requestNavigationCameraToFollowing()
        mapboxNavigation.startTripSession()

        // Start the replay session
        mapboxNavigation.mapboxReplayer.play()

        // Switch to following mode for navigation
        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                val currentLocation = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                // Animate camera to the new position
                mapView?.mapboxMap?.easeTo(
                    CameraOptions.Builder()
                        .center(currentLocation)
                        .zoom(17.0)
                        .bearing(0.0)
                        .pitch(0.0)
                        .build(),
                    MapAnimationOptions.Builder()
                        .duration(1000) // 1 second animation
                        .build()
                )
                isLocationCentered.value = true
            }
        }
    }

    @OptIn(ExperimentalPreviewMapboxNavigationAPI::class)
    private fun cancelNavigation() {
        // Unregister observers first
        mapboxNavigation.unregisterTripSessionStateObserver(tripSessionStateObserver)
        mapboxNavigation.unregisterRouteProgressObserver(routeProgressObserver)
        mapboxNavigation.unregisterRouteProgressObserver(replayProgressObserver!!)

        // Stop the trip session
        mapboxNavigation.stopTripSession()
        navigationCamera?.requestNavigationCameraToOverview()
        centerOnCurrentLocation()
        // Stop the replay session
        mapboxNavigation.mapboxReplayer.stop()

        // Clear routes and state
        mapboxNavigation.setNavigationRoutes(emptyList())
        isNavigating.value = false
        currentRouteProgress.value = null

        // Clear the route line
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

    private fun centerOnCurrentLocation() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            locationPermissionRequest.launch(arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ))
            return
        }

        if (!isNavigating.value) {
            mapboxNavigation.stopTripSession()
            navigationCamera?.requestNavigationCameraToOverview()
        }

        fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation ->
            if (lastLocation != null) {
                currentPoint = Point.fromLngLat(lastLocation.longitude, lastLocation.latitude)
                // Animate camera to the new position
                mapView?.mapboxMap?.easeTo(
                    CameraOptions.Builder()
                        .center(currentPoint!!)
                        .zoom(15.0)
                        .bearing(0.0)
                        .pitch(0.0)
                        .build(),
                    MapAnimationOptions.Builder()
                        .duration(1000) // 1 second animation
                        .build()
                )
                isLocationCentered.value = true
            }
        }

        mapView?.location?.apply {
            locationPuck = createDefault2DPuck(withBearing = true)
            enabled = true
            pulsingEnabled = true
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // Switch to overview mode on screen rotation
        navigationCamera?.requestNavigationCameraToOverview()
    }
}