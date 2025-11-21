package com.example.demo.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.UploadRecord;
import com.example.demo.repository.UploadRecordRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadRecordService {

    private final UploadRecordRepository uploadRecordRepository;

    @Transactional
    public UploadRecord saveUpload(Long ownerId, String filename, String extractedText, BigDecimal estimatedCo2Kg, BigDecimal creditsTons) {
        UploadRecord ur = new UploadRecord();
        ur.setOwnerId(ownerId);
        ur.setFilename(filename);
        ur.setExtractedText(extractedText);
        ur.setEstimatedCo2Kg(estimatedCo2Kg == null ? BigDecimal.ZERO : estimatedCo2Kg);
        ur.setCreditsTons(creditsTons == null ? BigDecimal.ZERO : creditsTons);
        UploadRecord saved = uploadRecordRepository.save(ur);
        log.info("Saved upload record id={} owner={} file={} credits(t)={}", saved.getId(), ownerId, filename, saved.getCreditsTons());
        return saved;
    }
}
