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

    private String projectName;
    private String certificationRef;
    private String certificationBody;
    private String serialNumber;
    private String notes;

    private LocalDate issuedDate;
    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private CertificateStatus status;

    @Enumerated(EnumType.STRING)
    private CertificateType certificateType;

    public enum CertificateStatus {
        PENDING,
        VALID,
        EXPIRING_SOON,
        EXPIRED
    }

    public enum CertificateType {
        ISSUED,      // Tự động tạo từ transaction confirm
        REQUESTED    // User yêu cầu cấp phát
    }
}
