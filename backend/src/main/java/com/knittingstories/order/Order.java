package com.knittingstories.order;

import com.knittingstories.common.BaseEntity;
import com.knittingstories.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false)
    private String currency = "INR";

    // Payment
    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(nullable = false)
    private boolean paid = false;

    // Shipping address (denormalized snapshot)
    @Column(name = "ship_name")
    private String shipName;
    @Column(name = "ship_phone")
    private String shipPhone;
    @Column(name = "ship_line1")
    private String shipLine1;
    @Column(name = "ship_line2")
    private String shipLine2;
    @Column(name = "ship_city")
    private String shipCity;
    @Column(name = "ship_state")
    private String shipState;
    @Column(name = "ship_postal_code")
    private String shipPostalCode;

    private Instant placedAt;
    private Instant shippedAt;
    private Instant deliveredAt;
    private Instant cancelledAt;

    // Returns
    @Enumerated(EnumType.STRING)
    @Column(name = "return_status", nullable = false)
    private ReturnStatus returnStatus = ReturnStatus.NONE;

    @Column(name = "return_reason", length = 1000)
    private String returnReason;

    private Instant returnRequestedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem item) {
        item.setOrder(this);
        this.items.add(item);
    }
}
