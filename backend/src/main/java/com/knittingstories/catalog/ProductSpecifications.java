package com.knittingstories.catalog;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.UUID;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> statusActive() {
        return (root, query, cb) -> cb.equal(root.get("status"), ProductStatus.ACTIVE);
    }

    public static Specification<Product> search(String term) {
        if (term == null || term.isBlank()) {
            return null;
        }
        String like = "%" + term.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("description")), like)
        );
    }

    public static Specification<Product> categorySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("category").get("slug"), slug);
    }

    public static Specification<Product> categoryId(UUID id) {
        if (id == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), id);
    }

    public static Specification<Product> minPrice(BigDecimal min) {
        if (min == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("basePrice"), min);
    }

    public static Specification<Product> maxPrice(BigDecimal max) {
        if (max == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("basePrice"), max);
    }

    public static Specification<Product> featured(Boolean featured) {
        if (featured == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("featured"), featured);
    }
}
