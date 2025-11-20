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
    private final CertificateService CertificateService; //Thêm CertificateService

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {
        log.info("Creating transaction for listing ID: {} by buyer ID: {}",
                request.getListingId(), request.getBuyerId());

        // 1. Validate listing exists and is available
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() ->
                        new RuntimeException("Listing not found with ID: " + request.getListingId()));

        if (listing.getStatus() != Listing.ListingStatus.OPEN) {
            throw new RuntimeException("Listing is not available for purchase");
        }

        // 2. Validate buyer exists
        User buyer = userRepository.findById(request.getBuyerId())
                .orElseThrow(() ->
                        new RuntimeException("Buyer not found with ID: " + request.getBuyerId()));

        // 3. Validate buyer is not the seller
        if (buyer.getId().equals(listing.getSeller().getId())) {
            throw new RuntimeException("Buyer cannot purchase their own listing");
        }

        // 4. Check if buyer has sufficient balance in carbon wallet
        BigDecimal buyerBalance = walletService.getBalance(buyer.getId()); // <- dùng ví, không dùng user.getCarbonBalance()
        BigDecimal price = listing.getPrice();

        if (buyerBalance.compareTo(price) < 0) {
            throw new RuntimeException("Insufficient balance for purchase");
        }

        // 5. Create transaction in PENDING
        Transaction transaction = new Transaction();
        transaction.setBuyer(buyer);
        transaction.setSeller(listing.getSeller());
        transaction.setListing(listing);
        transaction.setAmount(price);
        transaction.setStatus(Transaction.TransactionStatus.PENDING);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // 6. Reserve the listing so người khác không mua cùng lúc
        listing.setStatus(Listing.ListingStatus.RESERVED);
        listingRepository.save(listing);

        log.info("Transaction created with ID: {}", savedTransaction.getId());

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional
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
        //    - Debit ví buyer
        walletService.debit(
                transaction.getBuyer().getId(),
                transaction.getAmount(),
                "Purchase of listing: " + transaction.getListing().getTitle()
        );

        //    - Credit ví seller
        walletService.credit(
                transaction.getSeller().getId(),
                transaction.getAmount(),
                "Sale of listing: " + transaction.getListing().getTitle()
        );
        // ISSUE CERTIFICATE cho buyer
        Double credits = transaction.getListing().getCarbonAmount().doubleValue();
        
        CertificateService.createCertificate(
            transaction.getBuyer().getId(),
            credits
         );

        // 4. Mark transaction as COMPLETED
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // 5. Mark listing as SOLD
        transaction.getListing().setStatus(Listing.ListingStatus.SOLD);
        listingRepository.save(transaction.getListing());

        log.info("Transaction confirmed and completed with ID: {}", transactionId);

        return TransactionResponse.fromTransaction(savedTransaction);
    }

    @Transactional
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

        // 4. Listing quay lại OPEN cho người khác mua
        transaction.getListing().setStatus(Listing.ListingStatus.OPEN);
        listingRepository.save(transaction.getListing());

        log.info("Transaction cancelled with ID: {}", transactionId);

        return TransactionResponse.fromTransaction(savedTransaction);
    }

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

    public TransactionResponse getTransactionById(Long id) {
        log.info("Fetching transaction with ID: {}", id);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Transaction not found with ID: " + id));

        return TransactionResponse.fromTransaction(transaction);
    }
}
