package com.example.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.example.backend.dto.CreateOrderDto;
import com.example.backend.dto.OrderDto;
import com.example.backend.dto.OrderItemDto;
import com.example.backend.dto.UpdateOrderStatusDto;
import com.example.backend.enums.OrderStatus;
import com.example.backend.model.FishListing;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.User;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.UserRepo;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final FishListingRepo fishListingRepo;

    public OrderController(OrderRepo orderRepo, UserRepo userRepo, FishListingRepo fishListingRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.fishListingRepo = fishListingRepo;
    }

    private synchronized String generateOrderId() {
        String prefix = "ORD";
        String lastId = orderRepo.findMaxId();
        int nextSequence = 1;

        if (lastId != null) {
            try {
                int lastSequence = Integer.parseInt(lastId.substring(prefix.length()));
                nextSequence = lastSequence + 1;
            } catch (NumberFormatException | StringIndexOutOfBoundsException e) {
                logger.warn("Failed to parse sequence from last Order ID: '{}'. Resetting sequence to 1. Error: {}", lastId, e.getMessage());
                // If parsing fails, start from 1, but rely on the unique constraint to catch actual duplicates.
                nextSequence = 1; 
            }
        }
        return String.format("%s%03d", prefix, nextSequence);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderRepo.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/list-dto")
    public ResponseEntity<List<OrderDto>> getAllOrdersDto() {
        List<Order> orders = orderRepo.findAll();
        List<OrderDto> dtoList = orders.stream()
                                       .map(OrderDto::from)
                                       .toList();
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<OrderDto>> getOrdersByBuyer(@PathVariable String buyerId) {
        List<Order> orders = orderRepo.findByBuyerId(buyerId);
        List<OrderDto> orderDtos = orders.stream()
            .map(OrderDto::from)
            .toList();
        return ResponseEntity.ok(orderDtos);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderDto orderDto) {
        User buyer = userRepo.findById(orderDto.getBuyerId()).orElse(null);
        if (buyer == null) {
            return new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
        }
        if (orderDto.getItems() == null || orderDto.getItems().isEmpty()) {
            return new ResponseEntity<>("Order must contain at least one item.", HttpStatus.BAD_REQUEST);
        }

        Order order = new Order();
        order.setId(generateOrderId()); // Generate and set the new ID
        order.setBuyer(buyer);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());

        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderItemDto itemDto : orderDto.getItems()) {
            Long fishListingId = itemDto.getFishListingId();
            Double quantity = itemDto.getQuantity();

            FishListing fishListing = fishListingRepo.findById(fishListingId).orElse(null);
            if (fishListing == null) {
                return new ResponseEntity<>("Fish listing with ID " + fishListingId + " not found.", HttpStatus.NOT_FOUND);
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
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody UpdateOrderStatusDto statusDto) {
        return orderRepo.findById(id).map(existingOrder -> {
            existingOrder.setStatus(statusDto.getStatus());
            Order updated = orderRepo.save(existingOrder);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable String id) {
        if (!orderRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        orderRepo.deleteById(id);
        return ResponseEntity.ok("Order deleted successfully");
    }
}
