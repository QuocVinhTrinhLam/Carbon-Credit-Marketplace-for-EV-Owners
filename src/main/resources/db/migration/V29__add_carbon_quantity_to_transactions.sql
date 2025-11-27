-- V29__add_carbon_quantity_to_transactions.sql
-- Add carbon_quantity column to transactions table to track purchased quantity per transaction

ALTER TABLE transactions
ADD COLUMN carbon_quantity DECIMAL(19, 4) NOT NULL DEFAULT 1.0000;

-- Update existing transactions to default to 1 unit if not already set
UPDATE transactions SET carbon_quantity = 1.0000 WHERE carbon_quantity IS NULL;
