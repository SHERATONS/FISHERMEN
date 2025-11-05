package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Data;

@Data
public class UserResponseDto {
    private String id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private UserRole role;
    private String profileInfo;
    private String location;
    private LocalDateTime createdAt;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<FishListingSummaryDto> fishListings;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<OrderSummaryDto> orders;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<ReviewSummaryDto> reviews;
}