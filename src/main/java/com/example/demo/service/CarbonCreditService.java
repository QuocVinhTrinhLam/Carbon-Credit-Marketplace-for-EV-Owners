package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.CarbonCredit;
import com.example.demo.entity.CreditRequest;
import com.example.demo.repository.CarbonCreditRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CarbonCreditService {

    private final CarbonCreditRepository carbonCreditRepository;

    // Tạo tín chỉ sau khi duyệt request
    public CarbonCredit issueCredit(CreditRequest request) {
        CarbonCredit credit = new CarbonCredit();
        credit.setOwnerId(request.getOwnerId());
        credit.setAmount(request.getCarbonAmount());
        credit.setSource("Request#" + request.getId());
        return carbonCreditRepository.save(credit);
    }

    // Issue credit directly (used by upload flow)
    @Transactional
    public CarbonCredit issueCredit(Long ownerId, Double amount, String source) {
        CarbonCredit credit = new CarbonCredit();
        credit.setOwnerId(ownerId);
        credit.setAmount(amount);
        credit.setSource(source);
        return carbonCreditRepository.save(credit);
    }

    public List<CarbonCredit> getCreditsByOwner(Long ownerId) {
        return carbonCreditRepository.findByOwnerId(ownerId);
    }

    public List<CarbonCredit> getListedCredits() {
        return carbonCreditRepository.findByListedTrue();
    }

    public CarbonCredit listCredit(Long creditId) {
        CarbonCredit credit = carbonCreditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Credit not found"));
        credit.setListed(true);
        return carbonCreditRepository.save(credit);
    }

    public CarbonCredit unlistCredit(Long creditId) {
        CarbonCredit credit = carbonCreditRepository.findById(creditId)
                .orElseThrow(() -> new RuntimeException("Credit not found"));
        credit.setListed(false);
        return carbonCreditRepository.save(credit);
    }
}

