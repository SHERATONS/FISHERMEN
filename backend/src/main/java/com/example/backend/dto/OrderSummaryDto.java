package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.backend.enums.OrderStatus;

import lombok.Data;

@Data
public class OrderSummaryDto {
    private String id;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal totalPrice;
}