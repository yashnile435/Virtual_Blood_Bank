CREATE DATABASE IF NOT EXISTS vbbs;
USE vbbs;
SHOW DATABASES;
-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS blood_requests;
DROP TABLE IF EXISTS blood_inventory;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS admins;

-- 1. Admins Table
CREATE TABLE admins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 2. Donors Table
CREATE TABLE donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    city VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 3. Blood Inventory Table
CREATE TABLE blood_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    blood_group VARCHAR(5) NOT NULL UNIQUE,
    units_available INT NOT NULL,
    last_updated DATETIME NOT NULL
);

-- 4. Blood Requests Table
CREATE TABLE blood_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    units_required INT NOT NULL,
    city VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    request_date DATETIME NOT NULL
);

-- Seed Data

-- Admin User (Password: admin123)
-- The password hash is for 'admin123'
INSERT INTO admins (username, password, role) VALUES 
('admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRlgBPiTEJXEx4/052OI3q.DyAT', 'ROLE_ADMIN');

-- Sample Donors (Password: admin123)
INSERT INTO donors (name, blood_group, city, phone, email, available, last_donation_date, password, role) VALUES 
('John Doe', 'A+', 'New York', '1234567890', 'john@example.com', TRUE, '2023-01-01', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRlgBPiTEJXEx4/052OI3q.DyAT', 'ROLE_USER'),
('Jane Smith', 'O-', 'London', '0987654321', 'jane@example.com', TRUE, '2023-02-15', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRlgBPiTEJXEx4/052OI3q.DyAT', 'ROLE_USER'),
('Alice Johnson', 'B+', 'Paris', '1122334455', 'alice@example.com', FALSE, '2023-03-20', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRlgBPiTEJXEx4/052OI3q.DyAT', 'ROLE_USER');

-- Sample Inventory
INSERT INTO blood_inventory (blood_group, units_available, last_updated) VALUES 
('A+', 50, NOW()),
('A-', 20, NOW()),
('B+', 45, NOW()),
('B-', 15, NOW()),
('O+', 100, NOW()),
('O-', 30, NOW()),
('AB+', 25, NOW()),
('AB-', 10, NOW());

-- Sample Requests
INSERT INTO blood_requests (patient_name, hospital_name, blood_group, units_required, city, status, request_date) VALUES 
('Michael Brown', 'General Hospital', 'A+', 2, 'New York', 'PENDING', NOW()),
('Sarah Wilson', 'City Medical Center', 'O-', 1, 'London', 'APPROVED', NOW());
