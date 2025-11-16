-- Create carbon_wallet table
CREATE TABLE carbon_wallet (
                               id BIGINT AUTO_INCREMENT PRIMARY KEY,
                               owner_id BIGINT NOT NULL,
                               balance DECIMAL(19, 4) DEFAULT 0,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               INDEX idx_owner_id (owner_id),
                               CONSTRAINT fk_wallet_user FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
