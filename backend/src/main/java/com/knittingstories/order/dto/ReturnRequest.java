package com.knittingstories.order.dto;

import jakarta.validation.constraints.NotBlank;

public record ReturnRequest(
        @NotBlank String reason
) {
}
