package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.model.Review;

public interface ReviewRepo extends JpaRepository<Review, Long> {
    // Check if a review exists for a given order item ID
    boolean existsByOrderItemId(Long orderItemId);
}