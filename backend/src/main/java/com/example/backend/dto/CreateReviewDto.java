package com.example.backend.dto;

import lombok.Data;

@Data
public class CreateReviewDto {
    private Integer rating;
    private String comment;
    private String buyerId;
    private Long orderItemId;
}