package com.knittingstories.order.dto;

import com.knittingstories.order.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String orderNumber,
        String status,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        String currency,
        boolean paid,
        String returnStatus,
        String returnReason,
        String shipName,
        String shipPhone,
        String shipLine1,
        String shipLine2,
        String shipCity,
        String shipState,
        String shipPostalCode,
        Instant placedAt,
        Instant shippedAt,
        Instant deliveredAt,
        Instant cancelledAt,
        Instant createdAt,
        boolean cancellable,
        boolean returnable,
        List<OrderItemResponse> items
) {
    public static OrderResponse from(Order o, boolean cancellable, boolean returnable) {
        return new OrderResponse(
                o.getId(), o.getOrderNumber(), o.getStatus().name(),
                o.getSubtotal(), o.getShippingFee(), o.getTotal(), o.getCurrency(), o.isPaid(),
                o.getReturnStatus().name(), o.getReturnReason(),
                o.getShipName(), o.getShipPhone(), o.getShipLine1(), o.getShipLine2(),
                o.getShipCity(), o.getShipState(), o.getShipPostalCode(),
                o.getPlacedAt(), o.getShippedAt(), o.getDeliveredAt(), o.getCancelledAt(), o.getCreatedAt(),
                cancellable, returnable,
                o.getItems().stream().map(OrderItemResponse::from).toList()
        );
    }

    /** Seller view: only the seller's own line items and their subtotal. */
    public static OrderResponse fromSellerView(Order o, UUID sellerId) {
        List<OrderItemResponse> items = o.getItems().stream()
                .filter(i -> sellerId.equals(i.getSellerId()))
                .map(OrderItemResponse::from)
                .toList();
        BigDecimal sellerSubtotal = items.stream()
                .map(OrderItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new OrderResponse(
                o.getId(), o.getOrderNumber(), o.getStatus().name(),
                sellerSubtotal, o.getShippingFee(), sellerSubtotal, o.getCurrency(), o.isPaid(),
                o.getReturnStatus().name(), o.getReturnReason(),
                o.getShipName(), o.getShipPhone(), o.getShipLine1(), o.getShipLine2(),
                o.getShipCity(), o.getShipState(), o.getShipPostalCode(),
                o.getPlacedAt(), o.getShippedAt(), o.getDeliveredAt(), o.getCancelledAt(), o.getCreatedAt(),
                false, false,
                items
        );
    }
}
