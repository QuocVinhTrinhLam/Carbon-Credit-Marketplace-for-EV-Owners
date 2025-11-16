package com.example.demo.repository;

import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    // Admin queries
    long countByCreatedAtAfter(LocalDateTime date);
    
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<User> findTop5ByOrderByCreatedAtDesc();
    
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}

