package com.example.demo.service;

import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CarbonWalletRepository carbonWalletRepository;
    private final DisputeRepository disputeRepository;

    /**
     * Get comprehensive dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // User Statistics
        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(
                java.time.LocalDateTime.now().minusDays(1)
        );

        stats.put("totalUsers", totalUsers);
        stats.put("newUsersToday", newUsersToday);

        // Listing Statistics
        long totalListings = listingRepository.count();
        long openListings = listingRepository.countByStatus(
                com.example.demo.entity.Listing.ListingStatus.OPEN
        );
        long soldListings = listingRepository.countByStatus(
                com.example.demo.entity.Listing.ListingStatus.SOLD
        );

        stats.put("totalListings", totalListings);
        stats.put("openListings", openListings);
        stats.put("soldListings", soldListings);

        // Transaction Statistics
        long totalTransactions = transactionRepository.count();
        long pendingTransactions = transactionRepository.countByStatus(
                com.example.demo.entity.Transaction.TransactionStatus.PENDING
        );
        long completedTransactions = transactionRepository.countByStatus(
                com.example.demo.entity.Transaction.TransactionStatus.COMPLETED
        );

        stats.put("totalTransactions", totalTransactions);
        stats.put("pendingTransactions", pendingTransactions);
        stats.put("completedTransactions", completedTransactions);

        // Revenue Statistics
        BigDecimal totalRevenue = transactionRepository.sumAmountByStatus(
                com.example.demo.entity.Transaction.TransactionStatus.COMPLETED
        );
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Wallet Statistics
        BigDecimal totalWalletBalance = walletRepository.sumAllBalances();
        BigDecimal totalCarbonBalance = carbonWalletRepository.sumAllBalances();
        
        stats.put("totalMoneyInSystem", totalWalletBalance != null ? totalWalletBalance : BigDecimal.ZERO);
        stats.put("totalCarbonCredits", totalCarbonBalance != null ? totalCarbonBalance : BigDecimal.ZERO);

        // Dispute Statistics
        long totalDisputes = disputeRepository.count();
        long pendingDisputes = disputeRepository.countByStatus(
                com.example.demo.entity.DisputeStatus.PENDING
        );

        stats.put("totalDisputes", totalDisputes);
        stats.put("pendingDisputes", pendingDisputes);

        // Recent Activity
        stats.put("recentTransactions", transactionRepository.findTop10ByOrderByCreatedAtDesc());
        stats.put("recentUsers", userRepository.findTop5ByOrderByCreatedAtDesc());

        log.info("Dashboard stats generated: {} users, {} listings, {} transactions",
                totalUsers, totalListings, totalTransactions);

        return stats;
    }

    /**
     * Get comprehensive report for a date range
     */
    public Map<String, Object> getComprehensiveReport(
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate
    ) {
        Map<String, Object> report = new HashMap<>();

        report.put("period", Map.of(
                "start", startDate,
                "end", endDate
        ));

        // Users in period
        long usersCreated = userRepository.countByCreatedAtBetween(startDate, endDate);
        report.put("newUsers", usersCreated);

        // Transactions in period
        List<com.example.demo.entity.Transaction> transactions = 
                transactionRepository.findByCreatedAtBetween(startDate, endDate);
        
        BigDecimal totalVolume = transactions.stream()
                .map(com.example.demo.entity.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.put("transactionCount", transactions.size());
        report.put("totalVolume", totalVolume);

        // Top sellers
        report.put("topSellers", getTopSellers(startDate, endDate));

        // Top buyers
        report.put("topBuyers", getTopBuyers(startDate, endDate));

        return report;
    }

    private List<Map<String, Object>> getTopSellers(
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate
    ) {
        return transactionRepository.findTopSellersByPeriod(startDate, endDate);
    }

    private List<Map<String, Object>> getTopBuyers(
            java.time.LocalDateTime startDate,
            java.time.LocalDateTime endDate
    ) {
        return transactionRepository.findTopBuyersByPeriod(startDate, endDate);
    }
}

