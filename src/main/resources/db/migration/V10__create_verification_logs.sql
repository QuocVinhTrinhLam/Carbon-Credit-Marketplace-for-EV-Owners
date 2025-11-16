-- Tạo bảng lưu lịch sử xác minh (Verification Logs)
CREATE TABLE IF NOT EXISTS verification_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    verifier_id BIGINT NOT NULL,
    decision VARCHAR(20) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_request FOREIGN KEY (request_id) REFERENCES credit_request(id),
    CONSTRAINT fk_verification_verifier FOREIGN KEY (verifier_id) REFERENCES users(id),
    INDEX idx_verification_logs_request_id (request_id),
    INDEX idx_verification_logs_verifier_id (verifier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Safely add verifier_id column to credit_request
SET @col_check = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'credit_request'
      AND COLUMN_NAME = 'verifier_id'
);

SET @sql = IF(@col_check = 0,
    'ALTER TABLE credit_request ADD COLUMN verifier_id BIGINT NULL',
    'SELECT ''Column already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key constraint safely
SET @fk_check = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'credit_request'
      AND CONSTRAINT_NAME = 'fk_credit_request_verifier'
);

SET @sql2 = IF(@fk_check = 0,
    'ALTER TABLE credit_request ADD CONSTRAINT fk_credit_request_verifier FOREIGN KEY (verifier_id) REFERENCES users(id)',
    'SELECT ''Constraint already exists'' AS message'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Create index on credit_request status
SET @idx_check = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'credit_request'
      AND INDEX_NAME = 'idx_credit_request_status'
);

SET @sql3 = IF(@idx_check = 0,
    'CREATE INDEX idx_credit_request_status ON credit_request(status)',
    'SELECT ''Index already exists'' AS message'
);

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;
