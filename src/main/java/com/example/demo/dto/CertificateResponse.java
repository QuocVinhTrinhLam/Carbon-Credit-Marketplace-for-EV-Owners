package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CertificateResponse {
    private String id;
    private String projectName;
    private Double quantity;
    private String certification;
    private String issuedDate;
    private String expiresAt;
    private String status;
}
