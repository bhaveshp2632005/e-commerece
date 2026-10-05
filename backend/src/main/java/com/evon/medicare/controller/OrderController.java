package com.evon.medicare.controller;

import com.evon.medicare.dto.OrderDTO;
import com.evon.medicare.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** POST /api/orders - Place a new order (public) */
    @PostMapping
    public ResponseEntity<OrderDTO.Response> placeOrder(
            @Valid @RequestBody OrderDTO.Request request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(request));
    }

    /** GET /api/orders - Get all orders (admin) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO.Response>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /** GET /api/orders/{orderId} - Get single order by orderId string */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO.Response> getOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
}
