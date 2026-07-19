package com.knittingstories.cart.dto;

import com.knittingstories.cart.CartItem;
import com.knittingstories.catalog.Product;
import com.knittingstories.catalog.ProductVariant;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(
        UUID id,
        UUID variantId,
        UUID productId,
        String productTitle,
        String variantName,
        String sku,
        String imageUrl,
        BigDecimal unitPrice,
        int quantity,
        int availableStock,
        BigDecimal lineTotal
) {
    public static CartItemResponse from(CartItem item) {
        ProductVariant v = item.getVariant();
        Product p = v.getProduct();
        String image = p.getImages().isEmpty() ? null : p.getImages().get(0).getUrl();
        BigDecimal lineTotal = v.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemResponse(item.getId(), v.getId(), p.getId(), p.getTitle(),
                v.getName(), v.getSku(), image, v.getPrice(), item.getQuantity(),
                v.getStock(), lineTotal);
    }
}
