package com.example.demo.controller;

import com.example.demo.entity.Wallet;
import com.example.demo.entity.WalletTransaction;
import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.WalletTransactionRepository;
import com.example.demo.service.AdminNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/wallet-transactions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Wallet Transactions", description = "Admin wallet transaction management")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWalletTransactionController {

    private final WalletTransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final AdminNotificationService notificationService;

    /**
     * Approve a PENDING transaction (manually process it)
     */
    @PostMapping("/{transactionId}/approve")
    @Operation(summary = "Approve pending transaction")
    @Transactional
    public ResponseEntity<Map<String, Object>> approveTransaction(@PathVariable Long transactionId) {
        log.info("Admin approving transaction: {}", transactionId);
        
        WalletTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        // Check if already processed
        if (transaction.getStatus() != WalletTransaction.TransactionStatus.PENDING) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Transaction already processed with status: " + transaction.getStatus()
            ));
        }

        // Update transaction status
        transaction.setStatus(WalletTransaction.TransactionStatus.SUCCESS);
        transaction.setDescription(transaction.getDescription() + " - Approved by admin");
        transactionRepository.save(transaction);

        // Add money to wallet
        Wallet wallet = transaction.getWallet();
        BigDecimal oldBalance = wallet.getBalance();
        wallet.setBalance(oldBalance.add(transaction.getAmount()));
        walletRepository.save(wallet);

        log.info("✅ Admin approved transaction {}: amount {} VND. Wallet balance: {} -> {}", 
                transactionId, transaction.getAmount(), oldBalance, wallet.getBalance());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transaction approved successfully");
        response.put("transactionId", transactionId);
        response.put("amount", transaction.getAmount());
        response.put("oldBalance", oldBalance);
        response.put("newBalance", wallet.getBalance());

        return ResponseEntity.ok(response);
    }

    /**
     * Reject a PENDING transaction
     */
    @PostMapping("/{transactionId}/reject")
    @Operation(summary = "Reject pending transaction")
    @Transactional
    public ResponseEntity<Map<String, Object>> rejectTransaction(
            @PathVariable Long transactionId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        
        log.info("Admin rejecting transaction: {}", transactionId);
        
        WalletTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));

        // Check if already processed
        if (transaction.getStatus() != WalletTransaction.TransactionStatus.PENDING) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Transaction already processed with status: " + transaction.getStatus()
            ));
        }

        String reason = requestBody != null ? requestBody.getOrDefault("reason", "Rejected by admin") : "Rejected by admin";

        // Update transaction status
        transaction.setStatus(WalletTransaction.TransactionStatus.FAILED);
        transaction.setDescription(transaction.getDescription() + " - " + reason);
        transactionRepository.save(transaction);

        log.info("❌ Admin rejected transaction {}: {}", transactionId, reason);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Transaction rejected");
        response.put("transactionId", transactionId);
        response.put("reason", reason);

        return ResponseEntity.ok(response);
    }

    /**
     * Get transaction details
     */
    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction details")
    public ResponseEntity<WalletTransaction> getTransaction(@PathVariable Long transactionId) {
        WalletTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + transactionId));
        
        return ResponseEntity.ok(transaction);
    }
}

