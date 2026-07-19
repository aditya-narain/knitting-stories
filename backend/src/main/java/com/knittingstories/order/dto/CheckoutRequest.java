package com.knittingstories.order.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String shipName,
        @NotBlank String shipPhone,
        @NotBlank String shipLine1,
        String shipLine2,
        @NotBlank String shipCity,
        @NotBlank String shipState,
        @NotBlank String shipPostalCode
) {
}
