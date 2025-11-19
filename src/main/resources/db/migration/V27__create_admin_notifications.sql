-- Create admin notifications table
CREATE TABLE admin_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL COMMENT 'VNPAY_TOPUP, USER_REGISTER, TRANSACTION, etc',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id BIGINT NULL COMMENT 'Related user if applicable',
    reference_id VARCHAR(100) NULL COMMENT 'Transaction ref, order id, etc',
    amount DECIMAL(19,4) NULL COMMENT 'Amount if applicable',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

