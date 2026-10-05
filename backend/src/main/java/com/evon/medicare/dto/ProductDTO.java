package com.evon.medicare.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank(message = "Name is required")
        private String name;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.01", message = "Price must be > 0")
        private BigDecimal price;

        private BigDecimal originalPrice;

        @NotBlank(message = "Category is required")
        private String category;

        @NotBlank(message = "Image URL is required")
        private String image;

        @Min(0) private Integer stock = 100;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private String id;   // Changed from Long to String for MongoDB
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String category;
        private String image;
        private Integer stock;
        private LocalDateTime createdAt;
    }
}
