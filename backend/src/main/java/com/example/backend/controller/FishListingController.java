package com.example.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.enums.ListingStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.model.FishListing;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.UserRepo;

@RestController
@RequestMapping("/fishListings")
public class FishListingController {
    
    private final FishListingRepo fishListingRepo;
    private final UserRepo userRepo;

    public FishListingController(FishListingRepo fishListingRepo, UserRepo userRepo) {
        this.fishListingRepo = fishListingRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<FishListing>> getAllFishListings() {
        List<FishListing> fishListings = fishListingRepo.findAll();
        return ResponseEntity.ok(fishListings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FishListing> getFishListingById(@PathVariable Long id) {
        FishListing fishListing = fishListingRepo.findById(id).orElse(null);
        if (fishListing != null) {
            return ResponseEntity.ok(fishListing);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFishListing(@RequestBody Map<String, Object> fishListingData) {
        Long fishermanId = ((Number) fishListingData.get("fishermanId")).longValue();

        User fisherman = (User) userRepo.findById(fishermanId).orElse(null);
        if (fisherman == null) {
            return new ResponseEntity<>("Fisherman not found", HttpStatus.NOT_FOUND);
        }
        
        if (((com.example.backend.model.User) fisherman).getRole() != UserRole.FISHERMAN) {
            return new ResponseEntity<>("User is not a Fisherman", HttpStatus.FORBIDDEN);
        }

        FishListing fishListing = new FishListing();
        fishListing.setFishType((String) fishListingData.get("fishType"));
        fishListing.setWeightInKg(((Number) fishListingData.get("weightInKg")).doubleValue());
        fishListing.setPrice(BigDecimal.valueOf(((Number) fishListingData.get("price")).doubleValue()));
        fishListing.setPhotoUrl((String) fishListingData.get("photoUrl"));
        fishListing.setCatchDate(LocalDateTime.parse((String) fishListingData.get("catchDate")));
        fishListing.setFisherman((com.example.backend.model.User) fisherman);

        try {
            String statusString = (String) fishListingData.get("status");
            if (statusString != null) {
                fishListing.setStatus(ListingStatus.valueOf(statusString.toUpperCase()));
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid status specified", HttpStatus.BAD_REQUEST);
        }

        FishListing createdFishListing = fishListingRepo.save(fishListing);

        return new ResponseEntity<>(createdFishListing, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FishListing> updateFishListing(@PathVariable Long id, @RequestBody FishListing updatedFishListing) {
        FishListing existingFishListing = fishListingRepo.findById(id).orElse(null);
        if (existingFishListing != null) {
            existingFishListing.setFishType(updatedFishListing.getFishType());
            existingFishListing.setWeightInKg(updatedFishListing.getWeightInKg());
            existingFishListing.setPrice(updatedFishListing.getPrice());
            existingFishListing.setPhotoUrl(updatedFishListing.getPhotoUrl());
            existingFishListing.setCatchDate(updatedFishListing.getCatchDate());
            existingFishListing.setStatus(updatedFishListing.getStatus());
            FishListing updated = fishListingRepo.save(existingFishListing);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deleteFishListing(@PathVariable Long id) {
        fishListingRepo.findById(id).orElse(null);
        if (fishListingRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        fishListingRepo.deleteById(id);
        return ResponseEntity.ok("FishListing deleted successfully");
    }
}
