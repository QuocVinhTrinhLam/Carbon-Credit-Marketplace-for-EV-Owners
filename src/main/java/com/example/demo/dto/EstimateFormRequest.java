package com.example.demo.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class EstimateFormRequest {
    private Long userId;
    private String vehicleId;
    private String tripDate;
    private BigDecimal distanceKm;
    private BigDecimal energyKwh;
    private BigDecimal liters;
    private BigDecimal explicitCo2Kg;
    private String notes;
}
