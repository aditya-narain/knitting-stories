package com.knittingstories.order.dto;

public record PaymentVerificationRequest(
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature
) {
}
