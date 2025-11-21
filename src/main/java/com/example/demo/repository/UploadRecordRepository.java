package com.example.demo.repository;

import com.example.demo.entity.UploadRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadRecordRepository extends JpaRepository<UploadRecord, Long> {
}
