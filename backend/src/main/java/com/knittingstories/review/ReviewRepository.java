package com.knittingstories.review;

import com.knittingstories.catalog.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Page<Review> findByProductIdOrderByCreatedAtDesc(UUID productId, Pageable pageable);

    List<Review> findByProduct(Product product);

    boolean existsByProductIdAndUserId(UUID productId, UUID userId);
}
