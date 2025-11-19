package com.example.demo.controller;

import com.example.demo.dto.WalletBalanceResponse;
import com.example.demo.service.WalletService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/mine")
    public ResponseEntity<?> getMyWallet(@RequestParam Long userId) {
        return buildWalletResponse(userId);
    }

    @GetMapping("/{userId}/balance")
    public ResponseEntity<?> getBalance(@PathVariable Long userId) {
        return buildWalletResponse(userId);
    }

    @PostMapping("/{userId}/credit")
    public ResponseEntity<?> credit(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false, defaultValue = "Funds added") String description
    ) {
        try {
            log.info("Credit request for user ID {}: amount={}", userId, amount);
            walletService.credit(userId, amount, description);
            WalletBalanceResponse response = walletService.getWalletDetails(userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return buildError(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (EntityNotFoundException e) {
            return buildError(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while crediting wallet for user {}", userId, e);
            return buildServerError();
        }
    }

    @PostMapping("/{userId}/debit")
    public ResponseEntity<?> debit(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false, defaultValue = "Funds deducted") String description
    ) {
        try {
            log.info("Debit request for user ID {}: amount={}", userId, amount);
            walletService.debit(userId, amount, description);
            WalletBalanceResponse response = walletService.getWalletDetails(userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return buildError(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (IllegalStateException e) {
            return buildError(HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage());
        } catch (EntityNotFoundException e) {
            return buildError(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error while debiting wallet for user {}", userId, e);
            return buildServerError();
        }
    }

    private ResponseEntity<?> buildWalletResponse(Long userId) {
        try {
            WalletBalanceResponse response = walletService.getWalletDetails(userId);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return buildError(HttpStatus.NOT_FOUND, e.getMessage());
        } catch (Exception e) {
            log.error("Failed to load wallet for user {}", userId, e);
            return buildServerError();
        }
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message
        ));
    }

    private ResponseEntity<Map<String, Object>> buildServerError() {
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred. Please try again later.");
    }
}
