package com.example.demo.repository;

import com.example.demo.entity.Dispute;
import com.example.demo.entity.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByOpenedByUserId(Long userId);
    boolean existsByTransactionId(Long transactionId);
    
    // Admin queries
    long countByStatus(DisputeStatus status);
    
    List<Dispute> findByStatus(DisputeStatus status);
    
    List<Dispute> findTop10ByOrderByCreatedAtDesc();
}
