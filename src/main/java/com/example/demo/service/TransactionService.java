package com.example.demo.service;

import com.example.demo.dto.TransactionRequest;
import com.example.demo.dto.TransactionResponse;
import com.example.demo.entity.Listing;
import com.example.demo.entity.Transaction;
import com.example.demo.entity.User;
import com.example.demo.repository.ListingRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final CertificateService certificateService; // Chuẩn hóa tên biến

    @Transactional
    @SuppressWarnings("null")
    public TransactionResponse createTransaction(TransactionRequest request) {
        log.info("Creating transaction for listing ID: {} by buyer ID: {} with quantity: {}",
                request.getListingId(), request.getBuyerId(), request.getQuantity());

        // 1. Validate listing exists and is available
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() ->
                        new RuntimeException("Listing not found with ID: " + request.getListingId()));

        if (listing.getStatus() != Listing.ListingStatus.OPEN) {
            throw new RuntimeException("Listing is not available for purchase");
        }
        
        // 2. Validate quantity and calculate price
        BigDecimal requestedQuantity = request.getQuantity() != null ? new BigDecimal(request.getQuantity().toString()) : BigDecimal.ONE;
        BigDecimal availableQuantity = listing.getCarbonAmount();

        // Kiểm tra số lượng mua có vượt quá số lượng còn lại không
        if (requestedQuantity.compareTo(availableQuantity) > 0) {
            throw new RuntimeException("Requested quantity exceeds available quantity on listing. Available: " + availableQuantity);
        }

        // GIẢ ĐỊNH: listing.getPrice() là GIÁ ĐƠN VỊ (Price per Carbon Credit)
        BigDecimal transactionAmount = listing.getPrice().multiply(requestedQuantity);
        
        // 3. Validate buyer exists
        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() ->
                        new RuntimeException("Buyer not found with ID: " + request.getBuyerId()));

        // 4. Validate buyer is not the seller
        if (buyer.getId().equals(listing.getSeller().getId())) {
            throw new RuntimeException("Buyer cannot purchase their own listing");
        }

        // 5. Check if buyer has sufficient balance in carbon wallet
        BigDecimal buyerBalance = walletService.getBalance(buyer.getId()); 

        if (buyerBalance.compareTo(transactionAmount) < 0) {
            throw new RuntimeException("Insufficient balance for purchase. Needed: " + transactionAmount);
        }

        // 6. Create transaction in PENDING
        Transaction transaction = new Transaction();
        transaction.setBuyer(buyer);
        transaction.setSeller(listing.getSeller());
        transaction.setListing(listing);
        transaction.setAmount(transactionAmount); // Tổng tiền phải trả
        // LƯU SỐ LƯỢNG CARBON ĐƯỢC MUA VÀO TRANSACTION (CẦN FIELD carbonQuantity trong Entity Transaction)
        transaction.setCarbonQuantity(requestedQuantity); 
        transaction.setStatus(Transaction.TransactionStatus.PENDING);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 7. KHÔNG RESERVE LISTING. Listing vẫn để OPEN cho đến khi confirm.
        
        log.info("Transaction created with ID: {}", savedTransaction.getId());

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional
    @SuppressWarnings("null")
    public TransactionResponse confirmTransaction(Long transactionId) {
        log.info("Confirming transaction with ID: {}", transactionId);
        
        // 1. Load transaction
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found with ID: " + transactionId));

        // 2. Must still be pending
        if (transaction.getStatus() != Transaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING status");
        }

        // 3. Thực hiện chuyển tiền carbon giữa buyer -> seller
        // - Debit ví buyer
        walletService.debit(
                transaction.getBuyer().getId(),
                transaction.getAmount(),
                "Purchase of listing: " + transaction.getListing().getTitle()
        );

        // - Credit ví seller
        walletService.credit(
                transaction.getSeller().getId(),
                transaction.getAmount(),
                "Sale of listing: " + transaction.getListing().getTitle()
        );
        
        // ISSUE CERTIFICATE cho buyer
        // Dùng số lượng carbon mua từ Transaction, không phải Listing
        BigDecimal purchasedQuantity = transaction.getCarbonQuantity();
        Double credits = purchasedQuantity.doubleValue(); // Cần chú ý về độ chính xác khi chuyển sang Double
        
        certificateService.createCertificate(
             transaction.getBuyer().getId(),
             credits
        );

        // 4. Cập nhật số lượng còn lại của Listing
        Listing listing = transaction.getListing();
        BigDecimal remainingQuantity = listing.getCarbonAmount().subtract(purchasedQuantity);
        
        listing.setCarbonAmount(remainingQuantity);

        // 5. Cập nhật trạng thái Listing
        if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            // Nếu số lượng còn lại <= 0, đánh dấu Listing là SOLD
            listing.setStatus(Listing.ListingStatus.SOLD);
            log.info("Listing {} is now SOLD out.", listing.getId());
        } 
        
        // Nếu còn lại > 0, Listing vẫn giữ trạng thái OPEN
        listingRepository.save(listing);

        // 6. Mark transaction as COMPLETED
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        Transaction savedTransaction = transactionRepository.save(transaction);

        log.info("Transaction confirmed and completed with ID: {}", transactionId);

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional
    @SuppressWarnings("null")
    public TransactionResponse cancelTransaction(Long transactionId) {
        log.info("Cancelling transaction with ID: {}", transactionId);

        // 1. Load transaction
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found with ID: " + transactionId));

        // 2. Only PENDING transactions can be cancelled
        if (transaction.getStatus() != Transaction.TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING status");
        }

        // 3. Mark transaction as CANCELLED
        transaction.setStatus(Transaction.TransactionStatus.CANCELLED);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 4. Không cần thay đổi trạng thái Listing vì Listing không bị RESERVED
        
        log.info("Transaction cancelled with ID: {}", transactionId);

        return TransactionResponse.fromTransaction(savedTransaction);
    }
    
    // Các phương thức truy vấn (getTransactionsByUserId, getTransactionsByBuyer, v.v.)
    // (Giữ nguyên)
    public List<TransactionResponse> getTransactionsByUserId(Long userId) {
        log.info("Fetching transactions for user ID: {}", userId);

        List<Transaction> transactions =
                transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsByBuyer(Long buyerId) {
        log.info("Fetching transactions for buyer ID: {}", buyerId);

        List<Transaction> transactions =
                transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);

        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getTransactionsBySeller(Long sellerId) {
        log.info("Fetching transactions for seller ID: {}", sellerId);

        List<Transaction> transactions =
                transactionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);

        return transactions.stream()
                .map(TransactionResponse::fromTransaction)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public TransactionResponse getTransactionById(Long id) {
        log.info("Fetching transaction with ID: {}", id);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found with ID: " + id));

        return TransactionResponse.fromTransaction(transaction);
    }
}