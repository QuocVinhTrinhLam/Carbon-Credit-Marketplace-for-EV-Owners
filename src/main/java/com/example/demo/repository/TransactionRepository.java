package com.example.demo.repository;

import com.example.demo.entity.Transaction;
import com.example.demo.entity.Transaction.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    
    List<Transaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    
    List<Transaction> findByStatusOrderByCreatedAtDesc(TransactionStatus status);
    
    @Query("SELECT t FROM Transaction t WHERE t.buyer.id = :userId OR t.seller.id = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    List<Transaction> findByListingIdOrderByCreatedAtDesc(Long listingId);
    
    @Query("SELECT t FROM Transaction t WHERE t.listing.id = :listingId AND t.status = :status")
    List<Transaction> findByListingIdAndStatus(@Param("listingId") Long listingId, @Param("status") TransactionStatus status);
    
    // Admin queries
    long countByStatus(TransactionStatus status);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.status = :status")
    java.math.BigDecimal sumAmountByStatus(@Param("status") TransactionStatus status);
    
    List<Transaction> findTop10ByOrderByCreatedAtDesc();
    
    List<Transaction> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    @Query("SELECT new map(t.seller.id as userId, t.seller.email as email, t.seller.fullName as name, SUM(t.amount) as totalSales, COUNT(t) as transactionCount) " +
           "FROM Transaction t WHERE t.createdAt BETWEEN :start AND :end GROUP BY t.seller.id, t.seller.email, t.seller.fullName ORDER BY SUM(t.amount) DESC")
    List<java.util.Map<String, Object>> findTopSellersByPeriod(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
    
    @Query("SELECT new map(t.buyer.id as userId, t.buyer.email as email, t.buyer.fullName as name, SUM(t.amount) as totalPurchases, COUNT(t) as transactionCount) " +
           "FROM Transaction t WHERE t.createdAt BETWEEN :start AND :end GROUP BY t.buyer.id, t.buyer.email, t.buyer.fullName ORDER BY SUM(t.amount) DESC")
    List<java.util.Map<String, Object>> findTopBuyersByPeriod(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
