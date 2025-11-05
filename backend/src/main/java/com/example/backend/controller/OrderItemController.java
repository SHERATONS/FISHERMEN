package com.example.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.OrderItem;
import com.example.backend.repository.OrderItemRepo;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/orderItems")
public class OrderItemController {
    
    private final OrderItemRepo orderItemRepo;

    public OrderItemController(OrderItemRepo orderItemRepo) {
        this.orderItemRepo = orderItemRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<OrderItem>> getAllOrderItems() {
        List<OrderItem> orderItems = orderItemRepo.findAll();
        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getOrderItemById(@PathVariable Long id) {
        return orderItemRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Note: Deleting an OrderItem directly is generally discouraged as it can affect
    // the integrity of an Order. This endpoint is provided for administrative purposes.
    // In a real-world scenario, you might want to restrict access to this.
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrderItem(@PathVariable Long id) {
        if (!orderItemRepo.existsById(id)) {
            return new ResponseEntity<>("OrderItem not found", HttpStatus.NOT_FOUND);
        }

        orderItemRepo.deleteById(id);
        return ResponseEntity.ok("OrderItem deleted successfully");
    }
}
