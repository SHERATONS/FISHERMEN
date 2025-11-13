package com.example.backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.model.Order;

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
    public static class OrderItemDto {
        private String fishName;
        private BigDecimal priceAtPurchase;
        private Double quantity;
    }

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

        // Map order items
        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            OrderItemDto iDto = new OrderItemDto();
            iDto.setFishName(item.getFishListing().getFishType());
            iDto.setPriceAtPurchase(item.getPriceAtPurchase());
            iDto.setQuantity(item.getQuantity());
            return iDto;
        }).toList();
        dto.setItems(itemDtos);

        // Map buyer
        if (order.getBuyer() != null) {
            BuyerDto buyerDto = new BuyerDto();
            buyerDto.setId(order.getBuyer().getId());
            buyerDto.setUsername(order.getBuyer().getUsername());
            buyerDto.setFirstName(order.getBuyer().getFirstName());
            buyerDto.setLastName(order.getBuyer().getLastName());
            dto.setBuyer(buyerDto);
        }

        return dto;
    }
}


