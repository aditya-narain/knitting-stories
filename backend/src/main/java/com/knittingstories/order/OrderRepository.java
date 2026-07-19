package com.knittingstories.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    @Query("select distinct o from Order o join o.items i where i.sellerId = :sellerId order by o.createdAt desc")
    Page<Order> findBySellerId(@Param("sellerId") UUID sellerId, Pageable pageable);

    @Query("select distinct o from Order o join o.items i where i.sellerId = :sellerId and o.paid = true")
    java.util.List<Order> findPaidBySellerId(@Param("sellerId") UUID sellerId);
}
