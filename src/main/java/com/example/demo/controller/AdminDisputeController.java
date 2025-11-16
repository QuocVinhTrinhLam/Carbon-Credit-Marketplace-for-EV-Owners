package com.example.demo.controller;

import com.example.demo.entity.Dispute;
import com.example.demo.entity.DisputeResolution;
import com.example.demo.entity.DisputeStatus;
import com.example.demo.repository.DisputeRepository;
import com.example.demo.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/disputes")
@RequiredArgsConstructor
@Slf4j
public class AdminDisputeController {

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Get all disputes
     */
    @GetMapping
    public ResponseEntity<?> getAllDisputes() {
        log.info("Admin - Get all disputes");
        var disputes = disputeRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "disputes", disputes,
                "total", disputes.size()
        ));
    }

    /**
     * Get disputes by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getDisputesByStatus(@PathVariable DisputeStatus status) {
        log.info("Admin - Get disputes by status: {}", status);
        var disputes = disputeRepository.findByStatus(status);
        return ResponseEntity.ok(Map.of(
                "disputes", disputes,
                "total", disputes.size(),
                "status", status
        ));
    }

    // mở tranh chấp
    @PostMapping("/{txId}/open")
    public ResponseEntity<?> openDispute(@PathVariable Long txId,
                                         @RequestParam String reason,
                                         @RequestParam(required = false) String evidenceUrl,
                                         @RequestParam Long userId) {
        return transactionRepository.findById(txId)
                .<ResponseEntity<?>>map(tx -> {
                    Dispute d = new Dispute();
                    d.setTransaction(tx);
                    d.setReason(reason);
                    d.setEvidenceUrl(evidenceUrl);
                    d.setOpenedByUserId(userId);
                    return ResponseEntity.status(HttpStatus.CREATED).body(disputeRepository.save(d));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found"));
    }

    // resolve tranh chấp
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolve(@PathVariable Long id,
                                     @RequestParam String resolution,
                                     @RequestParam(required = false) String note) {
        try {
            DisputeResolution res = DisputeResolution.valueOf(resolution);
            return disputeRepository.findById(id)
                    .<ResponseEntity<?>>map(d -> {
                        d.setResolution(res);
                        d.setStatus(DisputeStatus.RESOLVED);
                        d.setResolvedAt(LocalDateTime.now());
                        d.setAdminNote(note);
                        return ResponseEntity.ok(disputeRepository.save(d));
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dispute not found"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid resolution type");
        }
    }

    // reject tranh chấp
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id,
                                    @RequestParam(required = false) String note) {
        return disputeRepository.findById(id)
                .<ResponseEntity<?>>map(d -> {
                    d.setStatus(DisputeStatus.REJECTED);
                    d.setAdminNote(note);
                    d.setResolvedAt(LocalDateTime.now());
                    return ResponseEntity.ok(disputeRepository.save(d));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Dispute not found"));
    }
}
