package com.knittingstories.review.dto;

import com.knittingstories.review.Review;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        int rating,
        String comment,
        String authorName,
        Instant createdAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(review.getId(), review.getRating(), review.getComment(),
                review.getUser() != null ? review.getUser().getFullName() : "Anonymous",
                review.getCreatedAt());
    }
}
