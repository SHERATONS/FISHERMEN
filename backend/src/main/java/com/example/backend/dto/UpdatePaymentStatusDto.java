package com.example.backend.dto;

import com.example.backend.enums.PaymentStatus;

import lombok.Data;

@Data
public class UpdatePaymentStatusDto {
    private PaymentStatus status;
}