package com.example.backend.dto;

import java.util.List;
import lombok.Data;

@Data
public class CreateOrderDto {
    private String buyerId;
    private List<OrderItemDto> items;
}