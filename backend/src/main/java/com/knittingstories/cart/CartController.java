package com.knittingstories.cart;

import com.knittingstories.cart.dto.AddCartItemRequest;
import com.knittingstories.cart.dto.CartResponse;
import com.knittingstories.cart.dto.UpdateCartItemRequest;
import com.knittingstories.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartResponse get(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.getCart(principal.getId());
    }

    @PostMapping("/items")
    public CartResponse add(@AuthenticationPrincipal UserPrincipal principal,
                            @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(principal.getId(), request);
    }

    @PatchMapping("/items/{itemId}")
    public CartResponse update(@AuthenticationPrincipal UserPrincipal principal,
                              @PathVariable UUID itemId,
                              @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(principal.getId(), itemId, request.quantity());
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse remove(@AuthenticationPrincipal UserPrincipal principal,
                              @PathVariable UUID itemId) {
        return cartService.removeItem(principal.getId(), itemId);
    }

    @DeleteMapping
    public CartResponse clear(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.clear(principal.getId());
    }
}
