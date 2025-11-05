package com.example.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CreatePaymentDto;
import com.example.backend.dto.UpdatePaymentStatusDto;
import com.example.backend.model.Order;
import com.example.backend.model.Payment;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.PaymentRepo;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {
    
    private final PaymentRepo paymentRepo;
    private final OrderRepo orderRepo;

    public PaymentController(PaymentRepo paymentRepo, OrderRepo orderRepo) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Payment>> getAllPayments() {
        List<Payment> payments = paymentRepo.findAll();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody CreatePaymentDto paymentDto) {
        Optional<Order> orderOptional = orderRepo.findById(paymentDto.getOrderId());
        if (orderOptional.isEmpty()) {
            return new ResponseEntity<>("Order not found", HttpStatus.NOT_FOUND);
        }
        Order order = orderOptional.get();

        // Optional: Check if the order's total price matches the payment amount
        if (order.getTotalPrice().compareTo(paymentDto.getAmount()) != 0) {
            return new ResponseEntity<>("Payment amount does not match order total price.", HttpStatus.BAD_REQUEST);
        }

        Payment payment = new Payment();
        payment.setAmount(paymentDto.getAmount());
        payment.setStatus(com.example.backend.enums.PaymentStatus.SUCCESSFUL); // Assuming payment is successful on creation
        payment.setTransactionId(paymentDto.getTransactionId());
        payment.setOrder(order);

        Payment createdPayment = paymentRepo.save(payment);
        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePaymentStatus(@PathVariable Long id, @RequestBody UpdatePaymentStatusDto statusDto) {
        return paymentRepo.findById(id).map(existingPayment -> {
            existingPayment.setStatus(statusDto.getStatus());
            Payment updated = paymentRepo.save(existingPayment);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // Note: Deleting payments is highly discouraged in a real application.
    // It's better to mark them as VOID or REFUNDED.
    // This endpoint is provided for completeness but should be secured.
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable Long id) {
        if (!paymentRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        paymentRepo.deleteById(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
}
