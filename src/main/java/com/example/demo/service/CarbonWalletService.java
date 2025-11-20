package com.example.demo.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.CarbonWallet;
import com.example.demo.entity.User;
import com.example.demo.repository.CarbonWalletRepository;
import com.example.demo.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarbonWalletService {

    private final CarbonWalletRepository carbonWalletRepository;
    private final UserRepository userRepository;

    @Transactional
    public BigDecimal getBalance(Long ownerId) {
        CarbonWallet cw = carbonWalletRepository.findByOwner_Id(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Carbon wallet not found for user: " + ownerId));
        return cw.getBalance();
    }

    @Transactional
    public void credit(Long ownerId, BigDecimal creditsInTons, String description) {
        if (creditsInTons == null || creditsInTons.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Credits must be greater than zero");
        }

        CarbonWallet cw = carbonWalletRepository.findByOwner_Id(ownerId)
                .orElseGet(() -> createCarbonWalletForUser(ownerId));

        cw.setBalance(cw.getBalance().add(creditsInTons));
        carbonWalletRepository.save(cw);

        log.info("Carbon wallet credited: owner={}, credits(t)= {}, description={}", ownerId, creditsInTons, description);
    }

    private CarbonWallet createCarbonWalletForUser(Long ownerId) {
        User user = userRepository.findById(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + ownerId));

        CarbonWallet cw = new CarbonWallet();
        cw.setOwner(user);
        cw.setBalance(BigDecimal.ZERO);
        CarbonWallet saved = carbonWalletRepository.save(cw);
        log.info("Created carbon wallet for user {}", ownerId);
        return saved;
    }
}
