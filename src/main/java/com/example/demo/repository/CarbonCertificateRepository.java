package com.example.demo.repository;

import com.example.demo.entity.CarbonCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarbonCertificateRepository extends JpaRepository<CarbonCertificate, Long> {
    List<CarbonCertificate> findByOwnerId(Long ownerId);
    
    List<CarbonCertificate> findByStatusAndCertificateType(
            CarbonCertificate.CertificateStatus status,
            CarbonCertificate.CertificateType certificateType
    );
}
