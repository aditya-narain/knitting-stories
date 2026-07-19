package com.knittingstories.review;

import com.knittingstories.catalog.Product;
import com.knittingstories.catalog.ProductRepository;
import com.knittingstories.common.ApiException;
import com.knittingstories.review.dto.CreateReviewRequest;
import com.knittingstories.review.dto.ReviewResponse;
import com.knittingstories.user.User;
import com.knittingstories.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> list(UUID productId, Pageable pageable) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(ReviewResponse::from);
    }

    @Transactional
    public ReviewResponse create(UUID userId, UUID productId, CreateReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (reviewRepository.existsByProductIdAndUserId(productId, userId)) {
            throw ApiException.conflict("You have already reviewed this product");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.rating());
        review.setComment(request.comment());
        reviewRepository.save(review);

        recomputeRating(product);
        return ReviewResponse.from(review);
    }

    private void recomputeRating(Product product) {
        List<Review> reviews = reviewRepository.findByProduct(product);
        int count = reviews.size();
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        product.setRatingCount(count);
        product.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        productRepository.save(product);
    }
}
