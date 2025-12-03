package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "disputes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisputeStatus status = DisputeStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisputeResolution resolution = DisputeResolution.NONE;

    @Column(length = 500)
    private String reason;

    private String evidenceUrl;

    private Long openedByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "opened_at")
    private LocalDateTime openedAt; 

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String adminNote;
}
