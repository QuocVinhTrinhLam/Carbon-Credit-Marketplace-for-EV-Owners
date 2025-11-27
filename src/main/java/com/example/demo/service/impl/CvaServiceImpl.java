package com.example.demo.service.impl;

import com.example.demo.entity.CreditRequest;
import com.example.demo.repository.CreditRequestRepository;
import com.example.demo.service.CvaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CvaServiceImpl implements CvaService {

    private final CreditRequestRepository creditRequestRepository;

    @Autowired
    public CvaServiceImpl(CreditRequestRepository creditRequestRepository) {
        this.creditRequestRepository = creditRequestRepository;
    }

    @Override
    public List<CreditRequest> getPendingRequests() {
        return creditRequestRepository.findAll();
    }

    @Override
    @SuppressWarnings("null")
    public CreditRequest getRequestById(Long id) {
        return creditRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    @Override
    public CreditRequest approveRequest(Long id, String notes) {
        CreditRequest request = getRequestById(id);
        request.setStatus("APPROVED");
        if (notes != null) {
            request.setNotes(notes);
        }
        return creditRequestRepository.save(request);
    }

    @Override
    public CreditRequest rejectRequest(Long id, String notes) {
        CreditRequest request = getRequestById(id);
        request.setStatus("REJECTED");
        if (notes != null) {
            request.setNotes(notes);
        }
        return creditRequestRepository.save(request);
    }
}