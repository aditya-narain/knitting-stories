package com.knittingstories.seller;

import com.knittingstories.catalog.ProductService;
import com.knittingstories.catalog.dto.ProductDetailResponse;
import com.knittingstories.catalog.dto.ProductSummaryResponse;
import com.knittingstories.catalog.dto.ProductUpsertRequest;
import com.knittingstories.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/seller/products")
public class SellerProductController {

    private final ProductService productService;

    public SellerProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductSummaryResponse> list(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return productService.listSellerProducts(principal.getId(), PageRequest.of(page, Math.min(size, 100)));
    }

    @GetMapping("/{id}")
    public ProductDetailResponse get(@AuthenticationPrincipal UserPrincipal principal,
                                     @PathVariable UUID id) {
        return productService.getSellerProduct(principal.getId(), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDetailResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                        @Valid @RequestBody ProductUpsertRequest request) {
        return productService.create(principal.getId(), request);
    }

    @PutMapping("/{id}")
    public ProductDetailResponse update(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable UUID id,
                                        @Valid @RequestBody ProductUpsertRequest request) {
        return productService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal principal,
                       @PathVariable UUID id) {
        productService.delete(principal.getId(), id);
    }
}
