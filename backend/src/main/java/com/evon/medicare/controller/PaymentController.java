package com.evon.medicare.controller;

import com.evon.medicare.dto.RazorpayDTO;
import com.evon.medicare.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** POST /api/payment/create-order - Create Razorpay order */
    @PostMapping("/create-order")
    public ResponseEntity<RazorpayDTO.CreateOrderResponse> createOrder(
            @RequestBody RazorpayDTO.CreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }
}
