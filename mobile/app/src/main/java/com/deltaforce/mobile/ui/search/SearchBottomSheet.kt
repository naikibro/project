package com.deltaforce.mobile.ui.search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mapbox.geojson.Point
import com.mapbox.search.autocomplete.PlaceAutocomplete
import com.mapbox.search.autocomplete.PlaceAutocompleteSuggestion
import kotlinx.coroutines.launch
import androidx.compose.material3.SnackbarHostState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchBottomSheet(
    isVisible: Boolean,
    onDestinationSelected: (Point) -> Unit,
    onDismiss: () -> Unit,
    snackbarHostState: SnackbarHostState
) {
    var searchQuery by remember { mutableStateOf("") }
    var suggestions by remember { mutableStateOf<List<PlaceAutocompleteSuggestion>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState()

    val placeAutocomplete = remember { PlaceAutocomplete.create() }

    if (isVisible) {
        ModalBottomSheet(
            onDismissRequest = onDismiss,
            sheetState = sheetState,
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { query ->
                        searchQuery = query
                        if (query.isNotEmpty()) {
                            isLoading = true
                            error = null
                            scope.launch {
                                try {
                                    val response = withContext(Dispatchers.Main) {
                                        placeAutocomplete.suggestions(query)
                                    }
                                    response.onValue { newSuggestions ->
                                        suggestions = newSuggestions
                                        isLoading = false
                                    }.onError { e ->
                                        // Only show error if it's not a session advancement error
                                        if (e.message?.contains("search session advanced") != true) {
                                            error = e.message
                                        }
                                        isLoading = false
                                        suggestions = emptyList()
                                    }
                                } catch (e: Exception) {
                                    error = e.message
                                    isLoading = false
                                    suggestions = emptyList()
                                }
                            }
                        } else {
                            suggestions = emptyList()
                            isLoading = false
                            error = null
                        }
                    },
                    label = { Text("Search destination") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                ) {
                    when {
                        isLoading -> {
                            CircularProgressIndicator(
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                        error != null -> {
                            Text(
                                text = "Unable to search for places. Please try again.",
                                color = MaterialTheme.colorScheme.error,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                        searchQuery.isNotEmpty() && suggestions.isEmpty() -> {
                            Text(
                                text = "No places found",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                        suggestions.isNotEmpty() -> {
                            LazyColumn(
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                items(suggestions) { suggestion ->
                                    ListItem(
                                        headlineContent = { Text(suggestion.name) },
                                        supportingContent = suggestion.formattedAddress?.let { address ->
                                            { Text(text = address) }
                                        },
                                        modifier = Modifier.clickable {
                                            scope.launch {
                                                try {
                                                    val response = withContext(Dispatchers.Main) {
                                                        placeAutocomplete.select(suggestion)
                                                    }
                                                    response.onValue { result ->
                                                        val point = Point.fromLngLat(
                                                            result.coordinate.longitude(),
                                                            result.coordinate.latitude()
                                                        )
                                                        onDestinationSelected(point)
                                                        onDismiss()
                                                    }.onError { e ->
                                                        scope.launch {
                                                            snackbarHostState.showSnackbar(
                                                                message = "Unable to select this place. Please try another one.",
                                                                withDismissAction = true
                                                            )
                                                        }
                                                    }
                                                } catch (e: Exception) {
                                                    scope.launch {
                                                        snackbarHostState.showSnackbar(
                                                            message = "Error selecting place: ${e.message}",
                                                            withDismissAction = true
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
} 