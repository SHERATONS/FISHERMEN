package com.example.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.dto.UpdateFishListingDto;
import com.example.backend.enums.ListingStatus;
import com.example.backend.enums.UserRole;
import com.example.backend.model.FishListing;
import com.example.backend.model.User;
import com.example.backend.repository.FishListingRepo;
import com.example.backend.repository.UserRepo;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(FishListingController.class)
class FishListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FishListingRepo fishListingRepo;

    @MockBean
    private UserRepo userRepo;

    @Autowired
    private ObjectMapper objectMapper;

    private User fisherman;
    private User buyer;
    private FishListing fishListing;

    @BeforeEach
    void setUp() {
        fisherman = new User();
        fisherman.setId("FISH001");
        fisherman.setFirstName("John");
        fisherman.setLastName("Fisher");
        fisherman.setUsername("john_fisher");
        fisherman.setEmail("john@fisher.com");
        fisherman.setRole(UserRole.FISHERMAN);

        buyer = new User();
        buyer.setId("BUY001");
        buyer.setFirstName("Jane");
        buyer.setLastName("Buyer");
        buyer.setUsername("jane_buyer");
        buyer.setEmail("jane@buyer.com");
        buyer.setRole(UserRole.BUYER);

        fishListing = new FishListing();
        fishListing.setId(1L);
        fishListing.setFishType("Salmon");
        fishListing.setWeightInKg(1.0);
        fishListing.setPrice(new BigDecimal("1500.00"));
        fishListing.setPhotoUrl("http://localhost:8080/uploads/fish-images/test.jpg");
        fishListing.setCatchDate(LocalDateTime.of(2025, 11, 24, 10, 10));
        fishListing.setLocation("Salaya");
        fishListing.setStatus(ListingStatus.AVAILABLE);
        fishListing.setFisherman(fisherman);
        fishListing.setCreatedAt(LocalDateTime.now());
    }

    // =================================================================================================
    // Feature 1: Create Fish Listing (MBCC)
    // Characteristics: Fisherman ID, Role, Image, Status, Data Validity
    // =================================================================================================

    // MBCC Base Choice 1: Valid Fisherman, Valid Role, With Image, AVAILABLE Status, Valid Data
    @Test
    void testCreateFishListing_BaseChoice_WithImage() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "fish.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(userRepo.findById("FISH001")).thenReturn(Optional.of(fisherman));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(fishListing);

        mockMvc.perform(multipart("/api/fishListings/create")
                .file(image)
                .param("fishType", "Salmon")
                .param("weightInKg", "1.0")
                .param("price", "1500.00")
                .param("catchDate", "2025-11-24T10:10:00")
                .param("fishermanId", "FISH001")
                .param("location", "Salaya")
                .param("status", "AVAILABLE"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fishType").value("Salmon"))
                .andExpect(jsonPath("$.weightInKg").value(1.0))
                .andExpect(jsonPath("$.price").value(1500.00));

        verify(fishListingRepo).save(any(FishListing.class));
    }

    // MBCC Base Choice 2: Valid Fisherman, Valid Role, Without Image, AVAILABLE Status, Valid Data
    @Test
    void testCreateFishListing_BaseChoice_WithoutImage() throws Exception {
        FishListing listingWithoutImage = new FishListing();
        listingWithoutImage.setId(2L);
        listingWithoutImage.setFishType("Tuna");
        listingWithoutImage.setWeightInKg(1.0);
        listingWithoutImage.setPrice(new BigDecimal("1300.00"));
        listingWithoutImage.setPhotoUrl(null);
        listingWithoutImage.setCatchDate(LocalDateTime.of(2025, 11, 20, 10, 0));
        listingWithoutImage.setLocation("Bangkok");
        listingWithoutImage.setStatus(ListingStatus.AVAILABLE);
        listingWithoutImage.setFisherman(fisherman);
        listingWithoutImage.setCreatedAt(LocalDateTime.now());

        when(userRepo.findById("FISH001")).thenReturn(Optional.of(fisherman));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(listingWithoutImage);

        mockMvc.perform(multipart("/api/fishListings/create")
                .param("fishType", "Tuna")
                .param("weightInKg", "1.0")
                .param("price", "1300.00")
                .param("catchDate", "2025-11-20T10:00:00")
                .param("fishermanId", "FISH001")
                .param("location", "Bangkok")
                .param("status", "AVAILABLE"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fishType").value("Tuna"));

        verify(fishListingRepo).save(any(FishListing.class));
    }

    // MBCC Base Choice 3: Valid Fisherman, Valid Role, With Image, SOLD Status, Valid Data
    @Test
    void testCreateFishListing_BaseChoice_SoldStatus() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "fish.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        FishListing soldListing = new FishListing();
        soldListing.setId(3L);
        soldListing.setFishType("Salmon");
        soldListing.setWeightInKg(1.0);
        soldListing.setPrice(new BigDecimal("1500.00"));
        soldListing.setPhotoUrl("http://localhost:8080/uploads/fish-images/test.jpg");
        soldListing.setCatchDate(LocalDateTime.of(2025, 11, 24, 10, 10));
        soldListing.setLocation("Salaya");
        soldListing.setStatus(ListingStatus.SOLD);
        soldListing.setFisherman(fisherman);
        soldListing.setCreatedAt(LocalDateTime.now());

        when(userRepo.findById("FISH001")).thenReturn(Optional.of(fisherman));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(soldListing);

        mockMvc.perform(multipart("/api/fishListings/create")
                .file(image)
                .param("fishType", "Salmon")
                .param("weightInKg", "1.0")
                .param("price", "1500.00")
                .param("catchDate", "2025-11-24T10:10:00")
                .param("fishermanId", "FISH001")
                .param("location", "Salaya")
                .param("status", "SOLD"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SOLD"));
    }

    // MBCC Variation 1: Invalid Fisherman ID
    @Test
    void testCreateFishListing_Variation_InvalidFishermanId() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "fish.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(userRepo.findById("INVALID")).thenReturn(Optional.empty());

        mockMvc.perform(multipart("/api/fishListings/create")
                .file(image)
                .param("fishType", "Salmon")
                .param("weightInKg", "1.0")
                .param("price", "1500.00")
                .param("catchDate", "2025-11-24T10:10:00")
                .param("fishermanId", "INVALID")
                .param("location", "Salaya")
                .param("status", "AVAILABLE"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Fisherman not found"));
    }

    // MBCC Variation 2: User is not a Fisherman (Wrong Role)
    @Test
    void testCreateFishListing_Variation_NotFishermanRole() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "fish.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(userRepo.findById("BUY001")).thenReturn(Optional.of(buyer));

        mockMvc.perform(multipart("/api/fishListings/create")
                .file(image)
                .param("fishType", "Salmon")
                .param("weightInKg", "1.0")
                .param("price", "150.00")
                .param("catchDate", "2025-11-24T10:10:00")
                .param("fishermanId", "BUY001")
                .param("location", "Salaya")
                .param("status", "AVAILABLE"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("User is not a Fisherman"));
    }

    // MBCC Variation 3: Invalid Status Value
    @Test
    void testCreateFishListing_Variation_InvalidStatus() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "fish.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(userRepo.findById("FISH001")).thenReturn(Optional.of(fisherman));

        mockMvc.perform(multipart("/api/fishListings/create")
                .file(image)
                .param("fishType", "Salmon")
                .param("weightInKg", "1.0")
                .param("price", "1500.00")
                .param("catchDate", "2025-11-24T10:10:00")
                .param("fishermanId", "FISH001")
                .param("location", "Salaya")
                .param("status", "INVALID_STATUS"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid status value: INVALID_STATUS"));
    }

    // =================================================================================================
    // Feature 2: Update Fish Listing (MBCC)
    // Characteristics: Listing ID, Update Payload
    // =================================================================================================

    // MBCC Base Choice 1: Valid ID, Full Update
    @Test
    void testUpdateFishListing_BaseChoice_FullUpdate() throws Exception {
        UpdateFishListingDto updateDto = new UpdateFishListingDto();
        updateDto.setFishType("Updated Salmon");
        updateDto.setWeightInKg(2.0);
        updateDto.setPrice(new BigDecimal("3000.00"));
        updateDto.setPhotoUrl("http://localhost:8080/uploads/fish-images/updated.jpg");
        updateDto.setCatchDate(LocalDateTime.of(2025, 11, 25, 10, 10));
        updateDto.setStatus(ListingStatus.SOLD);

        FishListing updatedListing = new FishListing();
        updatedListing.setId(1L);
        updatedListing.setFishType("Updated Salmon");
        updatedListing.setWeightInKg(2.0);
        updatedListing.setPrice(new BigDecimal("3000.00"));
        updatedListing.setPhotoUrl("http://localhost:8080/uploads/fish-images/updated.jpg");
        updatedListing.setCatchDate(LocalDateTime.of(2025, 11, 25, 10, 10));
        updatedListing.setLocation("Salaya");
        updatedListing.setStatus(ListingStatus.SOLD);
        updatedListing.setFisherman(fisherman);

        when(fishListingRepo.findById(1L)).thenReturn(Optional.of(fishListing));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(updatedListing);

        mockMvc.perform(put("/api/fishListings/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fishType").value("Updated Salmon"))
                .andExpect(jsonPath("$.weightInKg").value(2.0))
                .andExpect(jsonPath("$.price").value(3000.00))
                .andExpect(jsonPath("$.status").value("SOLD"));
    }

    // MBCC Base Choice 2: Valid ID, Partial Update (Price Only)
    @Test
    void testUpdateFishListing_BaseChoice_PriceOnly() throws Exception {
        UpdateFishListingDto updateDto = new UpdateFishListingDto();
        updateDto.setPrice(new BigDecimal("180.00"));

        FishListing updatedListing = new FishListing();
        updatedListing.setId(1L);
        updatedListing.setFishType("Salmon");
        updatedListing.setWeightInKg(1.0);
        updatedListing.setPrice(new BigDecimal("1800.00"));
        updatedListing.setPhotoUrl("http://localhost:8080/uploads/fish-images/test.jpg");
        updatedListing.setCatchDate(LocalDateTime.of(2025, 11, 24, 10, 10));
        updatedListing.setLocation("Salaya");
        updatedListing.setStatus(ListingStatus.AVAILABLE);
        updatedListing.setFisherman(fisherman);

        when(fishListingRepo.findById(1L)).thenReturn(Optional.of(fishListing));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(updatedListing);

        mockMvc.perform(put("/api/fishListings/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(1800.00))
                .andExpect(jsonPath("$.fishType").value("Salmon"));
    }

    // MBCC Base Choice 3: Valid ID, Partial Update (Status Only)
    @Test
    void testUpdateFishListing_BaseChoice_StatusOnly() throws Exception {
        UpdateFishListingDto updateDto = new UpdateFishListingDto();
        updateDto.setStatus(ListingStatus.SOLD);

        FishListing updatedListing = new FishListing();
        updatedListing.setId(1L);
        updatedListing.setFishType("Salmon");
        updatedListing.setWeightInKg(1.0);
        updatedListing.setPrice(new BigDecimal("1500.00"));
        updatedListing.setPhotoUrl("http://localhost:8080/uploads/fish-images/test.jpg");
        updatedListing.setCatchDate(LocalDateTime.of(2025, 11, 24, 10, 10));
        updatedListing.setLocation("Salaya");
        updatedListing.setStatus(ListingStatus.SOLD);
        updatedListing.setFisherman(fisherman);

        when(fishListingRepo.findById(1L)).thenReturn(Optional.of(fishListing));
        when(fishListingRepo.save(any(FishListing.class))).thenReturn(updatedListing);

        mockMvc.perform(put("/api/fishListings/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SOLD"))
                .andExpect(jsonPath("$.fishType").value("Salmon"));
    }

    // MBCC Variation 1: Invalid Listing ID
    @Test
    void testUpdateFishListing_Variation_InvalidId() throws Exception {
        UpdateFishListingDto updateDto = new UpdateFishListingDto();
        updateDto.setPrice(new BigDecimal("1800.00"));

        when(fishListingRepo.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/fishListings/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound());
    }

    // =================================================================================================
    // Feature 3: Delete Fish Listing (MBCC)
    // Characteristics: Listing ID
    // =================================================================================================

    // MBCC Base Choice: Valid ID
    @Test
    void testDeleteFishListing_BaseChoice_ValidId() throws Exception {
        when(fishListingRepo.existsById(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/fishListings/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("FishListing deleted successfully"));

        verify(fishListingRepo).deleteById(1L);
    }

    // MBCC Variation: Invalid ID
    @Test
    void testDeleteFishListing_Variation_InvalidId() throws Exception {
        when(fishListingRepo.existsById(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/fishListings/999"))
                .andExpect(status().isNotFound());
    }

    // =================================================================================================
    // Feature 4: Get Fish Listing(s) (MBCC)
    // Characteristics: ID Validity, Query Type
    // =================================================================================================

    // MBCC Base Choice: Valid Listing ID
    @Test
    void testGetFishListingById_BaseChoice_ValidId() throws Exception {
        when(fishListingRepo.findById(1L)).thenReturn(Optional.of(fishListing));

        mockMvc.perform(get("/api/fishListings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.fishType").value("Salmon"))
                .andExpect(jsonPath("$.fisherman.id").value("FISH001"));
    }

    // MBCC Variation: Invalid Listing ID
    @Test
    void testGetFishListingById_Variation_InvalidId() throws Exception {
        when(fishListingRepo.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/fishListings/999"))
                .andExpect(status().isNotFound());
    }

    // MBCC Base Choice: Get All Fish Listings
    @Test
    void testGetAllFishListings_BaseChoice() throws Exception {
        FishListing listing2 = new FishListing();
        listing2.setId(2L);
        listing2.setFishType("Tuna");
        listing2.setWeightInKg(1.0);
        listing2.setPrice(new BigDecimal("1300.00"));
        listing2.setCatchDate(LocalDateTime.of(2025, 11, 25, 10, 0));
        listing2.setLocation("Bangkok");
        listing2.setStatus(ListingStatus.AVAILABLE);
        listing2.setFisherman(fisherman);
        listing2.setCreatedAt(LocalDateTime.now());

        List<FishListing> listings = Arrays.asList(fishListing, listing2);
        when(fishListingRepo.findAll()).thenReturn(listings);

        mockMvc.perform(get("/api/fishListings/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].fishType").value("Salmon"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].fishType").value("Tuna"));
    }

    // MBCC Base Choice: Get All Fish Listings - Empty List
    @Test
    void testGetAllFishListings_BaseChoice_EmptyList() throws Exception {
        when(fishListingRepo.findAll()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/fishListings/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}