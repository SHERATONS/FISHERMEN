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

import com.example.backend.dto.CreateReviewDto;
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
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewRepo.findAll();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return reviewRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestBody CreateReviewDto reviewDto) {
        // Find the buyer by their String ID
        Optional<User> buyerOptional = userRepo.findById(reviewDto.getBuyerId());
        if (buyerOptional.isEmpty()) {
            return new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
        }

        // Find the order item by its Long ID
        Optional<OrderItem> orderItemOptional = orderItemRepo.findById(reviewDto.getOrderItemId());
        if (orderItemOptional.isEmpty()) {
            return new ResponseEntity<>("Order item not found", HttpStatus.NOT_FOUND);
        }

        // Check if a review for this order item already exists
        if (reviewRepo.existsByOrderItemId(reviewDto.getOrderItemId())) {
            return new ResponseEntity<>("Review for this order item already exists", HttpStatus.CONFLICT);
        }

        User buyer = buyerOptional.get();
        OrderItem orderItem = orderItemOptional.get();

        // Verify that the buyer who is leaving the review is the one who placed the order
        if (!orderItem.getOrder().getBuyer().getId().equals(buyer.getId())) {
            return new ResponseEntity<>("This order item does not belong to the specified buyer.", HttpStatus.FORBIDDEN);
        }

        Review review = new Review();
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setBuyer(buyer);
        review.setOrderItem(orderItem);

        Review createdReview = reviewRepo.save(review);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody UpdateReviewDto reviewDto) {
        return reviewRepo.findById(id).map(existingReview -> {
            if (reviewDto.getRating() != null) existingReview.setRating(reviewDto.getRating());
            if (reviewDto.getComment() != null) existingReview.setComment(reviewDto.getComment());
            Review updated = reviewRepo.save(existingReview);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
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