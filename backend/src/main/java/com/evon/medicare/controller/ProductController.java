package com.evon.medicare.controller;

import com.evon.medicare.dto.ProductDTO;
import com.evon.medicare.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /** GET /api/products?category=all|fever|cold|... */
    @GetMapping
    public ResponseEntity<List<ProductDTO.Response>> getAllProducts(
            @RequestParam(required = false, defaultValue = "all") String category) {
        return ResponseEntity.ok(productService.getAllProducts(category));
    }

    /** GET /api/products/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO.Response> getProduct(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /** POST /api/products - Admin only */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO.Response> createProduct(
            @Valid @RequestBody ProductDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }

    /** PUT /api/products/{id} - Admin only */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO.Response> updateProduct(
            @PathVariable String id,
            @Valid @RequestBody ProductDTO.Request request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /** DELETE /api/products/{id} - Admin only */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    /** GET /api/products/init - Seed sample data */
    @GetMapping("/init")
    public ResponseEntity<Map<String, String>> initProducts() {
        String result = productService.initProducts();
        return ResponseEntity.ok(Map.of("message", result));
    }
}
