-- Create test user
INSERT INTO users (id, email, password, full_name, created_at, updated_at) 
VALUES (1, 'test@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Test User', NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Create wallet for test user
INSERT INTO wallet (id, user_id, balance, created_at, updated_at)
VALUES (1, 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Create carbon wallet for test user
INSERT INTO carbon_wallet (id, owner_id, balance, created_at, updated_at)
VALUES (1, 1, 100.00, NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;
