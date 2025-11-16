package com.example.demo.controller;

import com.example.demo.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "Admin dashboard statistics and reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardControllerNew {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics", description = "Get comprehensive dashboard statistics for admin")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Fetching admin dashboard statistics");
        Map<String, Object> stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports/comprehensive")
    @Operation(summary = "Get comprehensive report", description = "Get comprehensive report for a date range")
    public ResponseEntity<Map<String, Object>> getComprehensiveReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        log.info("Generating comprehensive report from {} to {}", startDate, endDate);
        Map<String, Object> report = dashboardService.getComprehensiveReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}

