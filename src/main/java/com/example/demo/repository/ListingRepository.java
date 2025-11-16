package com.example.demo.repository;

import com.example.demo.entity.Listing;
import com.example.demo.entity.Listing.ListingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    
    List<Listing> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    
    List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);
    
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.status = :status AND " +
           "(:minPrice IS NULL OR l.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.price <= :maxPrice) AND " +
           "(:minCarbon IS NULL OR l.carbonAmount >= :minCarbon) AND " +
           "(:maxCarbon IS NULL OR l.carbonAmount <= :maxCarbon)")
    Page<Listing> findByFilters(@Param("status") ListingStatus status,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                @Param("minCarbon") BigDecimal minCarbon,
                                @Param("maxCarbon") BigDecimal maxCarbon,
                                Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE l.title LIKE %:keyword% OR l.description LIKE %:keyword%")
    Page<Listing> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Admin queries
    long countByStatus(ListingStatus status);
    
    List<Listing> findTop10ByOrderByCreatedAtDesc();
}
