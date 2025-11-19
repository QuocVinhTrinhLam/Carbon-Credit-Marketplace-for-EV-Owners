package com.example.demo.controller;

import com.example.demo.entity.AdminNotification;
import com.example.demo.service.AdminNotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Notifications", description = "Admin notification management endpoints")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final AdminNotificationService notificationService;

    /**
     * Get all notifications
     */
    @GetMapping
    @Operation(summary = "Get all admin notifications")
    public ResponseEntity<Map<String, Object>> getAllNotifications() {
        List<AdminNotification> notifications = notificationService.getAllNotifications();
        long unreadCount = notificationService.getUnreadCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        response.put("unreadCount", unreadCount);
        response.put("total", notifications.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread notifications only
     */
    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications() {
        List<AdminNotification> notifications = notificationService.getUnreadNotifications();
        
        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        response.put("count", notifications.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread count
     */
    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Mark all notifications as read
     */
    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        notificationService.markAllAsRead();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        
        return ResponseEntity.ok(response);
    }
}

