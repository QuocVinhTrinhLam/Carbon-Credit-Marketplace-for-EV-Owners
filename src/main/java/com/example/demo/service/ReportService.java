package com.example.demo.service;

import com.example.demo.entity.Report;
import com.example.demo.entity.ReportStatus;
import com.example.demo.entity.ReportType;
import com.example.demo.dto.CreateReportRequest;
import com.example.demo.dto.UpdateReportStatusRequest;
import com.example.demo.repository.ReportRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ReportService {
    private final ReportRepository repo;

    public ReportService(ReportRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Report submitReport(CreateReportRequest req) {
        Report r = new Report();
        r.setType(req.type());
        r.setDescription(req.description());
        r.setDataPath(req.dataPath());
        return repo.save(r);
    }

    public Page<Report> search(ReportType type, ReportStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (type != null && status != null) return repo.findByTypeAndStatus(type, status, pageable);
        if (type != null) return repo.findByType(type, pageable);
        if (status != null) return repo.findByStatus(status, pageable);
        return repo.findAll(pageable);
    }

    @SuppressWarnings("null")
    public Report get(Long id) {
        return repo.findById(id).orElseThrow();
    }

    @Transactional
    public Report updateStatus(Long id, UpdateReportStatusRequest req) {
        Report r = get(id);
        r.setStatus(req.status());
        r.setResolutionNote(req.resolutionNote());
        if (req.status() == ReportStatus.RESOLVED || req.status() == ReportStatus.REJECTED) {
            r.setResolvedAt(LocalDateTime.now());
        }
        return repo.save(r);
    }
}
