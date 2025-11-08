package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CreateFishListingDto {
    private String fishType;
    private Double weightInKg;
    private BigDecimal price;
    private String photoUrl;
    private LocalDateTime catchDate;
    private String fishermanId;
    private String location;
}