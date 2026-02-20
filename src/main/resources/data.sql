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
