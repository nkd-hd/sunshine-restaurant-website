CREATE TABLE `event-booking-system_account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `event-booking-system_account_provider_providerAccountId_pk` PRIMARY KEY(`provider`,`providerAccountId`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_booking` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`bookingDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`status` enum('CONFIRMED','CANCELLED') DEFAULT 'CONFIRMED',
	`attendeeInfo` json,
	`referenceNumber` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `event-booking-system_booking_id` PRIMARY KEY(`id`),
	CONSTRAINT `event-booking-system_booking_referenceNumber_unique` UNIQUE(`referenceNumber`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_cart` (
	`id` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`eventId` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `event-booking-system_cart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_event` (
	`id` varchar(255) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`date` date NOT NULL,
	`time` time NOT NULL,
	`venue` varchar(200) NOT NULL,
	`location` varchar(200) NOT NULL,
	`organizer` varchar(100) NOT NULL,
	`organizerContact` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`availableTickets` int NOT NULL,
	`totalTickets` int NOT NULL,
	`imageUrl` varchar(500),
	`status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event-booking-system_event_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_post` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(256),
	`createdById` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event-booking-system_post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `event-booking-system_session_sessionToken` PRIMARY KEY(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3),
	`image` varchar(255),
	`password` varchar(255),
	`role` enum('USER','ADMIN') DEFAULT 'USER',
	CONSTRAINT `event-booking-system_user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event-booking-system_verification_token` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `event-booking-system_verification_token_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `event-booking-system_account` (`userId`);--> statement-breakpoint
CREATE INDEX `booking_user_id_idx` ON `event-booking-system_booking` (`userId`);--> statement-breakpoint
CREATE INDEX `booking_event_id_idx` ON `event-booking-system_booking` (`eventId`);--> statement-breakpoint
CREATE INDEX `booking_reference_idx` ON `event-booking-system_booking` (`referenceNumber`);--> statement-breakpoint
CREATE INDEX `cart_user_id_idx` ON `event-booking-system_cart` (`userId`);--> statement-breakpoint
CREATE INDEX `cart_event_id_idx` ON `event-booking-system_cart` (`eventId`);--> statement-breakpoint
CREATE INDEX `event_date_idx` ON `event-booking-system_event` (`date`);--> statement-breakpoint
CREATE INDEX `event_location_idx` ON `event-booking-system_event` (`location`);--> statement-breakpoint
CREATE INDEX `event_status_idx` ON `event-booking-system_event` (`status`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `event-booking-system_post` (`createdById`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `event-booking-system_post` (`name`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `event-booking-system_session` (`userId`);