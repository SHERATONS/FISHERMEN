package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.enums.PaymentStatus;
import com.example.backend.model.Payment;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.PaymentRepo;

import jakarta.persistence.criteria.Order;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;



@RestController
@RequestMapping("/payments")
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
        Payment payment = paymentRepo.findById(id).orElse(null);
        if (payment != null) {
            return ResponseEntity.ok(payment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> paymentData) {
        Long orderId = ((Number) paymentData.get("orderId")).longValue();

        Order order = (Order) orderRepo.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>("Order not found", HttpStatus.NOT_FOUND);
        }

        Payment payment = new Payment();
        payment.setAmount(BigDecimal.valueOf(((Number) paymentData.get("amount")).doubleValue()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId((String) paymentData.get("transactionId"));
        payment.setOrder((com.example.backend.model.Order) order);

        Payment createdPayment = paymentRepo.save(payment);

        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment updatedPayment) {
        Payment existingPayment = paymentRepo.findById(id).orElse(null);
        if (existingPayment != null) {
            existingPayment.setAmount(updatedPayment.getAmount());
            existingPayment.setStatus(updatedPayment.getStatus());
            existingPayment.setTransactionId(updatedPayment.getTransactionId());
            Payment updated = paymentRepo.save(existingPayment);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deletePayment(@PathVariable Long id) {
        paymentRepo.findById(id).orElse(null);
        if (paymentRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        paymentRepo.deleteById(id);
        return ResponseEntity.ok("Payment deleted successfully");
    }
}
