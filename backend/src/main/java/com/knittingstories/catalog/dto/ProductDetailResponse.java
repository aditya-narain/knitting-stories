package com.knittingstories.catalog.dto;

import com.knittingstories.catalog.Product;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDetailResponse(
        UUID id,
        String title,
        String description,
        BigDecimal basePrice,
        String status,
        boolean featured,
        BigDecimal ratingAvg,
        int ratingCount,
        UUID categoryId,
        String categoryName,
        UUID sellerId,
        String sellerShopName,
        List<String> imageUrls,
        List<VariantResponse> variants
) {
    public static ProductDetailResponse from(Product p) {
        return new ProductDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getDescription(),
                p.getBasePrice(),
                p.getStatus().name(),
                p.isFeatured(),
                p.getRatingAvg(),
                p.getRatingCount(),
                p.getCategory() != null ? p.getCategory().getId() : null,
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getSeller() != null ? p.getSeller().getId() : null,
                p.getSeller() != null ? p.getSeller().getShopName() : null,
                p.getImages().stream().map(i -> i.getUrl()).toList(),
                p.getVariants().stream().map(VariantResponse::from).toList()
        );
    }
}
