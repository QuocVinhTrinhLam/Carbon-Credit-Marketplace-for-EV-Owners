-- V16__create_role_tables.sql
-- Tables có thể đã tồn tại từ V14, nên chỉ đảm bảo dữ liệu.
-- (Nếu bạn vẫn muốn đảm bảo bảng tồn tại, để lại CREATE ... IF NOT EXISTS an toàn)

CREATE TABLE IF NOT EXISTS role (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
                                          user_id BIGINT NOT NULL,
                                          role_id BIGINT NOT NULL,
                                          PRIMARY KEY (user_id, role_id),
                                          CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                          CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Chèn role chỉ khi chưa có (tránh duplicate key)
INSERT INTO role (name)
SELECT 'ADMIN' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'ADMIN');

INSERT INTO role (name)
SELECT 'CVA' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'CVA');

INSERT INTO role (name)
SELECT 'USER' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'USER');
