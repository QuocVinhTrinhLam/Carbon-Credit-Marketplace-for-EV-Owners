package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisputeCreatedEvent {
    private Long disputeId;
    private Long transactionId;
    private Long openedByUserId;
    private String reason;
    private LocalDateTime timestamp;
}