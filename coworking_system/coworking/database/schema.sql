-- ============================================================
-- Co-Working Space Booking System - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS coworking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coworking_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100)  NOT NULL,
    last_name   VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- bcrypt hash
    phone       TEXT          NOT NULL,           -- AES encrypted
    address     TEXT          NOT NULL,           -- AES encrypted
    role        ENUM('customer','employee','manager') NOT NULL DEFAULT 'customer',
    is_active   TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ============================================================
-- MEMBERSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS memberships (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED  NOT NULL,
    type        ENUM('daily','monthly','yearly') NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE          NOT NULL,
    is_active   TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id   (user_id),
    INDEX idx_end_date  (end_date)
) ENGINE=InnoDB;

-- ============================================================
-- ROOMS / SPACES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS spaces (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    total_desks INT UNSIGNED  NOT NULL DEFAULT 20,
    description TEXT,
    is_active   TINYINT(1)    NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED  NOT NULL,
    space_id        INT UNSIGNED  NOT NULL DEFAULT 1,
    booking_date    DATE          NOT NULL,
    time_slot       ENUM('morning','afternoon','evening','custom') NOT NULL,
    start_time      TIME          NOT NULL,
    end_time        TIME          NOT NULL,
    num_desks       INT UNSIGNED  NOT NULL DEFAULT 1,
    num_chairs      INT UNSIGNED  NOT NULL DEFAULT 1,
    status          ENUM('pending','paid','cancelled','expired') NOT NULL DEFAULT 'pending',
    total_price     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    expires_at      DATETIME      NOT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
    INDEX idx_user_id      (user_id),
    INDEX idx_booking_date (booking_date),
    INDEX idx_status       (status),
    INDEX idx_expires_at   (expires_at)
) ENGINE=InnoDB;

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id      INT UNSIGNED  NOT NULL,
    user_id         INT UNSIGNED  NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    method          ENUM('credit_card','bank_transfer','truewallet') NOT NULL,
    status          ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
    transaction_ref VARCHAR(100),
    refund_amount   DECIMAL(10,2) DEFAULT 0.00,
    refund_at       DATETIME,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id    (user_id),
    INDEX idx_status     (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- INVENTORY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    item_name   VARCHAR(100)  NOT NULL,
    category    ENUM('desk','chair','power_outlet','computer','snack','other') NOT NULL,
    quantity    INT UNSIGNED  NOT NULL DEFAULT 0,
    unit        VARCHAR(50)   NOT NULL DEFAULT 'unit',
    updated_by  INT UNSIGNED,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- OPERATIONAL COSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS operational_costs (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255)  NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    cost_date   DATE          NOT NULL,
    recorded_by INT UNSIGNED,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_cost_date (cost_date)
) ENGINE=InnoDB;

-- ============================================================
-- CCTV CAMERAS TABLE (mock)
-- ============================================================
CREATE TABLE IF NOT EXISTS cctv_cameras (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    location    VARCHAR(255)  NOT NULL,
    stream_url  VARCHAR(500)  NOT NULL DEFAULT 'mock://stream',
    is_active   TINYINT(1)    NOT NULL DEFAULT 1
) ENGINE=InnoDB;
