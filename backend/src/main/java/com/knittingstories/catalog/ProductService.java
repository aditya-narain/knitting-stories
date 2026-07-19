package com.knittingstories.catalog;

import com.knittingstories.catalog.dto.ProductDetailResponse;
import com.knittingstories.catalog.dto.ProductSummaryResponse;
import com.knittingstories.catalog.dto.ProductUpsertRequest;
import com.knittingstories.catalog.dto.VariantUpsertRequest;
import com.knittingstories.common.ApiException;
import com.knittingstories.user.User;
import com.knittingstories.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, ProductVariantRepository variantRepository,
                          CategoryRepository categoryRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> searchActive(String q, String categorySlug, BigDecimal minPrice,
                                                     BigDecimal maxPrice, Boolean featured, Pageable pageable) {
        Specification<Product> spec = Specification.where(ProductSpecifications.statusActive())
                .and(ProductSpecifications.search(q))
                .and(ProductSpecifications.categorySlug(categorySlug))
                .and(ProductSpecifications.minPrice(minPrice))
                .and(ProductSpecifications.maxPrice(maxPrice))
                .and(ProductSpecifications.featured(featured));
        return productRepository.findAll(spec, pageable).map(ProductSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getPublicDetail(UUID id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw ApiException.notFound("Product not found");
        }
        return ProductDetailResponse.from(product);
    }

    // ---- Seller operations ----

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listSellerProducts(UUID sellerId, Pageable pageable) {
        User seller = getUser(sellerId);
        return productRepository.findBySeller(seller, pageable).map(ProductSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getSellerProduct(UUID sellerId, UUID productId) {
        Product product = getOwnedProduct(sellerId, productId);
        return ProductDetailResponse.from(product);
    }

    @Transactional
    public ProductDetailResponse create(UUID sellerId, ProductUpsertRequest request) {
        User seller = getUser(sellerId);
        Product product = new Product();
        product.setSeller(seller);
        applyUpsert(product, request);
        productRepository.save(product);
        return ProductDetailResponse.from(product);
    }

    @Transactional
    public ProductDetailResponse update(UUID sellerId, UUID productId, ProductUpsertRequest request) {
        Product product = getOwnedProduct(sellerId, productId);
        product.getImages().clear();
        product.getVariants().clear();
        applyUpsert(product, request);
        productRepository.save(product);
        return ProductDetailResponse.from(product);
    }

    @Transactional
    public void delete(UUID sellerId, UUID productId) {
        Product product = getOwnedProduct(sellerId, productId);
        product.setStatus(ProductStatus.ARCHIVED);
        productRepository.save(product);
    }

    private void applyUpsert(Product product, ProductUpsertRequest request) {
        product.setTitle(request.title());
        product.setDescription(request.description());
        product.setBasePrice(request.basePrice());
        product.setStatus(request.status() != null ? request.status() : ProductStatus.DRAFT);

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> ApiException.badRequest("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.imageUrls() != null) {
            int pos = 0;
            for (String url : request.imageUrls()) {
                ProductImage image = new ProductImage();
                image.setUrl(url);
                image.setPosition(pos++);
                product.addImage(image);
            }
        }

        List<String> skus = new ArrayList<>();
        if (request.variants() != null) {
            for (VariantUpsertRequest v : request.variants()) {
                if (skus.contains(v.sku())) {
                    throw ApiException.badRequest("Duplicate SKU in request: " + v.sku());
                }
                skus.add(v.sku());
                variantRepository.findBySku(v.sku())
                        .filter(existing -> product.getId() == null
                                || existing.getProduct() == null
                                || !existing.getProduct().getId().equals(product.getId()))
                        .ifPresent(existing -> {
                            throw ApiException.conflict("SKU already in use: " + v.sku());
                        });
                ProductVariant variant = new ProductVariant();
                variant.setSku(v.sku());
                variant.setName(v.name());
                variant.setColor(v.color());
                variant.setSize(v.size());
                variant.setPrice(v.price());
                variant.setStock(v.stock());
                product.addVariant(variant);
            }
        }
    }

    private Product getOwnedProduct(UUID sellerId, UUID productId) {
        Product product = productRepository.findByIdWithDetails(productId)
                .orElseThrow(() -> ApiException.notFound("Product not found"));
        if (product.getSeller() == null || !product.getSeller().getId().equals(sellerId)) {
            throw ApiException.forbidden("You do not own this product");
        }
        return product;
    }

    private User getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }
}
