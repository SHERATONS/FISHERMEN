package com.example.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

import com.example.backend.dto.LoginRequestDto;
import com.example.backend.dto.RegisterUserDto;
import com.example.backend.dto.UpdateUserDto;
import com.example.backend.enums.UserRole;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepo;

@RestController
@CrossOrigin(origins = "http://localhost:3000") // Removed allowCredentials as full Spring Security is not used
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    private synchronized String generateUserId(UserRole role) {
        String prefix = role == UserRole.BUYER ? "BUY" : "FISHER";
        String lastId = userRepo.findMaxIdWithPrefix(prefix);
        int nextSequence = 1;

        if (lastId != null) {
            try {
                int lastSequence = Integer.parseInt(lastId.substring(prefix.length()));
                nextSequence = lastSequence + 1;
            } catch (NumberFormatException | StringIndexOutOfBoundsException e) {
                logger.warn("Failed to parse sequence from lastId: '{}'. Resetting sequence to 1. Error: {}", lastId, e.getMessage());
                // If parsing fails, it means the ID format is unexpected. Start from 1,
                // but rely on the unique constraint to catch actual duplicates.
                nextSequence = 1; 
            }
        }
        return String.format("%s%04d", prefix, nextSequence);
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/register") // Changed from createUser to registerUser for clarity
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserDto registerDto) {
        // Check if username already exists
        if (userRepo.findByUsername(registerDto.getUsername()).isPresent()) {
            return new ResponseEntity<>("Username already exists", HttpStatus.CONFLICT);
        }
        // Check if email already exists
        if (userRepo.findByEmail(registerDto.getEmail()).isPresent()) {
            return new ResponseEntity<>("Email already exists", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        // Save the password in plain text
        user.setPassword(registerDto.getPassword());
        user.setFirstName(registerDto.getFirstName());
        user.setLastName(registerDto.getLastName());
        user.setProfileInfo(registerDto.getProfileInfo());
        user.setLocation(registerDto.getLocation());

        try {
            String roleString = registerDto.getRole();
            UserRole role = UserRole.valueOf(roleString.toUpperCase());
            user.setRole(role);

            // Generate and set the custom ID
            String newId = generateUserId(role);
            user.setId(newId);
        } catch (IllegalArgumentException e) {
            // Catch specific exception for invalid enum value
            logger.error("Invalid role specified during registration: {}", registerDto.getRole());
            return new ResponseEntity<>("Invalid role specified. Must be 'BUYER' or 'FISHERMAN'.", HttpStatus.BAD_REQUEST);
        } catch (Exception e) { // Catch any other unexpected errors during ID generation or role assignment
            logger.error("An unexpected error occurred during user registration: {}", e.getMessage(), e);
            return new ResponseEntity<>("An unexpected error occurred during registration.", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        User createdUser = userRepo.save(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @PostMapping("/login") // Changed to POST and using DTO
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest) {
        // Try to find user by username first
        Optional<User> userOptional = userRepo.findByUsername(loginRequest.getUsername());

        // If not found by username, try by email (assuming username or email can be used for login)
        if (userOptional.isEmpty() && loginRequest.getUsername().contains("@")) {
            userOptional = userRepo.findByEmail(loginRequest.getUsername());
        }

        return userOptional.map(user -> {
            if (loginRequest.getPassword().equals(user.getPassword())) {
                return ResponseEntity.ok(user); // Login successful
            } else {
                return new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED); // Password mismatch
            }
        }).orElse(new ResponseEntity<>("Invalid username or password", HttpStatus.UNAUTHORIZED)); // User not found
    }

    @PutMapping("/{id}") // Use PUT for updating existing resources
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UpdateUserDto updateDto) {
        Optional<User> userOptional = userRepo.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = userOptional.get();
        // Update only the allowed fields from the DTO
        if (updateDto.getFirstName() != null) existingUser.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) existingUser.setLastName(updateDto.getLastName());
        if (updateDto.getProfileInfo() != null) existingUser.setProfileInfo(updateDto.getProfileInfo());
        if (updateDto.getLocation() != null) existingUser.setLocation(updateDto.getLocation());

        User updatedUser = userRepo.save(existingUser);
        logger.info("User with ID {} updated successfully.", id);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}") // Simplified RESTful endpoint
    public ResponseEntity<String> deleteUser(@PathVariable String id) {
        if (!userRepo.existsById(id)) { // More efficient check
            return ResponseEntity.notFound().build();
        }

        userRepo.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
