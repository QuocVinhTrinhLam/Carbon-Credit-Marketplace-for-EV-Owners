package com.example.demo.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    // estimated CO2 in kilograms
    private BigDecimal estimatedCo2Kg;
    // credits issued (in tons)
    private BigDecimal creditsIssued;
    private String message;
    // extracted text preview from uploaded file
    private String extractedText;
}
