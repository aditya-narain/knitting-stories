package com.knittingstories.order;

import com.knittingstories.catalog.ProductVariant;
import com.knittingstories.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    // Denormalized snapshots (survive product/variant changes)
    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "product_title", nullable = false)
    private String productTitle;

    @Column(name = "variant_name", nullable = false)
    private String variantName;

    @Column(nullable = false)
    private String sku;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;
}
