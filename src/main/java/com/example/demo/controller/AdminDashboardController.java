package com.example.demo.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Co2Reduction;
import com.example.demo.entity.Co2Status;
import com.example.demo.entity.Listing;
import com.example.demo.entity.Transaction;
import com.example.demo.repository.Co2Repository;
import com.example.demo.repository.ListingRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final TransactionRepository transactionRepository;
        private final Co2Repository co2Repository;
        private final com.example.demo.service.DashboardSseService dashboardSseService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        log.info("Admin - Get dashboard summary");

        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userRepository.count());
        data.put("totalListings", listingRepository.count());
        data.put("totalTransactions", transactionRepository.count());
        // Transactions summary
        List<Transaction> transactions = transactionRepository.findAll();
        long completed = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.COMPLETED)
                .count();
        long cancelled = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.CANCELLED)
                .count();
        long pending = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.PENDING)
                .count();
        long confirmed = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.CONFIRMED)
                .count();

        data.put("transactionsCompleted", completed);
        data.put("transactionsCancelled", cancelled);
        data.put("transactionsPending", pending);
        data.put("transactionsConfirmed", confirmed);

        // Credits verified (sum of credits for approved reductions)
        BigDecimal creditsVerified = co2Repository.findAll().stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equalsIgnoreCase("APPROVED"))
                .map(Co2Reduction::getCredits)
                .filter(c -> c != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("creditsVerified", creditsVerified);

        // Platform revenue: sum of amounts for COMPLETED transactions
        BigDecimal platformRevenue = transactions.stream()
                .filter(t -> t.getStatus() == Transaction.TransactionStatus.COMPLETED || t.getStatus() == Transaction.TransactionStatus.CONFIRMED)
                .map(Transaction::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("platformRevenue", platformRevenue);

        // compute simple month-over-month deltas for display (current month vs previous month)
        LocalDate now = LocalDate.now(ZoneId.systemDefault());
        LocalDate startOfThisMonth = now.withDayOfMonth(1);
        LocalDate startOfPrevMonth = startOfThisMonth.minusMonths(1);
        LocalDateTime startThis = startOfThisMonth.atStartOfDay();
        LocalDateTime startPrev = startOfPrevMonth.atStartOfDay();

        long usersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startThis))
                .count();
        long usersPrevMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startPrev) && u.getCreatedAt().isBefore(startThis))
                .count();
        data.put("usersThisMonth", usersThisMonth);
        data.put("usersPrevMonth", usersPrevMonth);

        BigDecimal revenueThisMonth = transactionRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(startThis) && (t.getStatus() == Transaction.TransactionStatus.COMPLETED || t.getStatus() == Transaction.TransactionStatus.CONFIRMED))
                .map(Transaction::getAmount).filter(a -> a != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal revenuePrevMonth = transactionRepository.findAll().stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(startPrev) && t.getCreatedAt().isBefore(startThis) && (t.getStatus() == Transaction.TransactionStatus.COMPLETED || t.getStatus() == Transaction.TransactionStatus.CONFIRMED))
                .map(Transaction::getAmount).filter(a -> a != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("revenueThisMonth", revenueThisMonth);
        data.put("revenuePrevMonth", revenuePrevMonth);

        BigDecimal creditsThisMonth = co2Repository.findAll().stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equalsIgnoreCase("APPROVED") && r.getCreatedAt() != null && r.getCreatedAt().isAfter(startThis))
                .map(Co2Reduction::getCredits).filter(c -> c != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal creditsPrevMonth = co2Repository.findAll().stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equalsIgnoreCase("APPROVED") && r.getCreatedAt() != null && r.getCreatedAt().isAfter(startPrev) && r.getCreatedAt().isBefore(startThis))
                .map(Co2Reduction::getCredits).filter(c -> c != null).reduce(BigDecimal.ZERO, BigDecimal::add);
        data.put("creditsThisMonth", creditsThisMonth);
        data.put("creditsPrevMonth", creditsPrevMonth);

        return ResponseEntity.ok(data);
    }

        @GetMapping("/monthly-volume")
        public ResponseEntity<Map<String, Object>> getMonthlyVolume(@RequestParam(name = "months", defaultValue = "6") int months) {
                log.info("Admin - Get monthly transaction volume for last {} months", months);

                Map<String, Object> resp = new HashMap<>();
                List<String> labels = new ArrayList<>();
                List<Long> transactionsCounts = new ArrayList<>();
                List<java.math.BigDecimal> volumes = new ArrayList<>();

                // Build month buckets from oldest -> newest
                for (int i = months - 1; i >= 0; i--) {
                        YearMonth ym = YearMonth.now(ZoneId.systemDefault()).minusMonths(i);
                        LocalDateTime start = ym.atDay(1).atStartOfDay();
                        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();

                        // Label like 'Jul' or 'Nov'
                        labels.add(ym.getMonth().toString().substring(0, 1).toUpperCase() + ym.getMonth().toString().substring(1,3).toLowerCase());

                        long txCount = transactionRepository.findAll().stream()
                                        .filter(t -> t.getCreatedAt() != null && (t.getCreatedAt().isEqual(start) || (t.getCreatedAt().isAfter(start) && t.getCreatedAt().isBefore(end))))
                                        .count();
                        transactionsCounts.add(txCount);

                        java.math.BigDecimal vol = co2Repository.findAll().stream()
                                        .filter(r -> r.getStatus() != null && r.getStatus().name().equalsIgnoreCase("APPROVED")
                                                        && r.getCreatedAt() != null && (r.getCreatedAt().isEqual(start) || (r.getCreatedAt().isAfter(start) && r.getCreatedAt().isBefore(end))))
                                        .map(Co2Reduction::getCredits)
                                        .filter(c -> c != null)
                                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                        volumes.add(vol);
                }

                resp.put("labels", labels);
                resp.put("transactions", transactionsCounts);
                // convert BigDecimal volumes to numbers (use double) for JSON
                List<Double> volumesDouble = new ArrayList<>();
                for (java.math.BigDecimal b : volumes) volumesDouble.add(b == null ? 0.0 : b.doubleValue());
                resp.put("volumes", volumesDouble);

                return ResponseEntity.ok(resp);
        }

            @GetMapping("/credit-status")
            public ResponseEntity<Map<String, Object>> getCreditStatus() {
                log.info("Admin - Get credit status summary");

                // Total approved credits (tCO2e)
                java.math.BigDecimal totalCredits = co2Repository.findAll().stream()
                        .filter(r -> r.getStatus() != null && r.getStatus() == Co2Status.APPROVED)
                        .map(Co2Reduction::getCredits)
                        .filter(c -> c != null)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                // Listed credits: sum of carbon amounts on listings that are available/listed
                java.math.BigDecimal listed = listingRepository.findAll().stream()
                        .filter(l -> l.getStatus() == Listing.ListingStatus.OPEN || l.getStatus() == Listing.ListingStatus.RESERVED || l.getStatus() == Listing.ListingStatus.APPROVED)
                        .map(Listing::getCarbonAmount)
                        .filter(a -> a != null)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                // Sold credits: sum of carbon amounts on listings with SOLD status
                java.math.BigDecimal sold = listingRepository.findAll().stream()
                        .filter(l -> l.getStatus() == Listing.ListingStatus.SOLD)
                        .map(Listing::getCarbonAmount)
                        .filter(a -> a != null)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                // available = total - listed - sold (floor at zero)
                java.math.BigDecimal available = totalCredits.subtract(listed).subtract(sold);
                if (available.compareTo(java.math.BigDecimal.ZERO) < 0) available = java.math.BigDecimal.ZERO;

                Map<String, Object> out = new HashMap<>();
                out.put("total", totalCredits.doubleValue());
                out.put("available", available.doubleValue());
                out.put("listed", listed.doubleValue());
                out.put("sold", sold.doubleValue());

                return ResponseEntity.ok(out);
            }

        @GetMapping("/stream")
        public org.springframework.web.servlet.mvc.method.annotation.SseEmitter stream() {
                log.info("Admin - Open dashboard SSE stream");
                return dashboardSseService.registerEmitter();
        }

        @PostMapping("/refresh")
        public ResponseEntity<Void> refreshNow() {
                log.info("Admin - Manual refresh requested");
                dashboardSseService.manualPublish();
                return ResponseEntity.ok().build();
        }

        @GetMapping("/clients")
        public ResponseEntity<Integer> clients() {
                return ResponseEntity.ok(dashboardSseService.getConnectedClientCount());
        }

        @PostMapping("/refresh/interval")
        public ResponseEntity<Void> setInterval(@RequestParam long seconds) {
                dashboardSseService.setRefreshInterval(seconds);
                return ResponseEntity.ok().build();
        }

        @PostMapping("/refresh/toggle")
        public ResponseEntity<Void> toggle(@RequestParam boolean enabled) {
                dashboardSseService.setRefreshing(enabled);
                return ResponseEntity.ok().build();
        }
}
