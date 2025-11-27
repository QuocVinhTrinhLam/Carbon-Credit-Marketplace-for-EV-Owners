package com.example.demo.dto;

import com.example.demo.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    
    private Long id;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private Long listingId;
    private String listingTitle;
    private BigDecimal amount;
    //Thêm field
    private BigDecimal pricePerCredit;
    private Integer quantity;

    private Transaction.TransactionStatus status;
    private LocalDateTime createdAt;
    
    public static TransactionResponse fromTransaction(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setBuyerId(transaction.getBuyer().getId());
        response.setBuyerName(transaction.getBuyer().getFullName());
        response.setBuyerEmail(transaction.getBuyer().getEmail());
        response.setSellerId(transaction.getSeller().getId());
        response.setSellerName(transaction.getSeller().getFullName());
        response.setSellerEmail(transaction.getSeller().getEmail());
        response.setListingId(transaction.getListing().getId());
        response.setListingTitle(transaction.getListing().getTitle());
        // QUANTITY = số carbon ĐƯỢC MUA trong transaction này (không phải toàn bộ listing)
        int qty = transaction.getCarbonQuantity().intValue();
        response.setQuantity(qty);

        // price per credit (đơn giá)
        BigDecimal pricePerCredit = transaction.getListing().getPrice();
        response.setPricePerCredit(pricePerCredit);

        response.setAmount(transaction.getAmount());
        response.setStatus(transaction.getStatus());
        response.setCreatedAt(transaction.getCreatedAt());
        return response;
    }
}
