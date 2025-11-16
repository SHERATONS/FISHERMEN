package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

import com.example.backend.dto.CreateReviewDto;
import com.example.backend.dto.ReviewResponseDto;
import com.example.backend.dto.UpdateReviewDto;
import com.example.backend.model.OrderItem;
import com.example.backend.model.Review;
import com.example.backend.model.User;
import com.example.backend.repository.OrderItemRepo;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/reviews")
public class ReviewController {

    private final com.example.backend.repository.ReviewRepo reviewRepo;
    private final com.example.backend.repository.UserRepo userRepo;
    private final OrderItemRepo orderItemRepo;

    public ReviewController(com.example.backend.repository.ReviewRepo reviewRepo, com.example.backend.repository.UserRepo userRepo, OrderItemRepo orderItemRepo) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.orderItemRepo = orderItemRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<ReviewResponseDto>> getAllReviews() {
        List<Review> reviews = reviewRepo.findAll();
        List<ReviewResponseDto> dtos = reviews.stream()
            .map(r -> new ReviewResponseDto(
                r.getId(),
                r.getRating(),
                r.getComment(),
                r.getBuyer().getId(),
                r.getOrderItem().getId(),
                r.getReviewDate()
            ))
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponseDto> getReviewById(@PathVariable Long id) {
        return reviewRepo.findById(id)
            .map(r -> new ReviewResponseDto(
                r.getId(),
                r.getRating(),
                r.getComment(),
                r.getBuyer().getId(),
                r.getOrderItem().getId(),
                r.getReviewDate()
            ))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestBody CreateReviewDto reviewDto) {
        // Find the buyer by their String ID
        Optional<User> buyerOptional = userRepo.findById(reviewDto.getBuyerId());
        if (buyerOptional.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Buyer not found");
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        // Find the order item by its Long ID
        Optional<OrderItem> orderItemOptional = orderItemRepo.findById(reviewDto.getOrderItemId());
        if (orderItemOptional.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Order item not found");
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        // Check if a review for this order item already exists
        if (reviewRepo.existsByOrderItemId(reviewDto.getOrderItemId())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Review for this order item already exists");
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }

        User buyer = buyerOptional.get();
        OrderItem orderItem = orderItemOptional.get();

        // Verify that the buyer who is leaving the review is the one who placed the order
        if (!orderItem.getOrder().getBuyer().getId().equals(buyer.getId())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "This order item does not belong to the specified buyer");
            return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        }

        Review review = new Review();
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setBuyer(buyer);
        review.setOrderItem(orderItem);
        review.setReviewDate(java.time.LocalDateTime.now());

        Review createdReview = reviewRepo.save(review);
        ReviewResponseDto responseDto = new ReviewResponseDto(
            createdReview.getId(),
            createdReview.getRating(),
            createdReview.getComment(),
            createdReview.getBuyer().getId(),
            createdReview.getOrderItem().getId(),
            createdReview.getReviewDate()
        );
        return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByBuyerId(@PathVariable String buyerId) {
        List<Review> reviews = reviewRepo.findByBuyerId(buyerId);
        List<ReviewResponseDto> dtos = reviews.stream()
            .map(r -> new ReviewResponseDto(
                r.getId(),
                r.getRating(),
                r.getComment(),
                r.getBuyer().getId(),
                r.getOrderItem().getId(),
                r.getReviewDate()
            ))
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody UpdateReviewDto reviewDto) {
        Optional<Review> reviewOptional = reviewRepo.findById(id);
        if (reviewOptional.isEmpty()) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Review not found");
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }

        Review existingReview = reviewOptional.get();
        if (reviewDto.getRating() != null) {
            existingReview.setRating(reviewDto.getRating());
        }
        if (reviewDto.getComment() != null) {
            existingReview.setComment(reviewDto.getComment());
        }
        
        Review updated = reviewRepo.save(existingReview);
        ReviewResponseDto responseDto = new ReviewResponseDto(
            updated.getId(),
            updated.getRating(),
            updated.getComment(),
            updated.getBuyer().getId(),
            updated.getOrderItem().getId(),
            updated.getReviewDate()
        );
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        if (!reviewRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        reviewRepo.deleteById(id);
        return ResponseEntity.ok("Review deleted successfully");
    }
}