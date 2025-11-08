package com.example.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.example.backend.enums.ListingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fish_listings")
public class FishListing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fish_type", nullable = false)
    private String fishType;

    @Column(nullable = false)
    private Double weightInKg;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "catch_date", nullable = false)
    private LocalDateTime catchDate;

    @Column(nullable = false)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status = ListingStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // A listing is posted by one Fisherman
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fisherman_id", nullable = false)
    private User fisherman;
    
    // A listing can be part of many order items
    @OneToMany(mappedBy = "fishListing")
    private List<OrderItem> orderItems;

}
