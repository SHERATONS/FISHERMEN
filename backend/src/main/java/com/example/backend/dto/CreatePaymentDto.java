package com.example.backend.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreatePaymentDto {
    private String orderId;
    private BigDecimal amount;
    private String transactionId;
}