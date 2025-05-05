package com.deltaforce.mobile.ui.alerts

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.unit.dp
import com.deltaforce.mobile.R
import com.deltaforce.mobile.network.Alert
import com.deltaforce.mobile.network.AlertRatingService
import com.deltaforce.mobile.network.UpsertAlertRatingDto
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext


@Composable
fun AlertRatingBox(
    alert: Alert,
    onRatingSubmit: (UpsertAlertRatingDto) -> Unit,
    alertRatingService: AlertRatingService,
    modifier: Modifier = Modifier
) {
    var upvotes by remember { mutableStateOf(0) }
    var downvotes by remember { mutableStateOf(0) }

    var hasVoted by remember { mutableStateOf(false) }
    var isUpvote by remember { mutableStateOf<Boolean?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()
    val userId = AuthSession.currentUser?.id ?: return

    // Fetch initial rating data
    LaunchedEffect(alert.id) {
        if (alert.id != null) {
            try {
                val response = withContext(Dispatchers.IO) {
                    alertRatingService.getAlertRatings(alert.id).execute()
                }
                if (response.isSuccessful) {
                    val rating = response.body()
                    if (rating != null) {
                        upvotes = rating.upvotes
                        downvotes = rating.downvotes
                        // Set hasVoted and isUpvote if backend returns user-specific info
                        isUpvote = rating.userRating // true, false, or null
                        hasVoted = isUpvote != null
                    } else {
                        upvotes = 0
                        downvotes = 0
                        isUpvote = null
                        hasVoted = false
                    }
                    Log.d("RATINGS", rating.toString())
                } else {
                    error = "Failed to load ratings"
                }
            } catch (e: Exception) {
                error = "Error loading ratings: ${e.message}"
            } finally {
                isLoading = false
            }
        } else {
            isLoading = false
        }
    }

    val ratio = if (upvotes + downvotes > 0) {
        (upvotes.toFloat() / (upvotes + downvotes).toFloat() * 100).toInt()
    } else {
        0
    }

    Log.d("RATINGS", "upvotes: $upvotes, downvotes: $downvotes")
    
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = MaterialTheme.colorScheme.primary
            )
        } else if (error != null) {
            Text(
                text = error!!,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.error
            )
        } else {
            // Rating ratio display
            Text(
                text = "$ratio% positive",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            // Red/green bar graph for upvotes/downvotes
            val totalVotes = upvotes + downvotes
            if (totalVotes > 0) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(12.dp)
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val upvoteWeight = upvotes.toFloat() / totalVotes
                    val downvoteWeight = downvotes.toFloat() / totalVotes
                    if (upvotes > 0) {
                        Box(
                            modifier = Modifier
                                .weight(upvoteWeight)
                                .fillMaxHeight()
                                .background(MaterialTheme.colorScheme.primary, shape = MaterialTheme.shapes.small)
                        )
                    }
                    if (downvotes > 0) {
                        Box(
                            modifier = Modifier
                                .weight(downvoteWeight)
                                .fillMaxHeight()
                                .background(MaterialTheme.colorScheme.error, shape = MaterialTheme.shapes.small)
                        )
                    }
                }
            } else {
                // Show a neutral/empty bar if there are no votes
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(12.dp)
                        .padding(vertical = 4.dp)
                        .background(MaterialTheme.colorScheme.surfaceVariant, shape = MaterialTheme.shapes.small)
                )
            }

            // If user has already voted, disable the corresponding button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // Upvote button
                Button(
                    onClick = {
                        if (isUpvote != true) { // Only allow if not already upvoted
                            scope.launch {
                                alert.id?.let { id ->
                                    try {
                                        withContext(Dispatchers.IO) {
                                            onRatingSubmit(UpsertAlertRatingDto(id.toString(), true, userId))
                                        }
                                        val response = withContext(Dispatchers.IO) {
                                            alertRatingService.getAlertRatings(id).execute()
                                        }
                                        if (response.isSuccessful) {
                                            val rating = response.body()
                                            if (rating != null) {
                                                upvotes = rating.upvotes
                                                downvotes = rating.downvotes
                                                isUpvote = rating.userRating
                                                hasVoted = isUpvote != null
                                            }
                                        }
                                        Log.d("RATINGS", "User voted up")
                                    } catch (e: Exception) {
                                        error = "Failed to submit rating: ${e.message}"
                                    }
                                }
                            }
                        }
                    },
                    enabled = isUpvote != true, // Disable if already upvoted
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isUpvote == true)
                            MaterialTheme.colorScheme.primary
                        else
                            MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = "Upvote",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    if (isUpvote == true) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Voted up",
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text(upvotes.toString())
                    }
                }

                // Downvote button
                Button(
                    onClick = {
                        if (isUpvote != false) { // Only allow if not already downvoted
                            scope.launch {
                                alert.id?.let { id ->
                                    try {
                                        withContext(Dispatchers.IO) {
                                            onRatingSubmit(UpsertAlertRatingDto(id.toString(), false, userId))
                                        }
                                        val response = withContext(Dispatchers.IO) {
                                            alertRatingService.getAlertRatings(id).execute()
                                        }
                                        if (response.isSuccessful) {
                                            val rating = response.body()
                                            if (rating != null) {
                                                upvotes = rating.upvotes
                                                downvotes = rating.downvotes
                                                isUpvote = rating.userRating
                                                hasVoted = isUpvote != null
                                            }
                                        }
                                        Log.d("RATINGS", "User voted down")
                                    } catch (e: Exception) {
                                        error = "Failed to submit rating: ${e.message}"
                                    }
                                }
                            }
                        }
                    },
                    enabled = isUpvote != false, // Disable if already downvoted
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isUpvote == false)
                            MaterialTheme.colorScheme.error
                        else
                            MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Icon(
                        imageVector = ImageVector.vectorResource(id = R.drawable.baseline_thumb_down_24),
                        contentDescription = "Downvote",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    if (isUpvote == false) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Voted down",
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text(downvotes.toString())
                    }
                }
            }
        }
    }
}