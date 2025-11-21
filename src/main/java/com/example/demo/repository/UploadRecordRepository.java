package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.UploadRecord;

@Repository
public interface UploadRecordRepository extends JpaRepository<UploadRecord, Long> {
}
