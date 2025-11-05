package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Order;

@Repository
public interface OrderRepo extends JpaRepository<Order, String>{
    // Find the ID with the highest numeric value, not just the lexicographically highest.
    // This prevents issues when moving from 'ORD999' to 'ORD1000'.
    // We order by the length of the ID first, then by the ID itself descending.
    @Query("SELECT o.id FROM Order o WHERE o.id LIKE 'ORD%' ORDER BY LENGTH(o.id) DESC, o.id DESC LIMIT 1")
    String findMaxId();
}
