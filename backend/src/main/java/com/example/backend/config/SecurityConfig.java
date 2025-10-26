// package com.example.backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// @EnableWebSecurity
// public class SecurityConfig {

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         http
//             // 1. Disable CSRF (Cross-Site Request Forgery)
//             // We disable this because we are creating a stateless API
//             // and will use another method (like JWT) for security later.
//             .csrf(csrf -> csrf.disable())

//             // 2. Configure Authorization Rules
//             .authorizeHttpRequests(auth -> auth
//                 // Allow POST requests to /api/users/register without login
//                 .requestMatchers("/users/register").permitAll()
//                 // Allow POST requests to /api/users/login without login
//                 .requestMatchers("/users/login").permitAll()
//                 .requestMatchers("/users/list").permitAll()
//                 // You can add other public endpoints here
//                 // .requestMatchers("/api/listings").permitAll()

//                 // 3. Require authentication for ALL OTHER requests
//                 .anyRequest().authenticated()
//             );

//         return http.build();
//     }
// }
