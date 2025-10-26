package com.example.backend.controller;

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

import com.example.backend.model.Review;

import jakarta.persistence.criteria.Order;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    
    private final com.example.backend.repository.ReviewRepo reviewRepo;
    private final com.example.backend.repository.UserRepo userRepo;
    private final com.example.backend.repository.OrderRepo orderRepo;

    public ReviewController(com.example.backend.repository.ReviewRepo reviewRepo, com.example.backend.repository.UserRepo userRepo, com.example.backend.repository.OrderRepo orderRepo) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Review>> getAllReviews() {
        List<Review> reviews = reviewRepo.findAll();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        Review review = reviewRepo.findById(id).orElse(null);
        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> reviewData) {
        Long buyerId = ((Number) reviewData.get("buyerId")).longValue();
        Long orderId = ((Number) reviewData.get("orderId")).longValue();

        User buyer = (User) userRepo.findById(buyerId).orElse(null);
        if (buyer == null) {
            return new ResponseEntity<>("Buyer not found", HttpStatus.NOT_FOUND);
        }

        Order order = (Order) orderRepo.findById(orderId).orElse(null);
        if (order == null) {
            return new ResponseEntity<>("Order not found", HttpStatus.NOT_FOUND);
        }

        if (reviewRepo.findById(orderId).isPresent()) {
            return new ResponseEntity<>("Review for this order already exists", HttpStatus.CONFLICT);
        }

        Review review = new Review();
        review.setRating((Integer) reviewData.get("rating"));
        review.setComment((String) reviewData.get("comment"));
        review.setBuyer((com.example.backend.model.User) buyer);
        review.setOrder((com.example.backend.model.Order) order);

        Review createdReview = reviewRepo.save(review);

        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review updatedReview) {
        Review existingReview = reviewRepo.findById(id).orElse(null);
        if (existingReview != null) {
            existingReview.setRating(updatedReview.getRating());
            existingReview.setComment(updatedReview.getComment());
            Review updated = reviewRepo.save(existingReview);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deleteReview(@PathVariable Long id) {
        reviewRepo.findById(id).orElse(null);
        if (reviewRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        reviewRepo.deleteById(id);
        return ResponseEntity.ok("Review deleted successfully");
    }
}
