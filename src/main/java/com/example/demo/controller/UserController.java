package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.AuthRequest;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.UserCreateRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserRepository userRepository;
    private final AuthService authService;
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Getting all users");
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateRequest request) {
    User user = new User();
    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setPassword(request.getPassword());
    userRepository.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
}


    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest req) {
        log.info("Register attempt for email: {}", req.getEmail());

        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(AuthResponse.builder()
                            .message("Email already exists")
                            .build());
        }

        if (req.getFullName() == null || req.getFullName().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .message("Full name is required")
                            .build());
        }

        User saved = authService.register(req.getEmail(), req.getPassword(), req.getFullName());
        
        // Generate JWT token
        String token = authService.generateToken(saved);
        
        List<String> roles = saved.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(AuthResponse.builder()
                        .message("Registered successfully")
                        .userId(saved.getId())
                        .email(saved.getEmail())
                        .fullName(saved.getFullName())
                        .token(token)
                        .roles(roles)
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        log.info("Login attempt for email: {}", req.getEmail());
        return userRepository.findByEmail(req.getEmail())
                .map(user -> {
                    boolean ok = authService.checkPassword(req.getPassword(), user.getPassword());
                    if (ok) {
                        // Generate JWT token
                        String token = authService.generateToken(user);
                        
                        List<String> roles = user.getRoles().stream()
                                .map(role -> role.getName())
                                .collect(java.util.stream.Collectors.toList());
                        
                        return ResponseEntity.ok(AuthResponse.builder()
                                .message("Login successful")
                                .userId(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .token(token)
                                .roles(roles)
                                .build());
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(AuthResponse.builder()
                                        .message("Invalid credentials")
                                        .build());
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.builder()
                                .message("Invalid credentials")
                                .build()));
    }
}

