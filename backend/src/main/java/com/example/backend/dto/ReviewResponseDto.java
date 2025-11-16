package com.example.backend.dto;

import java.time.LocalDateTime;

public class ReviewResponseDto {
    private Long id;
    private Integer rating;
    private String comment;
    private String buyerId;
    private Long orderItemId;
    private LocalDateTime reviewDate;

    public ReviewResponseDto() {}

    public ReviewResponseDto(Long id, Integer rating, String comment, String buyerId, Long orderItemId, LocalDateTime reviewDate) {
        this.id = id;
        this.rating = rating;
        this.comment = comment;
        this.buyerId = buyerId;
        this.orderItemId = orderItemId;
        this.reviewDate = reviewDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public LocalDateTime getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDateTime reviewDate) { this.reviewDate = reviewDate; }
}