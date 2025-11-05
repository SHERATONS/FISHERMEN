package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReviewSummaryDto {
    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime reviewDate;
    private Long orderItemId;
}