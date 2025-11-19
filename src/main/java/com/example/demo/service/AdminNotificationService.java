package com.example.demo.service;

import com.example.demo.entity.AdminNotification;
import com.example.demo.entity.User;
import com.example.demo.repository.AdminNotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminNotificationService {

    private final AdminNotificationRepository notificationRepository;

    /**
     * Create notification for VNPay topup success
     */
    @Transactional
    public void notifyVnpayTopup(User user, BigDecimal amount, String transactionRef) {
        AdminNotification notification = new AdminNotification();
        notification.setType(AdminNotification.NotificationType.VNPAY_TOPUP);
        notification.setTitle("💰 Nạp tiền VNPay thành công");
        notification.setMessage(String.format(
            "User %s (%s) đã nạp %s VND qua VNPay. Transaction: %s",
            user.getFullName(),
            user.getEmail(),
            amount.toPlainString(),
            transactionRef
        ));
        notification.setUser(user);
        notification.setReferenceId(transactionRef);
        notification.setAmount(amount);
        
        notificationRepository.save(notification);
        log.info("Created admin notification for VNPay topup: user={}, amount={}", user.getEmail(), amount);
    }

    /**
     * Create notification for new user registration
     */
    @Transactional
    public void notifyUserRegistration(User user) {
        AdminNotification notification = new AdminNotification();
        notification.setType(AdminNotification.NotificationType.USER_REGISTER);
        notification.setTitle("👤 User mới đăng ký");
        notification.setMessage(String.format(
            "User mới: %s (%s) đã đăng ký tài khoản",
            user.getFullName(),
            user.getEmail()
        ));
        notification.setUser(user);
        
        notificationRepository.save(notification);
        log.info("Created admin notification for user registration: {}", user.getEmail());
    }

    /**
     * Get all notifications
     */
    public List<AdminNotification> getAllNotifications() {
        return notificationRepository.findAllByOrderByIsReadAscCreatedAtDesc();
    }

    /**
     * Get unread notifications
     */
    public List<AdminNotification> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }

    /**
     * Get unread count
     */
    public long getUnreadCount() {
        return notificationRepository.countByIsReadFalse();
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.markAsRead();
            notificationRepository.save(notification);
            log.info("Marked notification {} as read", notificationId);
        });
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead() {
        List<AdminNotification> unreadNotifications = notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
        unreadNotifications.forEach(AdminNotification::markAsRead);
        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read", unreadNotifications.size());
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
        log.info("Deleted notification {}", notificationId);
    }
}

