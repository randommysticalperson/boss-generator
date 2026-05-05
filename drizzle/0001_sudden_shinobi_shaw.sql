CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`mode` enum('megaman','pokemon') NOT NULL,
	`characterName` varchar(128) NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text NOT NULL,
	`formData` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
