package com.knittingstories.seller.dto;

import java.math.BigDecimal;
import java.util.List;

public record SellerAnalyticsResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        long unitsSold,
        long productCount,
        long pendingFulfilment,
        List<TopProduct> topProducts
) {
    public record TopProduct(
            String productTitle,
            long unitsSold,
            BigDecimal revenue
    ) {
    }
}
