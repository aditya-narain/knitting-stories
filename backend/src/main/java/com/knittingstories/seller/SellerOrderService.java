package com.knittingstories.seller;

import com.knittingstories.common.ApiException;
import com.knittingstories.order.Order;
import com.knittingstories.order.OrderItem;
import com.knittingstories.order.OrderRepository;
import com.knittingstories.order.OrderStatus;
import com.knittingstories.order.dto.OrderResponse;
import com.knittingstories.seller.dto.SellerAnalyticsResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SellerOrderService {

    private final OrderRepository orderRepository;

    public SellerOrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listSellerOrders(UUID sellerId, Pageable pageable) {
        return orderRepository.findBySellerId(sellerId, pageable)
                .map(o -> OrderResponse.fromSellerView(o, sellerId));
    }

    @Transactional(readOnly = true)
    public OrderResponse getSellerOrder(UUID sellerId, UUID orderId) {
        Order order = getOrderWithSellerItems(sellerId, orderId);
        return OrderResponse.fromSellerView(order, sellerId);
    }

    @Transactional
    public OrderResponse updateStatus(UUID sellerId, UUID orderId, OrderStatus target) {
        Order order = getOrderWithSellerItems(sellerId, orderId);
        if (!order.isPaid()) {
            throw ApiException.badRequest("Order has not been paid yet");
        }
        validateTransition(order.getStatus(), target);
        order.setStatus(target);
        switch (target) {
            case SHIPPED -> order.setShippedAt(Instant.now());
            case DELIVERED -> order.setDeliveredAt(Instant.now());
            default -> {
            }
        }
        orderRepository.save(order);
        return OrderResponse.fromSellerView(order, sellerId);
    }

    @Transactional(readOnly = true)
    public SellerAnalyticsResponse analytics(UUID sellerId, long productCount) {
        List<Order> paidOrders = orderRepository.findPaidBySellerId(sellerId);

        BigDecimal revenue = BigDecimal.ZERO;
        long units = 0;
        long pending = 0;
        Map<String, long[]> unitsByProduct = new LinkedHashMap<>();
        Map<String, BigDecimal> revenueByProduct = new LinkedHashMap<>();

        for (Order order : paidOrders) {
            if (order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED) {
                pending++;
            }
            boolean countsAsRevenue = order.getStatus() != OrderStatus.CANCELLED
                    && order.getStatus() != OrderStatus.RETURNED;
            for (OrderItem item : order.getItems()) {
                if (!sellerId.equals(item.getSellerId())) {
                    continue;
                }
                BigDecimal line = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                if (countsAsRevenue) {
                    revenue = revenue.add(line);
                    units += item.getQuantity();
                    unitsByProduct.computeIfAbsent(item.getProductTitle(), k -> new long[1])[0] += item.getQuantity();
                    revenueByProduct.merge(item.getProductTitle(), line, BigDecimal::add);
                }
            }
        }

        List<SellerAnalyticsResponse.TopProduct> top = new ArrayList<>();
        unitsByProduct.forEach((title, u) ->
                top.add(new SellerAnalyticsResponse.TopProduct(title, u[0],
                        revenueByProduct.getOrDefault(title, BigDecimal.ZERO))));
        top.sort(Comparator.comparingLong(SellerAnalyticsResponse.TopProduct::unitsSold).reversed());

        return new SellerAnalyticsResponse(revenue, paidOrders.size(), units, productCount, pending,
                top.stream().limit(5).toList());
    }

    private void validateTransition(OrderStatus current, OrderStatus target) {
        boolean ok = switch (current) {
            case PLACED -> target == OrderStatus.CONFIRMED || target == OrderStatus.SHIPPED;
            case CONFIRMED -> target == OrderStatus.SHIPPED;
            case SHIPPED -> target == OrderStatus.DELIVERED;
            default -> false;
        };
        if (!ok) {
            throw ApiException.badRequest("Cannot change status from " + current + " to " + target);
        }
    }

    private Order getOrderWithSellerItems(UUID sellerId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        boolean owns = order.getItems().stream().anyMatch(i -> sellerId.equals(i.getSellerId()));
        if (!owns) {
            throw ApiException.forbidden("This order does not contain your products");
        }
        return order;
    }
}
