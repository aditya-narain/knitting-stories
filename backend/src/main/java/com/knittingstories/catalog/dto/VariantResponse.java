package com.knittingstories.catalog.dto;

import com.knittingstories.catalog.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public record VariantResponse(
        UUID id,
        String sku,
        String name,
        String color,
        String size,
        BigDecimal price,
        int stock
) {
    public static VariantResponse from(ProductVariant v) {
        return new VariantResponse(v.getId(), v.getSku(), v.getName(),
                v.getColor(), v.getSize(), v.getPrice(), v.getStock());
    }
}
