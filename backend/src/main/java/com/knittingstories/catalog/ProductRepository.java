package com.knittingstories.catalog;

import com.knittingstories.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Page<Product> findBySeller(User seller, Pageable pageable);

    @Query("select p from Product p left join fetch p.images where p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") UUID id);
}
