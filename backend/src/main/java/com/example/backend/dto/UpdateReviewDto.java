package com.example.backend.dto;

import lombok.Data;

@Data
public class UpdateReviewDto {
    private Integer rating;
    private String comment;
}
