CREATE TABLE IF NOT EXISTS carbon_certificate (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  owner_id BIGINT NOT NULL,
  amount DOUBLE NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL
);
