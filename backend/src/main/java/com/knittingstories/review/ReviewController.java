package com.knittingstories.review;

import com.knittingstories.review.dto.CreateReviewRequest;
import com.knittingstories.review.dto.ReviewResponse;
import com.knittingstories.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public Page<ReviewResponse> list(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.list(productId, PageRequest.of(page, Math.min(size, 50)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReviewResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID productId,
            @Valid @RequestBody CreateReviewRequest request) {
        return reviewService.create(principal.getId(), productId, request);
    }
}
