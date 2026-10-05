package com.evon.medicare.service;

import com.evon.medicare.dto.OrderDTO;
import com.evon.medicare.entity.*;
import com.evon.medicare.exception.*;
import com.evon.medicare.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    /** Place a new order, verify Razorpay signature if online payment */
    public OrderDTO.Response placeOrder(OrderDTO.Request request) {

        // 1. Verify Razorpay signature for online payments
        if (request.getRazorpaySignature() != null) {
            verifyRazorpaySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
            );
        }

        // 2. Build order entity
        Order order = Order.builder()
                .orderId("MED" + Instant.now().toEpochMilli())
                .subtotal(request.getSubtotal())
                .taxes(request.getTaxes())
                .delivery(request.getDelivery())
                .total(request.getTotal())
                .customerName(request.getCustomerInfo().getName())
                .customerPhone(request.getCustomerInfo().getPhone())
                .customerAddress(request.getCustomerInfo().getAddress())
                .customerCity(request.getCustomerInfo().getCity())
                .customerState(request.getCustomerInfo().getState())
                .customerPincode(request.getCustomerInfo().getPincode())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("cod".equalsIgnoreCase(request.getPaymentMethod()) ? "COD" : "paid")
                .orderStatus("processing")
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .razorpaySignature(request.getRazorpaySignature())
                .build();

        // 3. Build order items (embedded in MongoDB document)
        List<OrderItem> items = new ArrayList<>();
        for (OrderDTO.OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .productId(itemReq.getProductId())
                    .name(itemReq.getName())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            items.add(item);
        }
        order.setItems(items);

        Order saved = orderRepository.save(order);
        log.info("✅ Order placed: {}", saved.getOrderId());

        // 4. Decrement stock
        for (OrderDTO.OrderItemRequest item : request.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStock(Math.max(0, p.getStock() - item.getQuantity()));
                    productRepository.save(p);
                });
            }
        }

        return toResponse(saved);
    }

    /** Get all orders (admin) */
    public List<OrderDTO.Response> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    /** Get single order by orderId string */
    public OrderDTO.Response getOrderById(String orderId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return toResponse(order);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private void verifyRazorpaySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        try {
            String message = razorpayOrderId + "|" + razorpayPaymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpaySecret.getBytes(), "HmacSHA256"));
            byte[] hmac = mac.doFinal(message.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hmac) sb.append(String.format("%02x", b));
            String expected = sb.toString();

            if (!expected.equals(signature)) {
                throw new BadRequestException("Payment signature verification failed");
            }
            log.info("✅ Razorpay signature verified");
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Error verifying payment: " + e.getMessage());
        }
    }

    private OrderDTO.Response toResponse(Order o) {
        List<OrderDTO.OrderItemResponse> items = o.getItems() == null ? List.of() :
                o.getItems().stream().map(i -> OrderDTO.OrderItemResponse.builder()
                        .productId(i.getProductId())
                        .name(i.getName())
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .build()).toList();

        return OrderDTO.Response.builder()
                .id(o.getId())
                .orderId(o.getOrderId())
                .items(items)
                .subtotal(o.getSubtotal())
                .taxes(o.getTaxes())
                .delivery(o.getDelivery())
                .total(o.getTotal())
                .customerName(o.getCustomerName())
                .customerPhone(o.getCustomerPhone())
                .customerAddress(o.getCustomerAddress())
                .customerCity(o.getCustomerCity())
                .customerState(o.getCustomerState())
                .customerPincode(o.getCustomerPincode())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus())
                .orderStatus(o.getOrderStatus())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
