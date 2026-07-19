package com.knittingstories.catalog.dto;

import com.knittingstories.catalog.Product;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductSummaryResponse(
        UUID id,
        String title,
        BigDecimal basePrice,
        String status,
        boolean featured,
        BigDecimal ratingAvg,
        int ratingCount,
        String primaryImageUrl,
        String sellerShopName,
        UUID sellerId
) {
    public static ProductSummaryResponse from(Product p) {
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0).getUrl();
        String shop = p.getSeller() != null ? p.getSeller().getShopName() : null;
        UUID sellerId = p.getSeller() != null ? p.getSeller().getId() : null;
        return new ProductSummaryResponse(p.getId(), p.getTitle(), p.getBasePrice(),
                p.getStatus().name(), p.isFeatured(), p.getRatingAvg(), p.getRatingCount(),
                image, shop, sellerId);
    }
}
