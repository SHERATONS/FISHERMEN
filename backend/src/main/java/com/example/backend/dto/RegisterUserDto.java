package com.example.backend.dto;

import lombok.Data;

// Using a DTO is a best practice for handling request bodies.
// It provides type safety and clear API contracts.
@Data
public class RegisterUserDto {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role; // "BUYER" or "FISHERMAN"
    private String profileInfo;
    private String location;
}
