package com.example.demo.service;

import com.example.demo.config.VnPayConfig;
import com.example.demo.dto.CreateTopupRequest;
import com.example.demo.entity.Wallet;
import com.example.demo.entity.WalletTransaction;
import com.example.demo.repository.WalletRepository;
import com.example.demo.repository.WalletTransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {

    private final VnPayConfig vnPayConfig;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    /**
     * Validate VNPay configuration
     */
    private void validateConfig() {
        if (vnPayConfig.getTmnCode() == null || vnPayConfig.getTmnCode().trim().isEmpty() ||
            vnPayConfig.getTmnCode().contains("YOUR_TMN_CODE_HERE")) {
            throw new IllegalStateException("VNPAY tmn-code is not configured. Please update application-dev.yml");
        }
        if (vnPayConfig.getHashSecret() == null || vnPayConfig.getHashSecret().trim().isEmpty() ||
            vnPayConfig.getHashSecret().contains("YOUR_HASH_SECRET_HERE")) {
            throw new IllegalStateException("VNPAY hash-secret is not configured. Please update application-dev.yml");
        }
        if (vnPayConfig.getPayUrl() == null || vnPayConfig.getPayUrl().trim().isEmpty()) {
            throw new IllegalStateException("VNPAY pay-url is not configured");
        }
        if (vnPayConfig.getReturnUrl() == null || vnPayConfig.getReturnUrl().trim().isEmpty()) {
            throw new IllegalStateException("VNPAY return-url is not configured");
        }
        if (vnPayConfig.getIpnUrl() == null || vnPayConfig.getIpnUrl().trim().isEmpty()) {
            throw new IllegalStateException("VNPAY ipn-url is not configured");
        }
        log.info("VNPay configuration validated successfully");
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    @Transactional
    public String createPaymentUrl(CreateTopupRequest request, HttpServletRequest servletRequest) {
        try {
            // Validate config first
            validateConfig();
            
            // Validate request
            if (request.getUserId() == null) {
                throw new IllegalArgumentException("userId is required");
            }
            if (request.getAmount() == null || request.getAmount() <= 0) {
                throw new IllegalArgumentException("amount must be greater than 0");
            }
            if (request.getAmount() < 10000) {
                throw new IllegalArgumentException("minimum amount is 10,000 VND");
            }
            
            log.info("Creating VNPay payment for user {} with amount {}", request.getUserId(), request.getAmount());
            
            // 1. Tìm wallet của user
            Wallet wallet = walletRepository.findByUser_Id(request.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user ID: " + request.getUserId()));

            // 2. Tạo WalletTransaction PENDING
            WalletTransaction transaction = new WalletTransaction();
            transaction.setWallet(wallet);
            transaction.setType(WalletTransaction.TransactionType.TOPUP_VNPAY);
            transaction.setAmount(BigDecimal.valueOf(request.getAmount()));
            transaction.setStatus(WalletTransaction.TransactionStatus.PENDING);
            transaction.setPaymentMethod("VNPAY");
            transaction.setDescription("Nạp tiền qua VNPay");
            
            // Tạo mã giao dịch unique
            String txnRef = "VNP" + System.currentTimeMillis();
            transaction.setExternalRef(txnRef);
            
            walletTransactionRepository.save(transaction);

            // 3. Build VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(request.getAmount() * 100)); // VNPay yêu cầu nhân 100
            vnpParams.put("vnp_CurrCode", vnPayConfig.getCurrCode());
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", "Nap tien vi - User ID: " + request.getUserId());
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", getIpAddress(servletRequest));
            
            // Thời gian tạo - dùng timezone Việt Nam (GMT+7)
            // VNPay yêu cầu format: yyyyMMddHHmmss (GMT+7)
            TimeZone vnTimeZone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
            Calendar cld = Calendar.getInstance(vnTimeZone);
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(vnTimeZone);
            
            String vnpCreateDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_CreateDate", vnpCreateDate);
            
            // Thời gian hết hạn (3 phút) - theo yêu cầu
            cld.add(Calendar.MINUTE, 3);
            String vnpExpireDate = formatter.format(cld.getTime());
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);
            
            log.info("VNPay payment created - CreateDate: {}, Expires at: {} (3 minutes)", 
                    vnpCreateDate, vnpExpireDate);

            // 4. Build query string và tạo secure hash
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            
            String queryUrl = query.toString();
            String vnpSecureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
            String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;
            
            log.info("Created VNPay payment URL for transaction: {}", txnRef);
            return paymentUrl;
            
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment URL: " + e.getMessage());
        }
    }

    /**
     * Xác thực IPN từ VNPay
     */
    public boolean verifyIpn(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            if (vnpSecureHash == null) {
                log.warn("Missing vnp_SecureHash in IPN");
                return false;
            }

            // Remove hash và signature params
            params.remove("vnp_SecureHash");
            params.remove("vnp_SecureHashType");

            // Build hash data
            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String calculatedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
            boolean valid = calculatedHash.equals(vnpSecureHash);
            
            if (!valid) {
                log.warn("Invalid VNPay IPN signature. Expected: {}, Got: {}", calculatedHash, vnpSecureHash);
            }
            
            return valid;
            
        } catch (Exception e) {
            log.error("Error verifying VNPay IPN: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Xử lý IPN callback từ VNPay hoặc Return URL
     */
    @Transactional
    public void processIpn(Map<String, String> params) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTransactionStatus = params.get("vnp_TransactionStatus");
        String vnpAmount = params.get("vnp_Amount");

        log.info("Processing VNPay payment for txnRef: {}, ResponseCode: {}, TransactionStatus: {}", 
                vnpTxnRef, vnpResponseCode, vnpTransactionStatus);

        // Tìm transaction
        WalletTransaction transaction = walletTransactionRepository.findByExternalRef(vnpTxnRef)
                .orElseThrow(() -> new RuntimeException("Transaction not found: " + vnpTxnRef));

        // Kiểm tra transaction đã xử lý chưa
        if (transaction.getStatus() != WalletTransaction.TransactionStatus.PENDING) {
            log.warn("Transaction {} already processed with status: {}", vnpTxnRef, transaction.getStatus());
            return;
        }

        // Kiểm tra số tiền (nếu có vnpAmount)
        if (vnpAmount != null && !vnpAmount.isEmpty()) {
            BigDecimal expectedAmount = transaction.getAmount().multiply(BigDecimal.valueOf(100));
            BigDecimal receivedAmount = new BigDecimal(vnpAmount);
            
            if (expectedAmount.compareTo(receivedAmount) != 0) {
                log.error("Amount mismatch for transaction {}: expected {}, received {}", 
                        vnpTxnRef, expectedAmount, receivedAmount);
                transaction.setStatus(WalletTransaction.TransactionStatus.FAILED);
                transaction.setDescription(transaction.getDescription() + " - Lỗi: Số tiền không khớp");
                walletTransactionRepository.save(transaction);
                return;
            }
        }

        // Xử lý theo trạng thái - check cả ResponseCode và TransactionStatus
        boolean isSuccess = ("00".equals(vnpResponseCode) || "00".equals(vnpTransactionStatus));
        
        if (isSuccess) {
            // Thanh toán thành công
            transaction.setStatus(WalletTransaction.TransactionStatus.SUCCESS);
            transaction.setDescription(transaction.getDescription() + " - Thanh toán thành công qua VNPay");
            walletTransactionRepository.save(transaction);

            // Cộng tiền vào ví
            Wallet wallet = transaction.getWallet();
            BigDecimal oldBalance = wallet.getBalance();
            wallet.setBalance(oldBalance.add(transaction.getAmount()));
            walletRepository.save(wallet);

            log.info("✅ Successfully processed VNPay topup for transaction {}: amount {} VND. " +
                    "Wallet balance: {} -> {}", 
                    vnpTxnRef, transaction.getAmount(), oldBalance, wallet.getBalance());
        } else {
            // Thanh toán thất bại
            String errorCode = vnpResponseCode != null ? vnpResponseCode : vnpTransactionStatus;
            transaction.setStatus(WalletTransaction.TransactionStatus.FAILED);
            transaction.setDescription(transaction.getDescription() + " - Thanh toán thất bại (code: " + errorCode + ")");
            walletTransactionRepository.save(transaction);

            log.warn("❌ VNPay payment failed for transaction {}: ResponseCode={}, TransactionStatus={}", 
                    vnpTxnRef, vnpResponseCode, vnpTransactionStatus);
        }
    }

    /**
     * Tính HMAC SHA512
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("Error calculating HMAC SHA512: {}", e.getMessage(), e);
            throw new RuntimeException("Error calculating hash", e);
        }
    }

    /**
     * Lấy IP address từ request
     */
    private String getIpAddress(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}

