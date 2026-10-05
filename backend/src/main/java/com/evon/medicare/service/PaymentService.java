package com.evon.medicare.service;

import com.evon.medicare.dto.RazorpayDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Razorpay payment integration service.
 * Uses Razorpay REST API directly (no SDK needed for basic order creation).
 */
@Service
@Slf4j
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private static final String RAZORPAY_URL = "https://api.razorpay.com/v1/orders";

    /** Create a Razorpay order */
    public RazorpayDTO.CreateOrderResponse createOrder(RazorpayDTO.CreateOrderRequest request) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            // Basic Auth header
            String auth = keyId + ":" + keySecret;
            String encoded = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + encoded);

            // Convert amount to paise (multiply by 100)
            long amountInPaise = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amountInPaise);
            body.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
            body.put("receipt", "rcpt_" + System.currentTimeMillis());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(RAZORPAY_URL, entity, Map.class);

            Map<?, ?> responseBody = response.getBody();
            String orderId = (String) responseBody.get("id");
            Number amount = (Number) responseBody.get("amount");
            String currency = (String) responseBody.get("currency");

            log.info("✅ Razorpay order created: {}", orderId);

            return RazorpayDTO.CreateOrderResponse.builder()
                    .orderId(orderId)
                    .amount(amount.longValue())
                    .currency(currency)
                    .key(keyId)
                    .build();

        } catch (Exception e) {
            log.error("❌ Razorpay error: {}", e.getMessage());
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }
}
