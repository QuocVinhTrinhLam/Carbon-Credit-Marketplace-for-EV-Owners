package com.example.demo.controller;

import com.example.demo.dto.CertificateResponse;
import com.example.demo.entity.CarbonCertificate;
import com.example.demo.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/certificates")   // <--- ĐÚNG CHUẨN API
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/user/{id}")          // <--- FE & Postman sẽ gọi API này
    public ResponseEntity<List<CertificateResponse>> getUserCertificates(@PathVariable Long id) {

        List<CarbonCertificate> certs = certificateService.getByOwner(id);

        List<CertificateResponse> response = certs.stream().map(c ->
                new CertificateResponse(
                        c.getId().toString(),
                        "Carbon Credit Project",
                        c.getAmount(),
                        "Carbon Certificate",
                        c.getIssuedDate().toString(),
                        c.getExpiryDate().toString(),
                        c.getStatus().name(),
                        c.getCertificateType().name()
                )
        ).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestCertificate(@RequestBody Map<String, Object> payload) {
        try {
            Long ownerId = payload.get("ownerId") == null ? null : Long.valueOf(String.valueOf(payload.get("ownerId")));
            Double amount = payload.get("amount") == null ? null : Double.valueOf(String.valueOf(payload.get("amount")));
            String projectName = payload.get("projectName") == null ? null : String.valueOf(payload.get("projectName"));
            String certificationRef = payload.get("certificationRef") == null ? null : String.valueOf(payload.get("certificationRef"));
            String certificationBody = payload.get("certificationBody") == null ? null : String.valueOf(payload.get("certificationBody"));
            String serialNumber = payload.get("serialNumber") == null ? null : String.valueOf(payload.get("serialNumber"));
            String notes = payload.get("notes") == null ? null : String.valueOf(payload.get("notes"));

            if (ownerId == null || amount == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "ownerId and amount are required"));
            }

            // Create a PENDING certificate request — admin will later issue/approve
            CarbonCertificate cert = certificateService.requestCertificate(ownerId, amount, projectName, certificationRef, certificationBody, serialNumber, notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Certificate request submitted", "certificate", cert));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create certificate"));
        }
    }
}
