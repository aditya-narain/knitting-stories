package com.knittingstories.order.dto;

import com.knittingstories.order.OrderItem;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String productTitle,
        String variantName,
        String sku,
        String imageUrl,
        BigDecimal unitPrice,
        int quantity,
        BigDecimal lineTotal
) {
    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(item.getId(), item.getProductId(), item.getProductTitle(),
                item.getVariantName(), item.getSku(), item.getImageUrl(), item.getUnitPrice(),
                item.getQuantity(), item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}
