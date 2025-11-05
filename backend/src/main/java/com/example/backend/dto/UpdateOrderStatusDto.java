package com.example.backend.dto;

import com.example.backend.enums.OrderStatus;

import lombok.Data;

@Data
public class UpdateOrderStatusDto {
    private OrderStatus status;
}