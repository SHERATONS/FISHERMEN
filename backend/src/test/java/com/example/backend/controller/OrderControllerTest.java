package com.example.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.backend.dto.CreateOrderDto;
import com.example.backend.dto.OrderItemDto;
import com.example.backend.dto.UpdateOrderStatusDto;
import com.example.backend.enums.OrderStatus;
import com.example.backend.model.FishListing;
import com.example.backend.model.Order;
import com.example.backend.model.User;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.OrderRepo;
import com.example.backend.repository.UserRepo;

@ExtendWith(MockitoExtension.class)
public class OrderControllerTest {

    @Mock
    private OrderRepo orderRepo;

    @Mock
    private UserRepo userRepo;

    @Mock
    private FishListingRepo fishListingRepo;

    @InjectMocks
    private OrderController orderController;

    private User buyer;
    private FishListing fishListing;
    private CreateOrderDto createOrderDto;
    private OrderItemDto itemDto;

    @BeforeEach
    void setUp() {
        buyer = new User();
        buyer.setId("user1");

        fishListing = new FishListing();
        fishListing.setId(1L);
        fishListing.setPrice(new BigDecimal("10.00"));

        itemDto = new OrderItemDto();
        itemDto.setFishListingId(1L);
        itemDto.setQuantity(2.0);

        createOrderDto = new CreateOrderDto();
        createOrderDto.setBuyerId("user1");
        createOrderDto.setItems(List.of(itemDto));
    }

    // --- BCC Test Cases for createOrder ---

    /**
     * Test Case 1 (Base Choice): Valid Buyer, Valid Items (Valid Fish Listing).
     * Characteristics:
     * - Buyer: Valid
     * - Items: Non-empty
     * - Fish Listing: Valid
     * Expected: Order created successfully (HTTP 201).
     */
    @Test
    public void testCreateOrder_Success() {
        // Arrange
        when(userRepo.findById("user1")).thenReturn(Optional.of(buyer));
        when(fishListingRepo.findById(1L)).thenReturn(Optional.of(fishListing));
        when(orderRepo.findMaxId()).thenReturn("ORD001"); // For ID generation
        when(orderRepo.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResponseEntity<?> response = orderController.createOrder(createOrderDto);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Order createdOrder = (Order) response.getBody();
        assertNotNull(createdOrder);
        assertEquals("user1", createdOrder.getBuyer().getId());
        assertEquals(1, createdOrder.getItems().size());
        // Use compareTo for BigDecimal to ignore scale differences
        assertEquals(0, new BigDecimal("20.00").compareTo(createdOrder.getTotalPrice()));
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    /**
     * Test Case 2 (Variation 1): Invalid Buyer (Buyer not found).
     * Base Choice Variation:
     * - Buyer: Invalid (Changed from Valid)
     * Expected: Error response (HTTP 404).
     */
    @Test
    public void testCreateOrder_BuyerNotFound() {
        // Arrange
        createOrderDto.setBuyerId("unknownUser");
        when(userRepo.findById("unknownUser")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = orderController.createOrder(createOrderDto);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Buyer not found", response.getBody());
        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Test Case 3 (Variation 2): Empty Items.
     * Base Choice Variation:
     * - Items: Empty (Changed from Non-empty)
     * Expected: Error response (HTTP 400).
     */
    @Test
    public void testCreateOrder_EmptyItems() {
        // Arrange
        createOrderDto.setItems(new ArrayList<>()); // Empty list
        when(userRepo.findById("user1")).thenReturn(Optional.of(buyer));

        // Act
        ResponseEntity<?> response = orderController.createOrder(createOrderDto);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Order must contain at least one item.", response.getBody());
        verify(orderRepo, never()).save(any(Order.class));
    }

    /**
     * Test Case 4 (Variation 3): Invalid Fish Listing (Fish not found).
     * Base Choice Variation:
     * - Fish Listing: Invalid (Changed from Valid)
     * Expected: Error response (HTTP 404).
     */
    @Test
    public void testCreateOrder_FishListingNotFound() {
        // Arrange
        itemDto.setFishListingId(999L); // Invalid ID
        createOrderDto.setItems(List.of(itemDto));

        when(userRepo.findById("user1")).thenReturn(Optional.of(buyer));
        when(fishListingRepo.findById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = orderController.createOrder(createOrderDto);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Fish listing with ID 999 not found"));
        verify(orderRepo, never()).save(any(Order.class));
    }

    // --- Tests for updateOrder ---

    /**
     * Test Case 5: Update Order Status - Success.
     * Expected: Order status updated (HTTP 200).
     */
    @Test
    public void testUpdateOrder_Success() {
        // Arrange
        String orderId = "ORD001";
        UpdateOrderStatusDto statusDto = new UpdateOrderStatusDto();
        statusDto.setStatus(OrderStatus.CONFIRMED);

        Order existingOrder = new Order();
        existingOrder.setId(orderId);
        existingOrder.setStatus(OrderStatus.PENDING);

        when(orderRepo.findById(orderId)).thenReturn(Optional.of(existingOrder));
        when(orderRepo.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ResponseEntity<Order> response = orderController.updateOrder(orderId, statusDto);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(OrderStatus.CONFIRMED, response.getBody().getStatus());
        verify(orderRepo, times(1)).save(existingOrder);
    }

    /**
     * Test Case 6: Update Order Status - Order Not Found.
     * Expected: HTTP 404.
     */
    @Test
    public void testUpdateOrder_NotFound() {
        // Arrange
        String orderId = "ORD999";
        UpdateOrderStatusDto statusDto = new UpdateOrderStatusDto();
        statusDto.setStatus(OrderStatus.CONFIRMED);

        when(orderRepo.findById(orderId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Order> response = orderController.updateOrder(orderId, statusDto);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(orderRepo, never()).save(any(Order.class));
    }

    // --- Tests for deleteOrder ---

    /**
     * Test Case 7: Delete Order - Success.
     * Expected: Order deleted (HTTP 200).
     */
    @Test
    public void testDeleteOrder_Success() {
        // Arrange
        String orderId = "ORD001";
        when(orderRepo.existsById(orderId)).thenReturn(true);

        // Act
        ResponseEntity<String> response = orderController.deleteOrder(orderId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Order deleted successfully", response.getBody());
        verify(orderRepo, times(1)).deleteById(orderId);
    }

    /**
     * Test Case 8: Delete Order - Not Found.
     * Expected: HTTP 404.
     */
    @Test
    public void testDeleteOrder_NotFound() {
        // Arrange
        String orderId = "ORD999";
        when(orderRepo.existsById(orderId)).thenReturn(false);

        // Act
        ResponseEntity<String> response = orderController.deleteOrder(orderId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(orderRepo, never()).deleteById(orderId);
    }

    // --- Additional Tests for Coverage ---

    @Test
    public void testGetAllOrders() {
        when(orderRepo.findAll()).thenReturn(Collections.emptyList());
        ResponseEntity<List<Order>> response = orderController.getAllOrders();
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void testGetOrderById_Success() {
        String id = "ORD001";
        Order order = new Order();
        when(orderRepo.findById(id)).thenReturn(Optional.of(order));
        ResponseEntity<Order> response = orderController.getOrderById(id);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    public void testGetOrderById_NotFound() {
        String id = "ORD001";
        when(orderRepo.findById(id)).thenReturn(Optional.empty());
        ResponseEntity<Order> response = orderController.getOrderById(id);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
