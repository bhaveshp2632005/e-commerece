package com.evon.medicare.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemRequest {
        private String productId;  // Changed from Long to String for MongoDB
        @NotBlank private String name;
        @Min(1) private Integer quantity;
        @NotNull private BigDecimal price;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CustomerInfo {
        @NotBlank private String name;
        @NotBlank private String phone;
        @NotBlank private String address;
        @NotBlank private String city;
        @NotBlank private String state;
        @NotBlank private String pincode;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotEmpty @Valid
        private List<OrderItemRequest> items;

        @NotNull private BigDecimal subtotal;
        @NotNull private BigDecimal taxes;
        @NotNull private BigDecimal delivery;
        @NotNull private BigDecimal total;

        @NotNull @Valid
        private CustomerInfo customerInfo;

        @NotBlank private String paymentMethod;

        // Razorpay fields (optional, for online payments)
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class OrderItemResponse {
        private String productId;  // Changed from Long to String
        private String name;
        private Integer quantity;
        private BigDecimal price;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private String id;         // Changed from Long to String
        private String orderId;
        private List<OrderItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal taxes;
        private BigDecimal delivery;
        private BigDecimal total;
        private String customerName;
        private String customerPhone;
        private String customerAddress;
        private String customerCity;
        private String customerState;
        private String customerPincode;
        private String paymentMethod;
        private String paymentStatus;
        private String orderStatus;
        private LocalDateTime createdAt;
    }
}
