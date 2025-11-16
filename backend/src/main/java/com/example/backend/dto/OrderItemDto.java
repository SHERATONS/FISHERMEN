package com.example.backend.dto;


import java.math.BigDecimal;

import lombok.Data;


@Data
public class OrderItemDto {
   private Long id;
   private Long fishListingId;
   private Double quantity;
   private String photoUrl;
   private String fishName;
   private BigDecimal priceAtPurchase;
   
   // Add fishListing details
   private FishListingDto fishListing;
   
   @Data
   public static class FishListingDto {
       private Long id;
       private String fishType;
       private BigDecimal price;
       private String photoUrl;
       private FishermanDto fisherman;
       
       @Data
       public static class FishermanDto {
           private String id;
           private String firstName;
           private String lastName;
       }
   }
}
