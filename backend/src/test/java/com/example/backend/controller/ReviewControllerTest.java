package com.example.backend.controller;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.dto.CreateReviewDto;
import com.example.backend.dto.UpdateReviewDto;
import com.example.backend.model.Order;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Review;
import com.example.backend.model.User;
import com.example.backend.repository.OrderItemRepo;
import com.example.backend.repository.ReviewRepo;
import com.example.backend.repository.UserRepo;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(ReviewController.class)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewRepo reviewRepo;

    @MockBean
    private UserRepo userRepo;

    @MockBean
    private OrderItemRepo orderItemRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private User buyer;
    private User otherBuyer;
    private OrderItem orderItem;
    private Order order;
    private Review review;

    @BeforeEach
    void setUp() {
        buyer = new User();
        buyer.setId("BUY0001");
        buyer.setFirstName("Test Buyer");
        buyer.setLastName("Buyer");
        buyer.setUsername("test_buyer");
        buyer.setEmail("buyer@test.com");


        otherBuyer = new User();
        otherBuyer.setId("BUY0002");
        otherBuyer.setFirstName("Other Buyer");
        otherBuyer.setLastName("Buyer");
        otherBuyer.setUsername("other_buyer");
        otherBuyer.setEmail("other_buyer@test.com");

        order = new Order();
        order.setBuyer(buyer);

        orderItem = new OrderItem();
        orderItem.setId(1L);
        orderItem.setOrder(order);

        review = new Review();
        review.setId(1L);
        review.setRating(5);
        review.setComment("Great product!");
        review.setBuyer(buyer);
        review.setOrderItem(orderItem);
        review.setReviewDate(LocalDateTime.now());
    }

    // Test 4: Submission flow (happy path - end to end)
    @Test
    void testCreateReview_HappyPath() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Excellent fish quality!");
        createDto.setBuyerId("BUY0001");
        createDto.setOrderItemId(1L);

        when(userRepo.findById("BUY0001")).thenReturn(Optional.of(buyer));
        when(orderItemRepo.findById(1L)).thenReturn(Optional.of(orderItem));
        when(reviewRepo.existsByOrderItemId(1L)).thenReturn(false);
        when(reviewRepo.save(any(Review.class))).thenReturn(review);

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Great product!"))
                .andExpect(jsonPath("$.buyerId").value("BUY0001"))
                .andExpect(jsonPath("$.orderItemId").value(1L));

        verify(reviewRepo).save(any(Review.class));
    }

    @Test
    void testUpdateReview_HappyPath() throws Exception {
        UpdateReviewDto updateDto = new UpdateReviewDto();
        updateDto.setRating(4);
        updateDto.setComment("Updated comment");

        Review updatedReview = new Review();
        updatedReview.setId(1L);
        updatedReview.setRating(4);
        updatedReview.setComment("Updated comment");
        updatedReview.setBuyer(buyer);
        updatedReview.setOrderItem(orderItem);
        updatedReview.setReviewDate(LocalDateTime.now());

        when(reviewRepo.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepo.save(any(Review.class))).thenReturn(updatedReview);

        mockMvc.perform(put("/api/reviews/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4))
                .andExpect(jsonPath("$.comment").value("Updated comment"));
    }

    @Test
    void testGetAllReviews() throws Exception {
        List<Review> reviews = Arrays.asList(review);
        when(reviewRepo.findAll()).thenReturn(reviews);

        mockMvc.perform(get("/api/reviews/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].rating").value(5))
                .andExpect(jsonPath("$[0].comment").value("Great product!"));
    }

    @Test
    void testGetReviewsByBuyerId() throws Exception {
        List<Review> reviews = Arrays.asList(review);
        when(reviewRepo.findByBuyerId("BUY0001")).thenReturn(reviews);

        mockMvc.perform(get("/api/reviews/buyer/BUY0001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].buyerId").value("BUY0001"));
    }

    @Test
    void testDeleteReview() throws Exception {
        when(reviewRepo.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/reviews/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Review deleted successfully"));

        verify(reviewRepo).deleteById(1L);
    }

    // Test 5: Validation tests
    @Test
    void testCreateReview_BuyerNotFound() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Great product!");
        createDto.setBuyerId("INVALID_BUYER");
        createDto.setOrderItemId(1L);

        when(userRepo.findById("INVALID_BUYER")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Buyer not found"));
    }

    @Test
    void testCreateReview_OrderItemNotFound() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Great product!");
        createDto.setBuyerId("BUY0001");
        createDto.setOrderItemId(999L);

        when(userRepo.findById("BUY0001")).thenReturn(Optional.of(buyer));
        when(orderItemRepo.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Order item not found"));
    }

    @Test
    void testCreateReview_ReviewAlreadyExists() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Great product!");
        createDto.setBuyerId("BUY0001");
        createDto.setOrderItemId(1L);

        when(userRepo.findById("BUY0001")).thenReturn(Optional.of(buyer));
        when(orderItemRepo.findById(1L)).thenReturn(Optional.of(orderItem));
        when(reviewRepo.existsByOrderItemId(1L)).thenReturn(true);

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Review for this order item already exists"));
    }

    @Test
    void testUpdateReview_ReviewNotFound() throws Exception {
        UpdateReviewDto updateDto = new UpdateReviewDto();
        updateDto.setRating(4);
        updateDto.setComment("Updated comment");

        when(reviewRepo.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/reviews/update/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Review not found"));
    }

    @Test
    void testGetReviewById_NotFound() throws Exception {
        when(reviewRepo.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/reviews/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteReview_NotFound() throws Exception {
        when(reviewRepo.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/reviews/delete/999"))
                .andExpect(status().isNotFound());
    }

    // Test 6: Permission tests
    @Test
    void testCreateReview_WrongBuyerPermission() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Great product!");
        createDto.setBuyerId("BUY0002");
        createDto.setOrderItemId(1L);

        when(userRepo.findById("BUY0002")).thenReturn(Optional.of(otherBuyer));
        when(orderItemRepo.findById(1L)).thenReturn(Optional.of(orderItem));
        when(reviewRepo.existsByOrderItemId(1L)).thenReturn(false);

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("This order item does not belong to the specified buyer"));

        verify(reviewRepo, never()).save(any(Review.class));
    }

    @Test
    void testCreateReview_CorrectBuyerPermission() throws Exception {
        CreateReviewDto createDto = new CreateReviewDto();
        createDto.setRating(5);
        createDto.setComment("Great product!");
        createDto.setBuyerId("BUY0001");
        createDto.setOrderItemId(1L);

        when(userRepo.findById("BUY0001")).thenReturn(Optional.of(buyer));
        when(orderItemRepo.findById(1L)).thenReturn(Optional.of(orderItem));
        when(reviewRepo.existsByOrderItemId(1L)).thenReturn(false);
        when(reviewRepo.save(any(Review.class))).thenReturn(review);

        mockMvc.perform(post("/api/reviews/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated());

        verify(reviewRepo).save(any(Review.class));
    }
}