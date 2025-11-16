package com.example.demo.controller;

import com.example.demo.entity.Listing;
import com.example.demo.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/listings")
@RequiredArgsConstructor
@Slf4j
public class AdminListingController {

    private final ListingRepository listingRepository;

    // ✅ Lấy toàn bộ listing cho admin
    @GetMapping
    public ResponseEntity<?> getAllListings() {
        List<Listing> listings = listingRepository.findAll();

        if (listings.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body(Collections.singletonMap("message", "No listings found"));
        }

        // ✅ Dùng HashMap thay cho Map.of() để tương thích mọi version Java
        List<Map<String, Object>> data = listings.stream().map(l -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", l.getId());
            map.put("title", l.getTitle());
            map.put("price", l.getPrice());
            map.put("carbonAmount", l.getCarbonAmount());
            map.put("status", l.getStatus().toString());
            map.put("sellerId", l.getSeller() != null ? l.getSeller().getId() : null);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("total", data.size());
        response.put("data", data);

        return ResponseEntity.ok(response);
    }

    // ✅ Disable (vô hiệu hóa) một listing cụ thể
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableListing(@PathVariable Long id) {
        return listingRepository.findById(id)
                .<ResponseEntity<?>>map(l -> {
                    l.setStatus(Listing.ListingStatus.CANCELLED);
                    listingRepository.save(l);

                    Map<String, Object> res = new HashMap<>();
                    res.put("message", "Listing disabled successfully");
                    res.put("id", id);

                    return ResponseEntity.ok(res);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Collections.singletonMap("error", "Listing not found")));
    }

    /**
     * Approve a listing
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveListing(@PathVariable Long id) {
        log.info("Admin - Approve listing ID: {}", id);
        return listingRepository.findById(id)
                .<ResponseEntity<?>>map(l -> {
                    l.setStatus(Listing.ListingStatus.APPROVED);
                    listingRepository.save(l);
                    return ResponseEntity.ok(Map.of(
                            "message", "Listing approved successfully",
                            "id", id,
                            "status", "APPROVED"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Listing not found")));
    }

    /**
     * Reject a listing
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectListing(@PathVariable Long id, @RequestParam String reason) {
        log.info("Admin - Reject listing ID: {} with reason: {}", id, reason);
        return listingRepository.findById(id)
                .<ResponseEntity<?>>map(l -> {
                    l.setStatus(Listing.ListingStatus.REJECTED);
                    listingRepository.save(l);
                    return ResponseEntity.ok(Map.of(
                            "message", "Listing rejected successfully",
                            "id", id,
                            "status", "REJECTED",
                            "reason", reason
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Listing not found")));
    }

    /**
     * Get listing statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getListingStats() {
        log.info("Admin - Get listing statistics");
        
        long total = listingRepository.count();
        long open = listingRepository.countByStatus(Listing.ListingStatus.OPEN);
        long sold = listingRepository.countByStatus(Listing.ListingStatus.SOLD);
        long cancelled = listingRepository.countByStatus(Listing.ListingStatus.CANCELLED);

        return ResponseEntity.ok(Map.of(
                "total", total,
                "open", open,
                "sold", sold,
                "cancelled", cancelled
        ));
    }

    /**
     * Delete a listing (admin force delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Long id) {
        log.info("Admin - Delete listing ID: {}", id);
        return listingRepository.findById(id)
                .<ResponseEntity<?>>map(l -> {
                    listingRepository.delete(l);
                    return ResponseEntity.ok(Map.of(
                            "message", "Listing deleted successfully",
                            "id", id
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Listing not found")));
    }
}
