package com.example.demo.controller;

import com.example.demo.dto.CertificateResponse;
import com.example.demo.entity.CarbonCertificate;
import com.example.demo.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                        c.getStatus().name()
                )
        ).toList();

        return ResponseEntity.ok(response);
    }
}
