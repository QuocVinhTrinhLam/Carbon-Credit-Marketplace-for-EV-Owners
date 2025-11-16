-- Insert default admin user with role
-- Password is 'admin123' (will be hashed by BCrypt in application)

-- First, ensure roles exist
INSERT INTO role (name) 
SELECT 'ADMIN' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'ADMIN');

INSERT INTO role (name)
SELECT 'USER' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'USER');

INSERT INTO role (name)
SELECT 'CVA' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'CVA');

-- Create default admin user if not exists
-- Password: admin123 (BCrypt hash - verified)
INSERT INTO users (email, password, full_name, created_at)
SELECT 
    'admin@carbon.com',
    '$2a$10$LlHdkjTRgqd9EsIo5q0SEu5KvAg.Trdd/TfaTvBFYgjjgTp779gRi',  -- admin123
    'System Administrator',
    CURRENT_TIMESTAMP
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@carbon.com'
);

-- Assign ADMIN role to the admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN role r
WHERE u.email = 'admin@carbon.com' 
  AND r.name = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Also create wallet and carbon_wallet for admin user
INSERT INTO wallet (balance, user_id)
SELECT 0, u.id
FROM users u
WHERE u.email = 'admin@carbon.com'
  AND NOT EXISTS (SELECT 1 FROM wallet WHERE user_id = u.id);

INSERT INTO carbon_wallet (balance, owner_id, created_at, updated_at)
SELECT 0, u.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM users u
WHERE u.email = 'admin@carbon.com'
  AND NOT EXISTS (SELECT 1 FROM carbon_wallet WHERE owner_id = u.id);

