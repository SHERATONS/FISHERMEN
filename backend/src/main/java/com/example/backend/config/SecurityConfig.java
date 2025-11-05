package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity; // Not needed if SecurityFilterChain is commented out
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity; // Not strictly needed if no SecurityFilterChain
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain; // Not needed if SecurityFilterChain is commented out

@Configuration
// @EnableWebSecurity // Only needed if you're configuring HttpSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Commenting out SecurityFilterChain as per request to not use full Spring Security
    // @Bean
    // public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    //     http
    //         .csrf(csrf -> csrf.disable())
    //         .authorizeHttpRequests(auth -> auth
    //             .requestMatchers("/users/register").permitAll()
    //             .requestMatchers("/users/login").permitAll()
    //             .requestMatchers("/users/list").permitAll()
    //             .anyRequest().authenticated()
    //         );
    //     return http.build();
    // }
}
