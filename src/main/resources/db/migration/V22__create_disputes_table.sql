-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    resolution VARCHAR(30) NOT NULL DEFAULT 'NONE',
    reason VARCHAR(500),
    evidence_url VARCHAR(500),
    opened_by_user_id BIGINT,
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    CONSTRAINT fk_disputes_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_disputes_transaction (transaction_id),
    INDEX idx_disputes_status (status),
    INDEX idx_disputes_opened_by (opened_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

