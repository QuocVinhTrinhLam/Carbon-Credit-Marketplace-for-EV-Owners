package com.example.demo.service;

import com.example.demo.entity.CarbonCertificate;
import com.example.demo.repository.CarbonCertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CarbonCertificateRepository certificateRepository;

    public List<CarbonCertificate> getByOwner(Long ownerId) {

        List<CarbonCertificate> certs = certificateRepository.findByOwnerId(ownerId);
        LocalDate today = LocalDate.now();

        for (CarbonCertificate c : certs) {
            long daysLeft = ChronoUnit.DAYS.between(today, c.getExpiryDate());

            if (daysLeft <= 0) {
                c.setStatus(CarbonCertificate.CertificateStatus.EXPIRED);
            } else if (daysLeft <= 10) {
                c.setStatus(CarbonCertificate.CertificateStatus.EXPIRING_SOON);
            } else {
                c.setStatus(CarbonCertificate.CertificateStatus.VALID);
            }
        }

        return certs;
    }

    // THÊM MỚI — TẠO CERTIFICATE CHO BUYER
    public CarbonCertificate createCertificate(Long ownerId, Double amount) {

        CarbonCertificate cert = CarbonCertificate.builder()
                .ownerId(ownerId)
                .amount(amount)
                .issuedDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .status(CarbonCertificate.CertificateStatus.VALID)
                .build();

        return certificateRepository.save(cert);
    }
}
