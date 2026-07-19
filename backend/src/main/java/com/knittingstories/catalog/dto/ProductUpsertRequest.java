package com.knittingstories.catalog.dto;

import com.knittingstories.catalog.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductUpsertRequest(
        @NotBlank String title,
        String description,
        @NotNull @DecimalMin("0.0") BigDecimal basePrice,
        UUID categoryId,
        ProductStatus status,
        List<String> imageUrls,
        @Valid List<VariantUpsertRequest> variants
) {
}
