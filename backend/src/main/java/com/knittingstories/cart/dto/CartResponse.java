package com.knittingstories.cart.dto;

import com.knittingstories.cart.Cart;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID id,
        List<CartItemResponse> items,
        BigDecimal subtotal,
        int totalItems
) {
    public static CartResponse from(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(CartItemResponse::from)
                .toList();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalItems = items.stream().mapToInt(CartItemResponse::quantity).sum();
        return new CartResponse(cart.getId(), items, subtotal, totalItems);
    }
}
