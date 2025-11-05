package com.example.backend.dto;

import lombok.Data;

@Data
public class UpdateUserDto {
    private String firstName;
    private String lastName;
    private String profileInfo;
    private String location;
}