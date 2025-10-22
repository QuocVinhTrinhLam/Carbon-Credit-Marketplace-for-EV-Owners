package com.example.demo.service;

import com.example.demo.entity.CarbonCredit;
import com.example.demo.entity.CreditRequest;
import com.example.demo.repository.CarbonCreditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

