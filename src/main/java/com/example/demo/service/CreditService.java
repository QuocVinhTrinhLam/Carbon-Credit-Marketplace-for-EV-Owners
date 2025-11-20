package com.example.demo.service;

import com.example.demo.entity.CarbonCertificate;
import com.example.demo.entity.CarbonCredit;
import com.example.demo.entity.CreditRequest;
import com.example.demo.repository.CarbonCertificateRepository;
import com.example.demo.repository.CarbonCreditRepository;
import com.example.demo.repository.CreditRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreditRequestRepository creditRequestRepository;
    private final CarbonCreditRepository carbonCreditRepository;
    private final CarbonCertificateRepository certificateRepository;

    public CreditRequest approveRequest(Long id) {

        CreditRequest req = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus("APPROVED");
        creditRequestRepository.save(req);

        //  Tạo certificate
        CarbonCertificate cert = CarbonCertificate.builder()
                .ownerId(req.getOwnerId())
                .amount(req.getCarbonAmount())
                .issuedDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusDays(90))
                .status(CarbonCertificate.CertificateStatus.VALID)
                .build();

        certificateRepository.save(cert);

        //  Tạo carbon credit
        CarbonCredit credit = new CarbonCredit();
        credit.setOwnerId(req.getOwnerId());
        credit.setAmount(req.getCarbonAmount());
        credit.setSource("Certificate#" + cert.getId());
        carbonCreditRepository.save(credit);

        return req;
    }

    public CreditRequest rejectRequest(Long id, String reason) {
        CreditRequest req = creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        req.setStatus("REJECTED");
        req.setNotes(reason);

        return creditRequestRepository.save(req);
    }

    public CreditRequest submitRequest(CreditRequest r) {
        r.setStatus("PENDING");
        return creditRequestRepository.save(r);
    }
}
