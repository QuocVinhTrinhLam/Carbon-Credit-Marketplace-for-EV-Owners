ALTER TABLE carbon_certificate
  ADD COLUMN project_name VARCHAR(255),
  ADD COLUMN certification_ref VARCHAR(255),
  ADD COLUMN certification_body VARCHAR(255),
  ADD COLUMN serial_number VARCHAR(255),
  ADD COLUMN notes TEXT;

-- Optional: backfill with empty strings or NULLs are acceptable
COMMIT;
