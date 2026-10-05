package com.evon.medicare.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    private String id;

    private String orderId;

    // Embedded order items (no separate collection needed in MongoDB)
    private List<OrderItem> items;

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
    private String paymentStatus = "pending";
    private String orderStatus = "processing";

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
