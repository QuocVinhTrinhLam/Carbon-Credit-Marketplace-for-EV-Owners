package com.example.demo.controller;

import com.example.demo.entity.Wallet;
import com.example.demo.entity.CarbonWallet;
import com.example.demo.entity.WalletTransaction;
import com.example.demo.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/wallets")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Wallet Management", description = "Admin APIs for managing wallets and money flow")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWalletController {

    private final WalletRepository walletRepository;
    private final CarbonWalletRepository carbonWalletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    /**
     * Get all wallets overview
     */
    @GetMapping
    @Operation(summary = "Get all wallets", description = "Get all money and carbon wallets in the system")
    public ResponseEntity<?> getAllWallets() {
        log.info("Admin - Get all wallets");

        List<Wallet> moneyWallets = walletRepository.findAll();
        List<CarbonWallet> carbonWallets = carbonWalletRepository.findAll();

        BigDecimal totalMoney = walletRepository.sumAllBalances();
        BigDecimal totalCarbon = carbonWalletRepository.sumAllBalances();

        Map<String, Object> response = new HashMap<>();
        response.put("totalMoneyInSystem", totalMoney != null ? totalMoney : BigDecimal.ZERO);
        response.put("totalCarbonCredits", totalCarbon != null ? totalCarbon : BigDecimal.ZERO);
        response.put("moneyWalletsCount", moneyWallets.size());
        response.put("carbonWalletsCount", carbonWallets.size());
        
        // Detailed wallet list
        List<Map<String, Object>> walletDetails = moneyWallets.stream().map(w -> {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("userId", w.getUser().getId());
            detail.put("userEmail", w.getUser().getEmail());
            detail.put("userFullName", w.getUser().getFullName());
            detail.put("moneyBalance", w.getBalance());
            
            // Get carbon wallet for same user
            carbonWalletRepository.findByOwner_Id(w.getUser().getId())
                    .ifPresent(cw -> detail.put("carbonBalance", cw.getBalance()));
            
            return detail;
        }).collect(Collectors.toList());

        response.put("wallets", walletDetails);

        return ResponseEntity.ok(response);
    }

    /**
     * Get wallet by user ID
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user wallets", description = "Get both money and carbon wallets for a specific user")
    public ResponseEntity<?> getUserWallets(@PathVariable Long userId) {
        log.info("Admin - Get wallets for user ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        Wallet moneyWallet = walletRepository.findByUserId(userId);
        Optional<CarbonWallet> carbonWallet = carbonWalletRepository.findByOwner_Id(userId);

        Map<String, Object> wallets = new LinkedHashMap<>();
        wallets.put("userId", userId);
        wallets.put("moneyWallet", moneyWallet != null ? Map.of(
                "id", moneyWallet.getId(),
                "balance", moneyWallet.getBalance()
        ) : null);
        wallets.put("carbonWallet", carbonWallet.map(cw -> Map.of(
                "id", cw.getId(),
                "balance", cw.getBalance()
        )).orElse(null));

        return ResponseEntity.ok(wallets);
    }

    /**
     * Get all wallet transactions
     */
    @GetMapping("/transactions")
    @Operation(summary = "Get all wallet transactions", description = "Get all money wallet transactions in the system")
    public ResponseEntity<?> getAllWalletTransactions(
            @RequestParam(required = false, defaultValue = "100") int limit
    ) {
        log.info("Admin - Get all wallet transactions (limit: {})", limit);

        List<WalletTransaction> transactions = walletTransactionRepository.findAll();
        
        // Sort by created date desc and limit
        List<WalletTransaction> limitedTransactions = transactions.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .collect(Collectors.toList());

        // Map to DTO để tránh lazy loading issues
        List<Map<String, Object>> transactionDTOs = limitedTransactions.stream().map(tx -> {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", tx.getId());
            dto.put("type", tx.getType() != null ? tx.getType().toString() : null);
            dto.put("amount", tx.getAmount());
            dto.put("status", tx.getStatus() != null ? tx.getStatus().toString() : null);
            dto.put("paymentMethod", tx.getPaymentMethod());
            dto.put("description", tx.getDescription());
            dto.put("externalRef", tx.getExternalRef());
            dto.put("createdAt", tx.getCreatedAt());
            
            // Load wallet và user info
            if (tx.getWallet() != null) {
                Wallet wallet = tx.getWallet();
                Map<String, Object> walletInfo = new LinkedHashMap<>();
                if (wallet.getUser() != null) {
                    Map<String, Object> userInfo = new LinkedHashMap<>();
                    userInfo.put("id", wallet.getUser().getId());
                    userInfo.put("email", wallet.getUser().getEmail());
                    userInfo.put("fullName", wallet.getUser().getFullName());
                    walletInfo.put("user", userInfo);
                }
                walletInfo.put("id", wallet.getId());
                dto.put("wallet", walletInfo);
            }
            
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "transactions", transactionDTOs,
                "total", transactions.size(),
                "showing", limitedTransactions.size()
        ));
    }

    /**
     * Get wallet transactions by user
     */
    @GetMapping("/user/{userId}/transactions")
    @Operation(summary = "Get user wallet transactions", description = "Get all wallet transactions for a specific user")
    public ResponseEntity<?> getUserWalletTransactions(@PathVariable Long userId) {
        log.info("Admin - Get wallet transactions for user ID: {}", userId);

        Wallet wallet = walletRepository.findByUserId(userId);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Wallet not found for user"));
        }

        List<WalletTransaction> transactions = wallet.getWalletTransactions();

        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "walletId", wallet.getId(),
                "transactions", transactions,
                "count", transactions.size()
        ));
    }

    /**
     * Adjust user wallet balance (admin operation)
     */
    @PostMapping("/user/{userId}/adjust")
    @Operation(summary = "Adjust wallet balance", description = "Manually adjust user's money wallet balance (admin only)")
    public ResponseEntity<?> adjustWalletBalance(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam String reason
    ) {
        log.info("Admin - Adjust wallet for user ID {}: amount={}", userId, amount);

        try {
            Wallet wallet = walletRepository.findByUserId(userId);
            if (wallet == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Wallet not found for user"));
            }

            BigDecimal oldBalance = wallet.getBalance();
            BigDecimal newBalance = oldBalance.add(amount);
            wallet.setBalance(newBalance);
            walletRepository.save(wallet);

            // Create transaction record
            WalletTransaction transaction = new WalletTransaction();
            transaction.setWallet(wallet);
            transaction.setAmount(amount.abs());
            transaction.setType(amount.compareTo(BigDecimal.ZERO) > 0 ? 
                    WalletTransaction.TransactionType.CREDIT : 
                    WalletTransaction.TransactionType.DEBIT);
            transaction.setStatus(WalletTransaction.TransactionStatus.SUCCESS);
            transaction.setDescription("Admin adjustment: " + reason);
            walletTransactionRepository.save(transaction);

            return ResponseEntity.ok(Map.of(
                    "message", "Wallet balance adjusted successfully",
                    "userId", userId,
                    "oldBalance", oldBalance,
                    "adjustment", amount,
                    "newBalance", newBalance,
                    "reason", reason
            ));
        } catch (Exception e) {
            log.error("Error adjusting wallet: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Adjust carbon wallet balance
     */
    @PostMapping("/user/{userId}/adjust-carbon")
    @Operation(summary = "Adjust carbon wallet balance", description = "Manually adjust user's carbon wallet balance (admin only)")
    public ResponseEntity<?> adjustCarbonBalance(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam String reason
    ) {
        log.info("Admin - Adjust carbon wallet for user ID {}: amount={}", userId, amount);

        try {
            CarbonWallet carbonWallet = carbonWalletRepository.findByOwner_Id(userId)
                    .orElseThrow(() -> new RuntimeException("Carbon wallet not found"));

            BigDecimal oldBalance = carbonWallet.getBalance();
            BigDecimal newBalance = oldBalance.add(amount);
            
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Insufficient carbon balance"));
            }

            carbonWallet.setBalance(newBalance);
            carbonWalletRepository.save(carbonWallet);

            return ResponseEntity.ok(Map.of(
                    "message", "Carbon wallet balance adjusted successfully",
                    "userId", userId,
                    "oldBalance", oldBalance,
                    "adjustment", amount,
                    "newBalance", newBalance,
                    "reason", reason
            ));
        } catch (Exception e) {
            log.error("Error adjusting carbon wallet: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}

