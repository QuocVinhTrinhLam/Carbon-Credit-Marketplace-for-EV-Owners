-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(500) NOT NULL,
    description TEXT,
    INDEX idx_system_settings_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO system_settings (config_key, config_value, description)
VALUES 
    ('credit_conversion_rate', '1000', 'CO2 reduction (kg) to credit conversion rate'),
    ('min_credit_request_amount', '1.0', 'Minimum credit amount for requests'),
    ('transaction_fee_percentage', '2.5', 'Transaction fee percentage')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

