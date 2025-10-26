package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Order;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long>{
    
}
