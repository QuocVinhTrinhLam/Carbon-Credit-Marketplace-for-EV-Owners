package com.example.demo.consumer;

import com.example.demo.config.RabbitMQConfig;
import com.example.demo.dto.DisputeCreatedEvent;
import com.example.demo.entity.Dispute;
import com.example.demo.entity.Transaction;
import com.example.demo.entity.User;
import com.example.demo.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DisputeNotificationConsumer {

    private final DisputeRepository disputeRepository;
    
    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    @Transactional(readOnly = true) // Chỉ đọc data
    public void handleDisputeCreatedEvent(DisputeCreatedEvent event) {
        log.info("Received dispute event from RabbitMQ: disputeId={}", event.getDisputeId());

        try {
            // 1. Lấy đầy đủ thông tin từ DB
            Dispute dispute = disputeRepository.findById(event.getDisputeId())
                    .orElseThrow(() -> new RuntimeException("Dispute not found in consumer: " + event.getDisputeId()));
            
            Transaction transaction = dispute.getTransaction();
            User buyer = transaction.getBuyer();
            User seller = transaction.getSeller();

            // 2. Thực hiện các tác vụ bất đồng bộ (chỉ ghi log)
            log.info("Processing background notifications for dispute: {}", dispute.getId());

            // --- TÁC VỤ A: Thông báo cho ADMIN ---
            log.warn("-> (Task A) GIẢ LẬP: Gửi thông báo Dashboard cho Admin về tranh chấp #" + dispute.getId());

            // --- TÁC VỤ B: Thông báo cho NGƯỜI BÁN ---
            log.info("-> (Task B) GIẢ LẬP: Gửi thông báo (In-App) cho Seller (Email: {})", seller.getEmail());

            // Trong đồ án, việc ghi log rõ ràng như thế này là đủ để chứng minh
            // Consumer đã nhận và xử lý message thành công.

        } catch (Exception e) {
            log.error("CRITICAL: Error processing dispute event (ID: {}): {}. This message needs retry.", 
                        event.getDisputeId(), e.getMessage());
            
            throw new RuntimeException("Failed to process dispute event", e);
        }
    }
}