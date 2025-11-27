package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false) // Đã cập nhật: không cho phép null
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false) // Đã cập nhật: không cho phép null
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false) // Đã cập nhật: không cho phép null
    private Listing listing;

    @Column(nullable = false, precision = 19, scale = 4)
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @Column(name = "carbon_quantity", nullable = false, precision = 19, scale = 4)
    @NotNull(message = "Carbon quantity is required")
    @Positive(message = "Carbon quantity must be positive")
    private BigDecimal carbonQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum TransactionStatus {
        PENDING,
        CANCELLED,
        COMPLETED
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public BigDecimal getCarbonQuantity() {
        return this.carbonQuantity;
    }

    public void setCarbonQuantity(BigDecimal carbonQuantity) {
        this.carbonQuantity = carbonQuantity;
    }
}