package com.example.demo.repository;

import com.example.demo.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWallet_User_IdOrderByCreatedAtDesc(Long userId);
    
    Optional<WalletTransaction> findByExternalRef(String externalRef);
}

