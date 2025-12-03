package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal; // Import BigDecimal

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    
    @NotNull(message = "Listing ID is required")
    private Long listingId;
    
    @NotNull(message = "Buyer ID is required")
    private Long buyerId;
    
    // Sử dụng BigDecimal cho số lượng để đảm bảo độ chính xác
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.000001", inclusive = true, message = "Quantity must be positive")
    private BigDecimal quantity;
}