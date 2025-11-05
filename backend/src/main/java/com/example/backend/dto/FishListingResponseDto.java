package com.example.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.backend.enums.ListingStatus;

import lombok.Data;

@Data
public class FishListingResponseDto {
    private Long id;
    private String fishType;
    private Double weightInKg;
    private BigDecimal price;
    private String photoUrl;
    private LocalDateTime catchDate;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private UserSummaryDto fisherman;
}