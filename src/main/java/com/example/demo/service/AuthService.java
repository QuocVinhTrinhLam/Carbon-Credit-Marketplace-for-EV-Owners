package com.example.demo.service;

import com.example.demo.entity.CarbonWallet;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.Wallet;
import com.example.demo.repository.CarbonWalletRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import com.example.demo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CarbonWalletRepository carbonWalletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Đăng ký user mới và tự động tạo Wallet + CarbonWallet
     */
    @Transactional
    public User register(String email, String rawPassword, String fullName) {
        log.info("Registering new user: {}", email);
        
        // 1. Tạo user
        String hashed = passwordEncoder.encode(rawPassword);
        User user = new User();
        user.setId(null);
        user.setEmail(email);
        user.setFullName(fullName);
        user.setPassword(hashed);
        User savedUser = userRepository.save(user);
        
        log.info("User created with ID: {}", savedUser.getId());
        
        // 2. Tự động tạo Wallet (VND) với số dư ban đầu = 0
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(wallet);
        
        log.info("Wallet created for user ID: {}", savedUser.getId());
        
        // 3. Tự động tạo CarbonWallet (Carbon Credits) với số dư ban đầu = 0
        CarbonWallet carbonWallet = new CarbonWallet();
        carbonWallet.setOwner(savedUser);
        carbonWallet.setBalance(BigDecimal.ZERO);
        carbonWalletRepository.save(carbonWallet);
        
        log.info("CarbonWallet created for user ID: {}", savedUser.getId());
        log.info("User registration completed successfully: {}", email);
        
        return savedUser;
    }

    public boolean checkPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }

    /**
     * Generate JWT token for authenticated user
     */
    public String generateToken(User user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        
        return jwtUtil.generateToken(user.getEmail(), user.getId(), roles);
    }
}
