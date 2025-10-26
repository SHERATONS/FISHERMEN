package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.enums.UserRole;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepo;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/users")
public class UserController {

    private final UserRepo userRepo;

    public UserController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepo.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userRepo.findById(id).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userData) {
        String username = (String) userData.get("username");
        if (userRepo.findByUsername(username).isPresent()) {
            return new ResponseEntity<>("Username already exists", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail((String) userData.get("email"));
        user.setPassword((String) userData.get("password")); // Still unsafe!
        user.setFirstName((String) userData.get("firstName"));
        user.setLastName((String) userData.get("lastName"));
        user.setProfileInfo((String) userData.get("profileInfo"));
        user.setLocation((String) userData.get("location"));

        try {
            String roleString = (String) userData.get("role");
            user.setRole(UserRole.valueOf(roleString.toUpperCase()));
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid role specified", HttpStatus.BAD_REQUEST);
        }

        User createdUser = userRepo.save(user);

        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    @GetMapping("/login") // Not safe mak mak (will fix soon)
    public ResponseEntity<User> login(@RequestBody Map<String, Object> loginData) {
        String username = (String) loginData.get("username");
        String password = (String) loginData.get("password");

        User user = userRepo.findByUsername(username).orElse(null);
        if (user != null && user.getPassword().equals(password)) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // @PutMapping("update/{id}")
    // public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
    //     User existingUser = userRepo.findById(id).orElse(null);
    //     if (existingUser != null) {
    //         existingUser.setUsername(updatedUser.getUsername());
    //         existingUser.setEmail(updatedUser.getEmail());

    //         User updated = userRepo.save(existingUser);
    //         return ResponseEntity.ok(updated);
    //     } else {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

    @GetMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userRepo.findById(id).orElse(null);
        if (userRepo.findById(id).orElse(null) == null) {
            return ResponseEntity.notFound().build();
        }

        userRepo.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
