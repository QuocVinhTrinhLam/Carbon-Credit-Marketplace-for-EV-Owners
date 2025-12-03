package com.example.demo.controller;

import com.example.demo.entity.CarbonCertificate;
import com.example.demo.service.CertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/certificates")
@RequiredArgsConstructor
@Slf4j
public class AdminCertificateController {

    private final CertificateService certificateService;

    @PostMapping("/{ownerId}/issue")
    public ResponseEntity<?> issueCertificate(@PathVariable Long ownerId, @RequestBody Map<String, Object> payload) {
        try {
            Double amount = payload.get("amount") == null ? null : Double.valueOf(String.valueOf(payload.get("amount")));
            String projectName = payload.get("projectName") == null ? null : String.valueOf(payload.get("projectName"));
            String certificationRef = payload.get("certificationRef") == null ? null : String.valueOf(payload.get("certificationRef"));
            String certificationBody = payload.get("certificationBody") == null ? null : String.valueOf(payload.get("certificationBody"));
            String serialNumber = payload.get("serialNumber") == null ? null : String.valueOf(payload.get("serialNumber"));
            String notes = payload.get("notes") == null ? null : String.valueOf(payload.get("notes"));

            if (amount == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "amount is required"));
            }

            CarbonCertificate cert = certificateService.createCertificate(ownerId, amount, projectName, certificationRef, certificationBody, serialNumber, notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Certificate issued", "certificate", cert));
        } catch (Exception e) {
            log.error("Failed to issue certificate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to issue certificate"));
        }
    }

    /**
     * Get all pending certificate requests for CVA to review
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests() {
        try {
            List<CarbonCertificate> pendingCerts = certificateService.getPendingRequests();
            return ResponseEntity.ok(pendingCerts);
        } catch (Exception e) {
            log.error("Failed to fetch pending certificates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch pending certificates"));
        }
    }

    /**
     * Approve a pending certificate request
     */
    @PostMapping("/{certificateId}/approve")
    public ResponseEntity<?> approveCertificate(@PathVariable Long certificateId) {
        try {
            CarbonCertificate cert = certificateService.approveCertificateRequest(certificateId);
            return ResponseEntity.ok(Map.of("message", "Certificate approved", "certificate", cert));
        } catch (RuntimeException e) {
            log.error("Failed to approve certificate", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to approve certificate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to approve certificate"));
        }
    }

    /**
     * Reject a pending certificate request
     */
    @PostMapping("/{certificateId}/reject")
    public ResponseEntity<?> rejectCertificate(@PathVariable Long certificateId) {
        try {
            certificateService.rejectCertificateRequest(certificateId);
            return ResponseEntity.ok(Map.of("message", "Certificate request rejected"));
        } catch (RuntimeException e) {
            log.error("Failed to reject certificate", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to reject certificate", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to reject certificate"));
        }
    }
}
