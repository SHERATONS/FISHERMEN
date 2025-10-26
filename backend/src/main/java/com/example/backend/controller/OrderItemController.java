package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.OrderItem;
import com.example.backend.repository.OrderItemRepo;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/orderItems")
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
        OrderItem orderItem = orderItemRepo.findById(id).orElse(null);
        if (orderItem != null) {
            return ResponseEntity.ok(orderItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<OrderItem> createOrderItem(@RequestBody OrderItem orderItem) {
        OrderItem createdOrderItem = orderItemRepo.save(orderItem);
        return ResponseEntity.ok(createdOrderItem);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<OrderItem> updateOrderItem(@PathVariable Long id, @RequestBody OrderItem updatedOrderItem) {
        OrderItem existingOrderItem = orderItemRepo.findById(id).orElse(null);
        if (existingOrderItem != null) {
            existingOrderItem.setFishListing(updatedOrderItem.getFishListing());
            existingOrderItem.setOrder(updatedOrderItem.getOrder());
            existingOrderItem.setPriceAtPurchase(updatedOrderItem.getPriceAtPurchase());
            existingOrderItem.setQuantity(updatedOrderItem.getQuantity());
            OrderItem updated = orderItemRepo.save(existingOrderItem);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deleteOrderItem(@PathVariable Long id) {
        orderItemRepo.findById(id).orElse(null);
        if (orderItemRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        orderItemRepo.deleteById(id);
        return ResponseEntity.ok("OrderItem deleted successfully");
    }
}
