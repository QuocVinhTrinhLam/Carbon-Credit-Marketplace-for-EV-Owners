package com.example.demo.service;

import com.example.demo.dto.ListingRequest;
import com.example.demo.dto.ListingResponse;
import com.example.demo.entity.Listing;
import com.example.demo.entity.User;
import com.example.demo.repository.ListingRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ListingService {
    
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ListingResponse createListing(ListingRequest request) {
        log.info("Creating listing: {}", request.getTitle());
        
        User seller = userRepository.findById(request.getSellerId())
                .orElseThrow(() -> new RuntimeException("Seller not found with ID: " + request.getSellerId()));
        
        Listing listing = new Listing();
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCarbonAmount(request.getCarbonAmount());
        listing.setPrice(request.getPrice());
        listing.setSeller(seller);
        // New listings are created as PENDING for CVA/admin review
        listing.setStatus(Listing.ListingStatus.PENDING);
        
        Listing savedListing = listingRepository.save(listing);
        log.info("Listing created with ID: {}", savedListing.getId());
        
        return ListingResponse.fromListing(savedListing);
    }
    
    public Page<ListingResponse> getAllListings(Pageable pageable) {
        log.info("Fetching all listings");
        Page<Listing> listings = listingRepository.findAll(pageable);
        return listings.map(ListingResponse::fromListing);
    }
    
    public ListingResponse getListingById(Long id) {
        log.info("Fetching listing with ID: {}", id);
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with ID: " + id));
        return ListingResponse.fromListing(listing);
    }
    
    public List<ListingResponse> getListingsBySeller(Long sellerId) {
        log.info("Fetching listings for seller ID: {}", sellerId);
        List<Listing> listings = listingRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
        return listings.stream()
                .map(ListingResponse::fromListing)
                .collect(Collectors.toList());
    }
    
    public Page<ListingResponse> getOpenListings(Pageable pageable) {
        log.info("Fetching open listings");
        Page<Listing> listings = listingRepository.findByStatus(Listing.ListingStatus.OPEN, pageable);
        return listings.map(ListingResponse::fromListing);
    }
    
    public Page<ListingResponse> searchListings(String keyword, Pageable pageable) {
        log.info("Searching listings with keyword: {}", keyword);
        Page<Listing> listings = listingRepository.findByKeyword(keyword, pageable);
        return listings.map(ListingResponse::fromListing);
    }
    
    @Transactional
    public ListingResponse updateListing(Long id, ListingRequest request) {
        log.info("Updating listing with ID: {}", id);
        
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with ID: " + id));
        
        // Only allow updates if listing is OPEN
        if (listing.getStatus() != Listing.ListingStatus.OPEN) {
            throw new RuntimeException("Cannot update listing that is not OPEN");
        }
        
        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setCarbonAmount(request.getCarbonAmount());
        listing.setPrice(request.getPrice());
        
        Listing updatedListing = listingRepository.save(listing);
        log.info("Listing updated with ID: {}", updatedListing.getId());
        
        return ListingResponse.fromListing(updatedListing);
    }
    
    @Transactional
    public void deleteListing(Long id) {
        log.info("Deleting listing with ID: {}", id);
        
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with ID: " + id));
        
        // Only allow deletion if listing is OPEN
        if (listing.getStatus() != Listing.ListingStatus.OPEN) {
            throw new RuntimeException("Cannot delete listing that is not OPEN");
        }
        
        listingRepository.delete(listing);
        log.info("Listing deleted with ID: {}", id);
    }
    
    @Transactional
    public void updateListingStatus(Long id, Listing.ListingStatus status) {
        log.info("Updating listing status to {} for ID: {}", status, id);
        
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with ID: " + id));
        
        listing.setStatus(status);
        listingRepository.save(listing);
        log.info("Listing status updated for ID: {}", id);
    }
}
