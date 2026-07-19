package com.knittingstories.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record VariantUpsertRequest(
        @NotBlank String sku,
        @NotBlank String name,
        String color,
        String size,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @PositiveOrZero int stock
) {
}
