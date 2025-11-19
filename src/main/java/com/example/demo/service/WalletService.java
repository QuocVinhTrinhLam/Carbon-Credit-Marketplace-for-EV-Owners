package com.example.demo.service;

import com.example.demo.dto.WalletBalanceResponse;
import com.example.demo.entity.User;
import com.example.demo.entity.Wallet;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WalletRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public WalletBalanceResponse getWalletDetails(Long userId) {
        Wallet wallet = loadOrCreateWallet(userId);
        return mapToResponse(wallet);
    }

    @Transactional
    public BigDecimal getBalance(Long userId) {
        return loadOrCreateWallet(userId).getBalance();
    }

    @Transactional
    public void credit(Long userId, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Wallet wallet = loadOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        log.info("Wallet credited: user={}, amount={}, description={}", userId, amount, description);
    }

    @Transactional
    public void debit(Long userId, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Wallet wallet = loadOrCreateWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance to complete the transaction");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        log.info("Wallet debited: user={}, amount={}, description={}", userId, amount, description);
    }

    @Transactional
    public void transferCredits(Long fromUserId, Long toUserId, BigDecimal amount) {
        debit(fromUserId, amount, "Transfer to user ID " + toUserId);
        credit(toUserId, amount, "Transfer from user ID " + fromUserId);
    }

    private Wallet loadOrCreateWallet(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        return walletRepository.findByUser_Id(userId)
                .orElseGet(() -> createWalletForUser(user));
    }

    private Wallet createWalletForUser(User user) {
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        Wallet saved = walletRepository.save(wallet);
        user.setWallet(saved);
        log.info("Wallet auto-created for user {}", user.getId());
        return saved;
    }

    private WalletBalanceResponse mapToResponse(Wallet wallet) {
        return new WalletBalanceResponse(
                wallet.getUser().getId(),
                wallet.getId(),
                wallet.getBalance()
        );
    }
}
