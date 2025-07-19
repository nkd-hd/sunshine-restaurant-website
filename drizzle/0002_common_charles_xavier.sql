ALTER TABLE `event-booking-system_booking` MODIFY COLUMN `status` enum('CONFIRMED','CANCELLED','PENDING_PAYMENT') DEFAULT 'PENDING_PAYMENT';--> statement-breakpoint
ALTER TABLE `event-booking-system_booking` ADD `paymentMethod` enum('CARD','MTN_MOMO','ORANGE_MONEY','BANK_TRANSFER','CASH');--> statement-breakpoint
ALTER TABLE `event-booking-system_booking` ADD `paymentStatus` enum('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING';--> statement-breakpoint
ALTER TABLE `event-booking-system_booking` ADD `paymentReference` varchar(100);--> statement-breakpoint
ALTER TABLE `event-booking-system_booking` ADD `paymentDetails` json;--> statement-breakpoint
CREATE INDEX `booking_payment_status_idx` ON `event-booking-system_booking` (`paymentStatus`);