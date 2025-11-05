package com.example.backend.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long fishListingId;
    private Double quantity;
}