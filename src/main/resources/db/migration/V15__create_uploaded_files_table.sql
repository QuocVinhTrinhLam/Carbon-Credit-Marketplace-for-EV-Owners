-- Tạo bảng lưu file metadata (match với entity FileMetadata)
CREATE TABLE IF NOT EXISTS file_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    credit_request_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_file_metadata_request FOREIGN KEY (credit_request_id) REFERENCES credit_request(id),
    CONSTRAINT fk_file_metadata_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo index hỗ trợ truy vấn nhanh
CREATE INDEX idx_file_metadata_request_id ON file_metadata(credit_request_id);
CREATE INDEX idx_file_metadata_uploaded_by ON file_metadata(uploaded_by);
