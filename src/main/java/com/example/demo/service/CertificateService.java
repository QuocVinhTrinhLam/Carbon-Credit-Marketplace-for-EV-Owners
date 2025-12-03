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
            // Only recalculate status for VALID certificates, not PENDING
            if (c.getStatus() == CarbonCertificate.CertificateStatus.VALID) {
                long daysLeft = ChronoUnit.DAYS.between(today, c.getExpiryDate());

                if (daysLeft <= 0) {
                    c.setStatus(CarbonCertificate.CertificateStatus.EXPIRED);
                } else if (daysLeft <= 10) {
                    c.setStatus(CarbonCertificate.CertificateStatus.EXPIRING_SOON);
                }
            }
        }

        return certs;
    }

    // THÊM MỚI — TẠO CERTIFICATE CHO BUYER (from transaction)
    public CarbonCertificate createCertificate(Long ownerId, Double amount, String projectName, String certificationRef, String certificationBody, String serialNumber, String notes) {

        CarbonCertificate cert = CarbonCertificate.builder()
                .ownerId(ownerId)
                .amount(amount)
                .projectName(projectName)
                .certificationRef(certificationRef)
                .certificationBody(certificationBody)
                .serialNumber(serialNumber)
                .notes(notes)
                .issuedDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .status(CarbonCertificate.CertificateStatus.VALID)
                .certificateType(CarbonCertificate.CertificateType.ISSUED)
                .build();

        return certificateRepository.save(cert);
    }

    /**
     * Create a certificate request (PENDING) — used when user requests issuance.
     */
    public CarbonCertificate requestCertificate(Long ownerId, Double amount, String projectName, String certificationRef, String certificationBody, String serialNumber, String notes) {
        CarbonCertificate cert = CarbonCertificate.builder()
                .ownerId(ownerId)
                .amount(amount)
                .projectName(projectName)
                .certificationRef(certificationRef)
                .certificationBody(certificationBody)
                .serialNumber(serialNumber)
                .notes(notes)
                .issuedDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .status(CarbonCertificate.CertificateStatus.PENDING)
                .certificateType(CarbonCertificate.CertificateType.REQUESTED)
                .build();

        return certificateRepository.save(cert);
    }

    /**
     * Get all pending certificate requests
     */
    public List<CarbonCertificate> getPendingRequests() {
        return certificateRepository.findByStatusAndCertificateType(
                CarbonCertificate.CertificateStatus.PENDING,
                CarbonCertificate.CertificateType.REQUESTED
        );
    }

    /**
     * Approve a pending certificate request — change status from PENDING to VALID
     */
    public CarbonCertificate approveCertificateRequest(Long certificateId) {
        CarbonCertificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if (cert.getStatus() != CarbonCertificate.CertificateStatus.PENDING) {
            throw new RuntimeException("Certificate is not in PENDING status");
        }

        cert.setStatus(CarbonCertificate.CertificateStatus.VALID);
        return certificateRepository.save(cert);
    }

    /**
     * Reject a pending certificate request — delete it
     */
    public void rejectCertificateRequest(Long certificateId) {
        CarbonCertificate cert = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        if (cert.getStatus() != CarbonCertificate.CertificateStatus.PENDING) {
            throw new RuntimeException("Certificate is not in PENDING status");
        }

        certificateRepository.deleteById(certificateId);
    }
}
