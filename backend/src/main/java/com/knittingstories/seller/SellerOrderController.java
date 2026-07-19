package com.knittingstories.seller;

import com.knittingstories.catalog.ProductService;
import com.knittingstories.order.dto.OrderResponse;
import com.knittingstories.security.UserPrincipal;
import com.knittingstories.seller.dto.SellerAnalyticsResponse;
import com.knittingstories.seller.dto.UpdateOrderStatusRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/seller")
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;
    private final ProductService productService;

    public SellerOrderController(SellerOrderService sellerOrderService, ProductService productService) {
        this.sellerOrderService = sellerOrderService;
        this.productService = productService;
    }

    @GetMapping("/orders")
    public Page<OrderResponse> listOrders(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return sellerOrderService.listSellerOrders(principal.getId(), PageRequest.of(page, Math.min(size, 100)));
    }

    @GetMapping("/orders/{orderId}")
    public OrderResponse getOrder(@AuthenticationPrincipal UserPrincipal principal,
                                  @PathVariable UUID orderId) {
        return sellerOrderService.getSellerOrder(principal.getId(), orderId);
    }

    @PatchMapping("/orders/{orderId}/status")
    public OrderResponse updateStatus(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable UUID orderId,
                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return sellerOrderService.updateStatus(principal.getId(), orderId, request.status());
    }

    @GetMapping("/analytics")
    public SellerAnalyticsResponse analytics(@AuthenticationPrincipal UserPrincipal principal) {
        long productCount = productService.listSellerProducts(principal.getId(), Pageable.ofSize(1))
                .getTotalElements();
        return sellerOrderService.analytics(principal.getId(), productCount);
    }
}
