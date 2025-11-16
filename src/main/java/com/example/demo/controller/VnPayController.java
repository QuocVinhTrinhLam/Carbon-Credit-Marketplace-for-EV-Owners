package com.example.demo.controller;

import com.example.demo.dto.CreateTopupRequest;
import com.example.demo.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
public class VnPayController {

    private final VnPayService vnPayService;

    /**
     * Tạo URL thanh toán VNPay
     */
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(
            @RequestBody CreateTopupRequest request,
            HttpServletRequest httpServletRequest
    ) {
        try {
            log.info("=== VNPay Create Payment Request ===");
            log.info("UserId: {}, Amount: {}", request.getUserId(), request.getAmount());
            
            String paymentUrl = vnPayService.createPaymentUrl(request, httpServletRequest);
            
            log.info("Payment URL created successfully");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "paymentUrl", paymentUrl,
                    "message", "Payment URL created successfully"
            ));
            
        } catch (IllegalArgumentException e) {
            // Validation errors (bad request from user)
            log.warn("Invalid VNPay topup request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "Invalid topup request",
                            "error", e.getMessage()
                    ));
            
        } catch (IllegalStateException e) {
            // Configuration errors
            log.error("VNPay configuration error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "VNPAY not configured properly",
                            "error", e.getMessage(),
                            "hint", "Please check application-dev.yml and configure tmn-code and hash-secret"
                    ));
            
        } catch (Exception e) {
            // Unexpected errors
            log.error("Unexpected error creating VNPay payment", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to create VNPAY payment",
                            "error", e.getMessage(),
                            "type", e.getClass().getSimpleName()
                    ));
        }
    }

    /**
     * IPN (Instant Payment Notification) callback từ VNPay
     * Endpoint này được VNPay gọi để thông báo kết quả thanh toán
     */
    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(HttpServletRequest request) {
        try {
            log.info("Received VNPay IPN callback");
            
            // Extract all parameters
            Map<String, String> params = extractParams(request);
            
            // Log parameters (không log sensitive data trong production)
            log.debug("IPN params: {}", params);
            
            // Verify signature
            if (!vnPayService.verifyIpn(params)) {
                log.error("Invalid VNPay IPN signature");
                return ResponseEntity.ok(Map.of(
                        "RspCode", "97",
                        "Message", "Invalid signature"
                ));
            }
            
            // Process payment
            vnPayService.processIpn(params);
            
            // Return success response to VNPay
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Confirm Success"
            ));
            
        } catch (Exception e) {
            log.error("Error processing VNPay IPN: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "99",
                    "Message", "Unknown error: " + e.getMessage()
            ));
        }
    }

    /**
     * Return URL - Frontend redirect về đây sau khi user hoàn thành thanh toán
     * QUAN TRỌNG: Xử lý payment ngay tại đây vì IPN có thể không được gọi (localhost)
     */
    @GetMapping("/return")
    public ResponseEntity<?> handleReturn(HttpServletRequest request) {
        try {
            log.info("=== VNPay Return URL called ===");
            Map<String, String> params = extractParams(request);
            
            // Log để debug
            log.info("Return params: vnp_TxnRef={}, vnp_ResponseCode={}, vnp_TransactionStatus={}", 
                    params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"), params.get("vnp_TransactionStatus"));
            
            // Verify signature
            if (!vnPayService.verifyIpn(params)) {
                log.warn("Invalid VNPay return signature");
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid signature"));
            }
            
            String vnpTxnRef = params.get("vnp_TxnRef");
            String vnpResponseCode = params.get("vnp_ResponseCode");
            String vnpTransactionStatus = params.get("vnp_TransactionStatus");
            String vnpAmount = params.get("vnp_Amount");
            
            // QUAN TRỌNG: Xử lý payment ngay tại return URL
            // Vì IPN có thể không được gọi nếu server là localhost
            if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
                log.info("Processing payment from return URL for txnRef: {}", vnpTxnRef);
                try {
                    // Process payment (giống như IPN)
                    vnPayService.processIpn(params);
                    log.info("Payment processed successfully from return URL");
                } catch (Exception e) {
                    log.error("Error processing payment from return URL: {}", e.getMessage(), e);
                    // Vẫn trả về success để user không bị redirect lỗi
                }
            }
            
            return ResponseEntity.ok(Map.of(
                    "success", "00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus),
                    "txnRef", vnpTxnRef != null ? vnpTxnRef : "",
                    "amount", vnpAmount != null ? vnpAmount : "0",
                    "status", vnpTransactionStatus != null ? vnpTransactionStatus : "",
                    "responseCode", vnpResponseCode != null ? vnpResponseCode : "",
                    "message", ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus))
                            ? "Payment successful" 
                            : "Payment failed or cancelled"
            ));
            
        } catch (Exception e) {
            log.error("Error handling VNPay return: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Extract all query parameters from request
     */
    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> result = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            result.put(paramName, paramValue);
        }
        
        return result;
    }
}

