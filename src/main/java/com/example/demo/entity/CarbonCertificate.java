package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "carbon_certificate")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ownerId;
    private Double amount;

    private LocalDate issuedDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private CertificateStatus status;

    public enum CertificateStatus {
        VALID,
        EXPIRING_SOON,
        EXPIRED
    }
}
