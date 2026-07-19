package com.knittingstories.order;

import com.knittingstories.order.dto.CheckoutRequest;
import com.knittingstories.order.dto.CheckoutResponse;
import com.knittingstories.order.dto.OrderResponse;
import com.knittingstories.order.dto.PaymentVerificationRequest;
import com.knittingstories.order.dto.ReturnRequest;
import com.knittingstories.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasRole('CUSTOMER')")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@AuthenticationPrincipal UserPrincipal principal,
                                     @Valid @RequestBody CheckoutRequest request) {
        return orderService.checkout(principal.getId(), request);
    }

    @PostMapping("/{orderId}/payment/verify")
    public OrderResponse verifyPayment(@AuthenticationPrincipal UserPrincipal principal,
                                       @PathVariable UUID orderId,
                                       @RequestBody PaymentVerificationRequest request) {
        return orderService.confirmPayment(principal.getId(), orderId,
                request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature());
    }

    @GetMapping
    public Page<OrderResponse> list(@AuthenticationPrincipal UserPrincipal principal,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size) {
        return orderService.listCustomerOrders(principal.getId(), PageRequest.of(page, Math.min(size, 50)));
    }

    @GetMapping("/{orderId}")
    public OrderResponse get(@AuthenticationPrincipal UserPrincipal principal,
                             @PathVariable UUID orderId) {
        return orderService.getCustomerOrder(principal.getId(), orderId);
    }

    @PostMapping("/{orderId}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal UserPrincipal principal,
                                @PathVariable UUID orderId) {
        return orderService.cancel(principal.getId(), orderId);
    }

    @PostMapping("/{orderId}/return")
    public OrderResponse requestReturn(@AuthenticationPrincipal UserPrincipal principal,
                                       @PathVariable UUID orderId,
                                       @Valid @RequestBody ReturnRequest request) {
        return orderService.requestReturn(principal.getId(), orderId, request.reason());
    }
}
