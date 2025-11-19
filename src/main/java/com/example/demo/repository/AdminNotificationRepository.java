package com.example.demo.repository;

import com.example.demo.entity.AdminNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminNotificationRepository extends JpaRepository<AdminNotification, Long> {

    // Get all notifications, unread first
    List<AdminNotification> findAllByOrderByIsReadAscCreatedAtDesc();

    // Get unread notifications only
    List<AdminNotification> findByIsReadFalseOrderByCreatedAtDesc();

    // Count unread notifications
    long countByIsReadFalse();

    // Get notifications by type
    List<AdminNotification> findByTypeOrderByCreatedAtDesc(AdminNotification.NotificationType type);

    // Get recent notifications (limit in service layer)
    @Query("SELECT n FROM AdminNotification n ORDER BY n.createdAt DESC")
    List<AdminNotification> findRecentNotifications();
}

