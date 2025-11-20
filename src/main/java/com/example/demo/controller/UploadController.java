package com.example.demo.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.UploadResponse;
import com.example.demo.service.CarbonCreditService;
import com.example.demo.service.CarbonWalletService;
import com.example.demo.service.FileUploadService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Slf4j
public class UploadController {

    private final FileUploadService fileUploadService;
    private final CarbonWalletService carbonWalletService;
    private final CarbonCreditService carbonCreditService;

    @PostMapping(value = "/estimate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Transactional
        public ResponseEntity<UploadResponse> uploadAndEstimate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId
    ) {
        // 1. parse and estimate CO2 in kg
        BigDecimal co2Kg = fileUploadService.parseAndEstimateCo2Kg(file);
        if (co2Kg == null) co2Kg = BigDecimal.ZERO;

        // 2. extract full/preview text
        String extracted = fileUploadService.extractText(file);

        // 3. convert kg -> tons (1 ton = 1000 kg), keep 4 decimals
        BigDecimal creditsTons = co2Kg.divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

        // 4. create CarbonCredit record and credit to user's carbon wallet (credits in tons)
        if (creditsTons.compareTo(BigDecimal.ZERO) > 0) {
            // create CarbonCredit record (CarbonCredit.amount is Double)
            carbonCreditService.issueCredit(userId, creditsTons.doubleValue(), "Uploaded file: " + file.getOriginalFilename());

            // add to carbon wallet (wallet uses BigDecimal tons)
            carbonWalletService.credit(userId, creditsTons, "Uploaded file: " + file.getOriginalFilename());
        }

        UploadResponse resp = new UploadResponse(co2Kg, creditsTons, "OK", extracted);
        return ResponseEntity.ok(resp);
    }
}
