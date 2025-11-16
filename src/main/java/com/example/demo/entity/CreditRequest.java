package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_request")
@Data
public class CreditRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long ownerId;   // userId (liên kết với User)

    @Lob
    private String journeyData; // dữ liệu hành trình

    @Lob
    private String evidence;    // bằng chứng

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING / APPROVED / REJECTED

    @Column(nullable = false)
    private Double carbonAmount; // số tín chỉ đề nghị phát hành

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private String notes;

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

}
