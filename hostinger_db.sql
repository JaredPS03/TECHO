CREATE TABLE IF NOT EXISTS artworks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    technique VARCHAR(255) NOT NULL,
    dimensions VARCHAR(255) DEFAULT NULL,
    year VARCHAR(4) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_bid DECIMAL(10, 2) NOT NULL,
    image_url TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bids (
    id VARCHAR(36) PRIMARY KEY,
    artwork_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bidder_name VARCHAR(255) NOT NULL,
    bidder_whatsapp VARCHAR(50) NOT NULL,
    bidder_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar el usuario administrador (admin@techo.org / TechoOax2026)
INSERT IGNORE INTO admin_users (id, email, password_hash) 
VALUES (UUID(), 'admin@techo.org', '$2b$10$y5FpFo.jKl6JeBMW0YeHE.SOGPx4qjQuddH.IGrx6DmyMfueY7Tcq');
