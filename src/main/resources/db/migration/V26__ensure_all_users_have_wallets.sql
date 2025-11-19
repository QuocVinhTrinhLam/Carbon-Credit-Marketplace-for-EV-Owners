-- ✅ Đảm bảo tất cả users đều có wallet (VND) và carbon_wallet
-- Migration này sẽ tạo wallet cho các user cũ chưa có wallet

-- 1. Tạo wallet (VND) cho các user chưa có
INSERT INTO wallet (balance, user_id)
SELECT 0, u.id
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM wallet w WHERE w.user_id = u.id
);

-- 2. Tạo carbon_wallet cho các user chưa có
INSERT INTO carbon_wallet (balance, owner_id, created_at, updated_at)
SELECT 0, u.id, NOW(), NOW()
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM carbon_wallet cw WHERE cw.owner_id = u.id
);

