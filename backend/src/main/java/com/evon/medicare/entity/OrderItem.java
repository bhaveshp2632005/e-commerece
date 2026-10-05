package com.evon.medicare.entity;

import lombok.*;

import java.math.BigDecimal;

// Not a separate document — embedded inside Order
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    private String productId;
    private String name;
    private Integer quantity;
    private BigDecimal price;
}
