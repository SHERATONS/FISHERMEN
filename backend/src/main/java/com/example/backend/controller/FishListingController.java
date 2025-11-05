package com.example.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.CreateFishListingDto;
import com.example.backend.dto.FishListingResponseDto;
import com.example.backend.dto.UpdateFishListingDto;
import com.example.backend.dto.UserSummaryDto;
import com.example.backend.enums.ListingStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.model.FishListing;
import com.example.backend.model.User;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.UserRepo;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/fishListings")
public class FishListingController {
    
    private final UserRepo userRepo;
    private final FishListingRepo fishListingRepo;

    public FishListingController(FishListingRepo fishListingRepo, UserRepo userRepo) {
        this.fishListingRepo = fishListingRepo;
        this.userRepo = userRepo;
    }

    private FishListingResponseDto convertToDto(FishListing listing) {
        FishListingResponseDto dto = new FishListingResponseDto();
        dto.setId(listing.getId());
        dto.setFishType(listing.getFishType());
        dto.setWeightInKg(listing.getWeightInKg());
        dto.setPrice(listing.getPrice());
        dto.setPhotoUrl(listing.getPhotoUrl());
        dto.setCatchDate(listing.getCatchDate());
        dto.setStatus(listing.getStatus());
        dto.setCreatedAt(listing.getCreatedAt());

        UserSummaryDto fishermanDto = new UserSummaryDto();
        fishermanDto.setId(listing.getFisherman().getId());
        fishermanDto.setFirstName(listing.getFisherman().getFirstName());
        fishermanDto.setLastName(listing.getFisherman().getLastName());
        dto.setFisherman(fishermanDto);

        return dto;
    }

    @GetMapping("/list")
    public ResponseEntity<List<FishListingResponseDto>> getAllFishListings() {
        List<FishListing> fishListings = fishListingRepo.findAll();
        List<FishListingResponseDto> dtoList = fishListings.stream().map(this::convertToDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FishListingResponseDto> getFishListingById(@PathVariable Long id) {
        return fishListingRepo.findById(id)
                .map(listing -> ResponseEntity.ok(convertToDto(listing)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFishListing(@RequestBody CreateFishListingDto listingDto) {
        User fisherman = userRepo.findById(listingDto.getFishermanId()).orElse(null);
        if (fisherman == null) {
            return new ResponseEntity<>("Fisherman not found", HttpStatus.NOT_FOUND);
        }
        
        if (fisherman.getRole() != UserRole.FISHERMAN) {
            return new ResponseEntity<>("User is not a Fisherman", HttpStatus.FORBIDDEN);
        }

        FishListing fishListing = new FishListing();
        fishListing.setFishType(listingDto.getFishType());
        fishListing.setWeightInKg(listingDto.getWeightInKg());
        fishListing.setPrice(listingDto.getPrice());
        fishListing.setPhotoUrl(listingDto.getPhotoUrl());
        fishListing.setCatchDate(listingDto.getCatchDate());
        fishListing.setFisherman(fisherman);
        fishListing.setStatus(ListingStatus.AVAILABLE); // Default status for new listings

        FishListing createdFishListing = fishListingRepo.save(fishListing);

        return new ResponseEntity<>(convertToDto(createdFishListing), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FishListingResponseDto> updateFishListing(@PathVariable Long id, @RequestBody UpdateFishListingDto listingDto) {
        return fishListingRepo.findById(id).map(existingFishListing -> {
            if (listingDto.getFishType() != null) existingFishListing.setFishType(listingDto.getFishType());
            if (listingDto.getWeightInKg() != null) existingFishListing.setWeightInKg(listingDto.getWeightInKg());
            if (listingDto.getPrice() != null) existingFishListing.setPrice(listingDto.getPrice());
            if (listingDto.getPhotoUrl() != null) existingFishListing.setPhotoUrl(listingDto.getPhotoUrl());
            if (listingDto.getCatchDate() != null) existingFishListing.setCatchDate(listingDto.getCatchDate());
            if (listingDto.getStatus() != null) existingFishListing.setStatus(listingDto.getStatus());
            
            FishListing updated = fishListingRepo.save(existingFishListing);
            return ResponseEntity.ok(convertToDto(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFishListing(@PathVariable Long id) {
        if (!fishListingRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        fishListingRepo.deleteById(id);
        return ResponseEntity.ok("FishListing deleted successfully");
    }
}
