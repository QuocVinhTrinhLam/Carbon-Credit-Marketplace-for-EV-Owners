package com.example.demo.repository;

import com.example.demo.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser_Id(Long userId);
    Wallet findByUserId(Long userId);
    
    // Admin queries
    @Query("SELECT SUM(w.balance) FROM Wallet w")
    BigDecimal sumAllBalances();
}
