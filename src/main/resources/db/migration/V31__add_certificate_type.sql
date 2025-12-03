-- Add certificate_type column to distinguish between ISSUED (from transaction) and REQUESTED (from user request)
ALTER TABLE carbon_certificate ADD COLUMN certificate_type VARCHAR(50) DEFAULT 'ISSUED';
