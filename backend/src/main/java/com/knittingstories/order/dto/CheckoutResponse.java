package com.knittingstories.order.dto;

import java.math.BigDecimal;

public record CheckoutResponse(
        OrderResponse order,
        String razorpayOrderId,
        String razorpayKeyId,
        BigDecimal amount,
        String currency,
        boolean mockPayment
) {
}
