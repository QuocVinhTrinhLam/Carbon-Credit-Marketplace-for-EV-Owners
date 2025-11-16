package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTopupRequest {
    private Long userId;
    private Long amount; // Số tiền VND (sẽ nhân 100 khi gửi cho VNPay)
}

