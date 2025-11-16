-- Add VNPay-related fields to wallet_transactions

ALTER TABLE wallet_transactions
    ADD COLUMN description VARCHAR(255) NULL,
    ADD COLUMN status VARCHAR(20) NULL,
    ADD COLUMN external_ref VARCHAR(100) NULL,
    ADD COLUMN payment_method VARCHAR(50) NULL,
    ADD COLUMN vnp_transaction_status VARCHAR(10) NULL,
    ADD COLUMN vnp_response_code VARCHAR(10) NULL;

CREATE INDEX idx_wallet_transaction_external_ref
    ON wallet_transactions (external_ref);

ALTER TABLE wallet_transactions
    COMMENT = 'Wallet transactions with VNPAY support';
