package com.knittingstories.cart;

import com.knittingstories.cart.dto.AddCartItemRequest;
import com.knittingstories.cart.dto.CartResponse;
import com.knittingstories.catalog.ProductVariant;
import com.knittingstories.catalog.ProductVariantRepository;
import com.knittingstories.common.ApiException;
import com.knittingstories.user.User;
import com.knittingstories.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, ProductVariantRepository variantRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CartResponse getCart(UUID userId) {
        return CartResponse.from(getOrCreateCart(userId));
    }

    @Transactional
    public CartResponse addItem(UUID userId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        ProductVariant variant = variantRepository.findById(request.variantId())
                .orElseThrow(() -> ApiException.notFound("Product variant not found"));

        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(variant.getId()))
                .findFirst().orElse(null);

        int desiredQty = (existing != null ? existing.getQuantity() : 0) + request.quantity();
        if (desiredQty > variant.getStock()) {
            throw ApiException.badRequest("Only " + variant.getStock() + " in stock");
        }

        if (existing != null) {
            existing.setQuantity(desiredQty);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setVariant(variant);
            item.setQuantity(request.quantity());
            cart.getItems().add(item);
        }
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse updateItem(UUID userId, UUID itemId, int quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> ApiException.notFound("Cart item not found"));
        if (quantity > item.getVariant().getStock()) {
            throw ApiException.badRequest("Only " + item.getVariant().getStock() + " in stock");
        }
        item.setQuantity(quantity);
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse removeItem(UUID userId, UUID itemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse clear(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    @Transactional
    public Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("User not found"));
            Cart cart = new Cart();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }
}
