package com.example.demo.repository;

import com.example.demo.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser_Id(Long userId);

    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Wallet findByUserId(@Param("userId") Long userId);
    
    // Admin queries
    @Query("SELECT SUM(w.balance) FROM Wallet w")
    BigDecimal sumAllBalances();
}
