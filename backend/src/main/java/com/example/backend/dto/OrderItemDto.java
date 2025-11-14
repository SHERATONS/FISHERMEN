package com.example.backend.dto;


import java.math.BigDecimal;


import lombok.Data;


@Data
public class OrderItemDto {
   private Long fishListingId;
   private Double quantity;
  
   private String photoUrl;
   private String fishName;
   private BigDecimal priceAtPurchase;

}