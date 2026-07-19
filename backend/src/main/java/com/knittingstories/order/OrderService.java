package com.knittingstories.order;

import com.knittingstories.cart.Cart;
import com.knittingstories.cart.CartItem;
import com.knittingstories.cart.CartService;
import com.knittingstories.catalog.Product;
import com.knittingstories.catalog.ProductVariant;
import com.knittingstories.catalog.ProductVariantRepository;
import com.knittingstories.common.ApiException;
import com.knittingstories.order.dto.CheckoutRequest;
import com.knittingstories.order.dto.CheckoutResponse;
import com.knittingstories.order.dto.OrderResponse;
import com.knittingstories.payment.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("49");
    private static final int RETURN_WINDOW_DAYS = 30;

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductVariantRepository variantRepository;
    private final PaymentService paymentService;

    public OrderService(OrderRepository orderRepository, CartService cartService,
                        ProductVariantRepository variantRepository, PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.variantRepository = variantRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    public CheckoutResponse checkout(UUID userId, CheckoutRequest request) {
        Cart cart = cartService.getOrCreateCart(userId);
        if (cart.getItems().isEmpty()) {
            throw ApiException.badRequest("Your cart is empty");
        }

        Order order = new Order();
        order.setCustomer(cart.getUser());
        order.setOrderNumber(generateOrderNumber());
        order.setCurrency(paymentService.getCurrency());
        order.setShipName(request.shipName());
        order.setShipPhone(request.shipPhone());
        order.setShipLine1(request.shipLine1());
        order.setShipLine2(request.shipLine2());
        order.setShipCity(request.shipCity());
        order.setShipState(request.shipState());
        order.setShipPostalCode(request.shipPostalCode());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getVariant();
            if (cartItem.getQuantity() > variant.getStock()) {
                throw ApiException.badRequest("Insufficient stock for " + variant.getName());
            }
            Product product = variant.getProduct();
            OrderItem item = new OrderItem();
            item.setVariant(variant);
            item.setProductId(product.getId());
            item.setSellerId(product.getSeller().getId());
            item.setProductTitle(product.getTitle());
            item.setVariantName(variant.getName());
            item.setSku(variant.getSku());
            item.setImageUrl(product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl());
            item.setUnitPrice(variant.getPrice());
            item.setQuantity(cartItem.getQuantity());
            order.addItem(item);
            subtotal = subtotal.add(variant.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setTotal(subtotal.add(shipping));
        order.setStatus(OrderStatus.PENDING_PAYMENT);

        String razorpayOrderId = paymentService.createOrder(order.getTotal(), order.getOrderNumber());
        order.setRazorpayOrderId(razorpayOrderId);
        orderRepository.save(order);

        return new CheckoutResponse(
                toResponse(order),
                razorpayOrderId,
                paymentService.getKeyId(),
                order.getTotal(),
                order.getCurrency(),
                !paymentService.isConfigured()
        );
    }

    @Transactional
    public OrderResponse confirmPayment(UUID userId, UUID orderId, String razorpayOrderId,
                                        String razorpayPaymentId, String signature) {
        Order order = getOwnedOrder(userId, orderId);
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw ApiException.badRequest("Order is not awaiting payment");
        }
        boolean valid = paymentService.verifySignature(
                razorpayOrderId != null ? razorpayOrderId : order.getRazorpayOrderId(),
                razorpayPaymentId, signature);
        if (!valid) {
            throw ApiException.badRequest("Payment verification failed");
        }

        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                if (item.getQuantity() > variant.getStock()) {
                    throw ApiException.badRequest("Insufficient stock for " + item.getProductTitle());
                }
                variant.setStock(variant.getStock() - item.getQuantity());
                variantRepository.save(variant);
            }
        }

        order.setPaid(true);
        order.setRazorpayPaymentId(razorpayPaymentId);
        order.setStatus(OrderStatus.PLACED);
        order.setPlacedAt(Instant.now());
        orderRepository.save(order);

        cartService.clear(userId);
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listCustomerOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getCustomerOrder(UUID userId, UUID orderId) {
        return toResponse(getOwnedOrder(userId, orderId));
    }

    @Transactional
    public OrderResponse cancel(UUID userId, UUID orderId) {
        Order order = getOwnedOrder(userId, orderId);
        if (!isCancellable(order)) {
            throw ApiException.badRequest("This order can no longer be cancelled");
        }
        restock(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse requestReturn(UUID userId, UUID orderId, String reason) {
        Order order = getOwnedOrder(userId, orderId);
        if (!isReturnable(order)) {
            throw ApiException.badRequest("This order is not eligible for return");
        }
        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnStatus(ReturnStatus.REQUESTED);
        order.setReturnReason(reason);
        order.setReturnRequestedAt(Instant.now());
        orderRepository.save(order);
        return toResponse(order);
    }

    private void restock(Order order) {
        for (OrderItem item : order.getItems()) {
            ProductVariant variant = item.getVariant();
            if (variant != null) {
                variant.setStock(variant.getStock() + item.getQuantity());
                variantRepository.save(variant);
            }
        }
    }

    private boolean isCancellable(Order order) {
        return order.getStatus() == OrderStatus.PLACED || order.getStatus() == OrderStatus.CONFIRMED;
    }

    private boolean isReturnable(Order order) {
        if (order.getStatus() != OrderStatus.DELIVERED || order.getDeliveredAt() == null) {
            return false;
        }
        long days = ChronoUnit.DAYS.between(order.getDeliveredAt(), Instant.now());
        return days <= RETURN_WINDOW_DAYS;
    }

    private Order getOwnedOrder(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        if (!order.getCustomer().getId().equals(userId)) {
            throw ApiException.forbidden("You do not have access to this order");
        }
        return order;
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.from(order, isCancellable(order), isReturnable(order));
    }

    private String generateOrderNumber() {
        return "KS-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase()
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
