package com.example.demo.controller;

import com.example.demo.entity.Transaction;
import com.example.demo.entity.Dispute;
import com.example.demo.entity.DisputeStatus;
import com.example.demo.entity.DisputeResolution;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.DisputeRepository;

import com.example.demo.entity.Transaction;
import com.example.demo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
@Slf4j
public class AdminTransactionController {

    private final TransactionRepository transactionRepository;
    private final DisputeRepository disputeRepository;

    // ✅ Lấy toàn bộ giao dịch
    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        log.info("Admin - Get all transactions");

        List<Transaction> transactions = transactionRepository.findAll();
        if (transactions.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Map.of("message", "No transactions found"));
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Transaction tx : transactions) {
            Map<String, Object> dto = new LinkedHashMap<>();
            dto.put("id", tx.getId());
            dto.put("buyerId", tx.getBuyer() != null ? tx.getBuyer().getId() : null);
            dto.put("sellerId", tx.getSeller() != null ? tx.getSeller().getId() : null);
            dto.put("listingId", tx.getListing() != null ? tx.getListing().getId() : null);
            dto.put("amount", tx.getAmount());
            dto.put("status", tx.getStatus());
            dto.put("createdAt", tx.getCreatedAt());
            data.add(dto);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Fetched all transactions successfully",
                "total", data.size(),
                "data", data
        ));
    }

    // ✅ Lấy giao dịch theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        log.info("Admin - Get transaction by ID: {}", id);
        return transactionRepository.findById(id)
                .map(tx -> Map.of(
                        "id", tx.getId(),
                        "buyerId", tx.getBuyer() != null ? tx.getBuyer().getId() : null,
                        "sellerId", tx.getSeller() != null ? tx.getSeller().getId() : null,
                        "listingId", tx.getListing() != null ? tx.getListing().getId() : null,
                        "amount", tx.getAmount(),
                        "status", tx.getStatus(),
                        "createdAt", tx.getCreatedAt()
                ))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Transaction not found")));
    }

    // ✅ Hủy giao dịch
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTransaction(@PathVariable Long id) {
        log.info("Admin - Cancel transaction ID: {}", id);
        return transactionRepository.findById(id)
                .map(tx -> {
                    tx.setStatus(Transaction.TransactionStatus.CANCELLED);
                    transactionRepository.save(tx);
                    return ResponseEntity.ok(Map.of(
                            "message", "Transaction cancelled successfully",
                            "transactionId", tx.getId(),
                            "status", tx.getStatus()
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Transaction not found")));
    }

    // ✅ Xác nhận giao dịch
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmTransaction(@PathVariable Long id) {
        log.info("Admin - Confirm transaction ID: {}", id);
        return transactionRepository.findById(id)
                .map(tx -> {
                    tx.setStatus(Transaction.TransactionStatus.CONFIRMED);
                    transactionRepository.save(tx);
                    return ResponseEntity.ok(Map.of(
                            "message", "Transaction confirmed successfully",
                            "transactionId", tx.getId(),
                            "status", tx.getStatus()
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Transaction not found")));
    }

    // ✅ Hoàn tất giao dịch
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeTransaction(@PathVariable Long id) {
        log.info("Admin - Complete transaction ID: {}", id);
        return transactionRepository.findById(id)
                .map(tx -> {
                    tx.setStatus(Transaction.TransactionStatus.COMPLETED);
                    transactionRepository.save(tx);
                    return ResponseEntity.ok(Map.of(
                            "message", "Transaction completed successfully",
                            "transactionId", tx.getId(),
                            "status", tx.getStatus()
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Transaction not found")));
    }

    /**
     * Get disputes for a transaction
     */
    @GetMapping("/{id}/disputes")
    public ResponseEntity<?> getTransactionDisputes(@PathVariable Long id) {
        log.info("Admin - Get disputes for transaction ID: {}", id);
        
        if (!transactionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Transaction not found"));
        }

        List<Dispute> disputes = disputeRepository.findAll().stream()
                .filter(d -> d.getTransaction() != null && d.getTransaction().getId().equals(id))
                .toList();

        return ResponseEntity.ok(Map.of(
                "transactionId", id,
                "disputes", disputes,
                "count", disputes.size()
        ));
    }

    /**
     * Get all pending disputes
     */
    @GetMapping("/disputes/pending")
    public ResponseEntity<?> getPendingDisputes() {
        log.info("Admin - Get all pending disputes");
        List<Dispute> disputes = disputeRepository.findByStatus(DisputeStatus.PENDING);
        return ResponseEntity.ok(Map.of(
                "disputes", disputes,
                "count", disputes.size()
        ));
    }
}
