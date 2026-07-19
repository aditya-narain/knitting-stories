package com.knittingstories.payment;

import com.knittingstories.common.ApiException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

@Service
public class PaymentService {

    private final String keyId;
    private final String keySecret;
    private final String currency;

    public PaymentService(
            @Value("${app.razorpay.key-id}") String keyId,
            @Value("${app.razorpay.key-secret}") String keySecret,
            @Value("${app.razorpay.currency:INR}") String currency) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.currency = currency;
    }

    public boolean isConfigured() {
        return StringUtils.hasText(keyId) && StringUtils.hasText(keySecret);
    }

    public String getKeyId() {
        return keyId;
    }

    public String getCurrency() {
        return currency;
    }

    /**
     * Creates a Razorpay order and returns its id. When credentials are absent
     * (local dev), returns a mock order id so the flow can be exercised end-to-end.
     */
    public String createOrder(BigDecimal amount, String receipt) {
        if (!isConfigured()) {
            return "mock_order_" + receipt;
        }
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            // Razorpay expects amount in the smallest currency unit (paise for INR)
            options.put("amount", amount.movePointRight(2).longValueExact());
            options.put("currency", currency);
            options.put("receipt", receipt);
            Order order = client.orders.create(options);
            return order.get("id");
        } catch (Exception e) {
            throw new ApiException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "Failed to create payment order: " + e.getMessage());
        }
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        if (!isConfigured()) {
            return true; // mock mode auto-approves
        }
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", signature);
            return Utils.verifyPaymentSignature(attributes, keySecret);
        } catch (Exception e) {
            return false;
        }
    }
}
