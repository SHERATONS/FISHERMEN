package com.example.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.enums.OrderStatus;
import com.example.backend.model.FishListing;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.OrderItemRepo;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.UserRepo;

@RestController
@RequestMapping("/orders")
public class OrderController {
    
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final FishListingRepo fishListingRepo;
    private final OrderItemRepo orderItemRepo;

    public OrderController(OrderRepo orderRepo, UserRepo userRepo, FishListingRepo fishListingRepo, OrderItemRepo orderItemRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.fishListingRepo = fishListingRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepo.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderRepo.findById(id).orElse(null);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        Long buyerId = ((Number) orderData.get("buyerId")).longValue();
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");

        User buyer = (User) userRepo.findById(buyerId).orElse(null);
        if (buyer == null) {
            return new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
        }

        Order order = new Order();
        order.setBuyer((com.example.backend.model.User) buyer);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (Map<String, Object> itemData : itemsData) {
            Long fishListingId = ((Number) itemData.get("fishListingId")).longValue();
            Double quantity = (Double) itemData.get("quantity");

            FishListing fishListing = fishListingRepo.findById(fishListingId).orElse(null);
            if (fishListing == null) {
                return new ResponseEntity<>("Fish listing not found", HttpStatus.NOT_FOUND);
            }

            BigDecimal priceAtPurchase = fishListing.getPrice();
            BigDecimal itemTotalPrice = priceAtPurchase.multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setFishListing(fishListing);
            orderItem.setOrder(order);
            orderItem.setPriceAtPurchase(priceAtPurchase);
            orderItem.setQuantity(quantity);

            orderItems.add(orderItem);
            totalPrice = totalPrice.add(itemTotalPrice);
        }

        order.setItems(orderItems);
        order.setTotalPrice(totalPrice);

        Order createdOrder = orderRepo.save(order);

        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable Long id, @RequestBody Order updatedOrder) {
        Order existingOrder = orderRepo.findById(id).orElse(null);
        if (existingOrder != null) {
            existingOrder.setStatus(updatedOrder.getStatus());
            Order updated = orderRepo.save(existingOrder);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderRepo.findById(id).orElse(null);
        if (orderRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        orderRepo.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully");
    }
}
