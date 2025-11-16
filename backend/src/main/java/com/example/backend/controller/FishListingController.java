package com.example.backend.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
    private final String UPLOAD_DIR = "uploads/fish-images/";

    public FishListingController(FishListingRepo fishListingRepo, UserRepo userRepo) {
        this.fishListingRepo = fishListingRepo;
        this.userRepo = userRepo;

        // Create uploads folder, if haven't
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    private FishListingResponseDto convertToDto(FishListing listing) {
        FishListingResponseDto dto = new FishListingResponseDto();
        dto.setId(listing.getId());
        dto.setFishType(listing.getFishType());
        dto.setWeightInKg(listing.getWeightInKg());
        dto.setPrice(listing.getPrice());
        dto.setPhotoUrl(listing.getPhotoUrl());
        dto.setCatchDate(listing.getCatchDate());
        dto.setLocation(listing.getLocation());
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
        List<FishListingResponseDto> dtoList = fishListings.stream().map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FishListingResponseDto> getFishListingById(@PathVariable Long id) {
        return fishListingRepo.findById(id)
                .map(listing -> ResponseEntity.ok(convertToDto(listing)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createFishListing(
            @RequestParam("fishType") String fishType,
            @RequestParam("weightInKg") Double weightInKg,
            @RequestParam("price") BigDecimal price,
            @RequestParam("catchDate") String catchDate,
            @RequestParam("fishermanId") String fishermanId,
            @RequestParam("location") String location,
            @RequestParam("status") String statusStr,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            // Check Fisherman
            User fisherman = userRepo.findById(fishermanId).orElse(null);
            if (fisherman == null) {
                return new ResponseEntity<>("Fisherman not found", HttpStatus.NOT_FOUND);
            }

            if (fisherman.getRole() != UserRole.FISHERMAN) {
                return new ResponseEntity<>("User is not a Fisherman", HttpStatus.FORBIDDEN);
            }

            // Manage the image file
            String photoUrl = null;
            if (image != null && !image.isEmpty()) {
                String originalFilename = image.getOriginalFilename();
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

                Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Create URL for accessing the image
                photoUrl = "http://localhost:8080/uploads/fish-images/" + uniqueFilename;
            }

            // Convert String to ListingStatus enum
            ListingStatus status;
            try {
                status = ListingStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                return new ResponseEntity<>("Invalid status value: " + statusStr, HttpStatus.BAD_REQUEST);
            }

            // Convert catchDate from ISO String to LocalDateTime
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
            LocalDateTime parsedCatchDate = LocalDateTime.parse(catchDate, formatter);

            // Create FishListing
            FishListing fishListing = new FishListing();
            fishListing.setFishType(fishType);
            fishListing.setWeightInKg(weightInKg);
            fishListing.setPrice(price);
            fishListing.setPhotoUrl(photoUrl);
            fishListing.setCatchDate(parsedCatchDate);
            fishListing.setLocation(location);
            fishListing.setFisherman(fisherman);
            fishListing.setStatus(status);

            FishListing createdFishListing = fishListingRepo.save(fishListing);

            return new ResponseEntity<>(convertToDto(createdFishListing), HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>("Failed to upload image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating fish listing: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FishListingResponseDto> updateFishListing(@PathVariable Long id,
            @RequestBody UpdateFishListingDto listingDto) {
        return fishListingRepo.findById(id).map(existingFishListing -> {
            if (listingDto.getFishType() != null)
                existingFishListing.setFishType(listingDto.getFishType());
            if (listingDto.getWeightInKg() != null)
                existingFishListing.setWeightInKg(listingDto.getWeightInKg());
            if (listingDto.getPrice() != null)
                existingFishListing.setPrice(listingDto.getPrice());
            if (listingDto.getPhotoUrl() != null)
                existingFishListing.setPhotoUrl(listingDto.getPhotoUrl());
            if (listingDto.getCatchDate() != null)
                existingFishListing.setCatchDate(listingDto.getCatchDate());
            if (listingDto.getStatus() != null)
                existingFishListing.setStatus(listingDto.getStatus());

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
