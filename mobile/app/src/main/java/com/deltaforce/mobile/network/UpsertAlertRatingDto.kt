package com.deltaforce.mobile.network

data class UpsertAlertRatingDto(
    val alertId: String,
    val isUpvote: Boolean, // true for upvote, false for downvote
    val userId: String
) 