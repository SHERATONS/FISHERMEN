package com.example.backend.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.model.Order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDto {


   private String id;
   private LocalDateTime orderDate;
   private String status;
   private BigDecimal totalPrice;


   private List<OrderItemDto> items;
   private BuyerDto buyer;
   @Data
   @AllArgsConstructor
   @NoArgsConstructor
   public static class BuyerDto {
       private String id;
       private String username;
       private String firstName;
       private String lastName;
   }


   public static OrderDto from(Order order) {
       OrderDto dto = new OrderDto();
       dto.setId(order.getId());
       dto.setOrderDate(order.getOrderDate());
       dto.setStatus(order.getStatus().name());
       dto.setTotalPrice(order.getTotalPrice());

       // Map Items
       List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
           OrderItemDto iDto = new OrderItemDto();
           iDto.setId(item.getId());
           iDto.setFishListingId(item.getFishListing().getId());
           iDto.setFishName(item.getFishListing().getFishType());
           iDto.setPriceAtPurchase(item.getPriceAtPurchase());
           iDto.setQuantity(item.getQuantity());
           iDto.setPhotoUrl(item.getFishListing().getPhotoUrl());
           
           // Add fishListing details
           OrderItemDto.FishListingDto fishListingDto = new OrderItemDto.FishListingDto();
           fishListingDto.setId(item.getFishListing().getId());
           fishListingDto.setFishType(item.getFishListing().getFishType());
           fishListingDto.setPrice(item.getFishListing().getPrice());
           fishListingDto.setPhotoUrl(item.getFishListing().getPhotoUrl());
           
           // Add fisherman details
           OrderItemDto.FishListingDto.FishermanDto fishermanDto = new OrderItemDto.FishListingDto.FishermanDto();
           fishermanDto.setId(item.getFishListing().getFisherman().getId());
           fishermanDto.setFirstName(item.getFishListing().getFisherman().getFirstName());
           fishermanDto.setLastName(item.getFishListing().getFisherman().getLastName());
           fishListingDto.setFisherman(fishermanDto);
           
           iDto.setFishListing(fishListingDto);
           
           return iDto;
       }).toList();

       dto.setItems(itemDtos);

       // Map Buyer
       if (order.getBuyer() != null) {
           BuyerDto buyerDto = new BuyerDto(
               order.getBuyer().getId(),
               order.getBuyer().getUsername(),
               order.getBuyer().getFirstName(),
               order.getBuyer().getLastName()
           );
           dto.setBuyer(buyerDto);
       }

       return dto;
   }
}
