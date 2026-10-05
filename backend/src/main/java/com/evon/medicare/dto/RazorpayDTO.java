package com.evon.medicare.dto;

import lombok.*;

import java.math.BigDecimal;

public class RazorpayDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CreateOrderRequest {
        private BigDecimal amount;
        private String currency = "INR";
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateOrderResponse {
        private String orderId;
        private Long amount;
        private String currency;
        private String key;
    }
}
