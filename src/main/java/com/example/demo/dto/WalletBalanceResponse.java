package com.example.demo.dto;

import java.math.BigDecimal;

/**
 * Standard response payload for wallet-related endpoints.
 */
public record WalletBalanceResponse(Long userId, Long walletId, BigDecimal balance) {
}
