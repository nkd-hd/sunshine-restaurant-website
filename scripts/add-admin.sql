-- Add specific admin user to the database
USE `event_booking_db`;

-- First, check if user exists and delete if present
DELETE FROM `event-booking-system_user` WHERE email IN ('surekarl.hd', 'surekarl.hd@gmail.com');

-- Insert the new admin user
INSERT INTO `event-booking-system_user` (
  `id`,
  `name`,
  `email`,
  `password`,
  `role`
) VALUES (
  'admin-user-001',
  'Admin User',
  'surekarl.hd@gmail.com',
  'Nyuyuni6',
  'ADMIN'
);

-- Verify the user was created
SELECT id, name, email, role FROM `event-booking-system_user` WHERE email = 'surekarl.hd';

-- Show all users for verification
SELECT id, name, email, role FROM `event-booking-system_user`;
