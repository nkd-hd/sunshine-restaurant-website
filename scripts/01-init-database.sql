-- Database initialization script for Docker MySQL container
-- This script runs automatically when the container starts for the first time

-- Ensure the database exists
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Grant privileges to the app user
GRANT ALL PRIVILEGES ON event_booking.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- Create a test table to verify the database is working
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record
INSERT INTO health_check (status) VALUES ('database_initialized');

-- Display initialization status
SELECT 'Database initialization completed successfully' AS status;
