package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.OrderItem;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {
    
    
}
