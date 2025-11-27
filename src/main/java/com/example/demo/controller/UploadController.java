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

import com.example.demo.dto.EstimateFormRequest;
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
    private final com.example.demo.service.UploadRecordService uploadRecordService;

    @PostMapping(value = "/estimate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Transactional
        public ResponseEntity<UploadResponse> uploadAndEstimate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId
    ) {
        // preliminary: ensure file contains required journey sections
        boolean hasSections = fileUploadService.hasRequiredJourneySections(file);
        String extracted = fileUploadService.extractText(file);
        if (!hasSections) {
            UploadResponse bad = new UploadResponse();
            bad.setEstimatedCo2Kg(BigDecimal.ZERO);
            bad.setCreditsIssued(BigDecimal.ZERO.setScale(4, RoundingMode.HALF_UP));
            bad.setMessage("File thiếu phần bắt buộc. Vui lòng kiểm tra lại.");
            bad.setExtractedText(extracted);
            return ResponseEntity.badRequest().body(bad);
        }

        // 1. parse and estimate CO2 in kg
        BigDecimal co2Kg = fileUploadService.parseAndEstimateCo2Kg(file);
        if (co2Kg == null) co2Kg = BigDecimal.ZERO;

        // 2. convert kg -> tons (1 ton = 1000 kg), keep 4 decimals
        BigDecimal creditsTons = co2Kg.divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

        // 3. save upload record (so valid uploads are persisted)
        try {
            uploadRecordService.saveUpload(userId, file.getOriginalFilename(), extracted, co2Kg, creditsTons);
        } catch (Exception ex) {
            log.error("Failed to save upload record", ex);
            // continue — do not block credit issuance for storage failure, but log
        }

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

    @PostMapping(value = "/estimate/form", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UploadResponse> estimateFromForm(@org.springframework.web.bind.annotation.RequestBody EstimateFormRequest req) {
        BigDecimal co2Kg = fileUploadService.estimateFromFields(req.getDistanceKm(), req.getEnergyKwh(), req.getLiters(), req.getExplicitCo2Kg());
        if (co2Kg == null) co2Kg = BigDecimal.ZERO;
        BigDecimal creditsTons = co2Kg.divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        UploadResponse resp = new UploadResponse(co2Kg, creditsTons, "OK (form estimate)", null);
        return ResponseEntity.ok(resp);
    }

    @PostMapping(value = "/issue-credits", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Transactional
    public ResponseEntity<String> issueCredits(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Object> body) {
        try {
            Long userId = ((Number) body.get("userId")).longValue();
            BigDecimal creditsTons = new BigDecimal(body.get("creditsTons").toString());

            if (creditsTons.compareTo(BigDecimal.ZERO) > 0) {
                carbonCreditService.issueCredit(userId, creditsTons.doubleValue(), "Form estimate credits");
                carbonWalletService.credit(userId, creditsTons, "Form estimate credits");
            }
            return ResponseEntity.ok("Credits issued successfully: " + creditsTons + " tons");
        } catch (Exception ex) {
            log.error("Error issuing credits", ex);
            return ResponseEntity.status(500).body("Failed to issue credits: " + ex.getMessage());
        }
    }
}
