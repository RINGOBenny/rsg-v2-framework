-- Core tables for this build, written from the queries the resources run.
-- Import this first, then the per-resource files listed in docs/INSTALL.md.

CREATE TABLE IF NOT EXISTS `players` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(50) NOT NULL,
  `cid` INT DEFAULT NULL,
  `license` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `money` TEXT NOT NULL,
  `charinfo` TEXT DEFAULT NULL,
  `job` TEXT NOT NULL,
  `gang` TEXT DEFAULT NULL,
  `position` TEXT NOT NULL,
  `metadata` TEXT NOT NULL,
  `inventory` LONGTEXT DEFAULT NULL,
  `weight` INT NOT NULL DEFAULT 0,
  `slots` INT NOT NULL DEFAULT 0,
  `outlawstatus` INT NOT NULL DEFAULT 0,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `citizenid` (`citizenid`),
  KEY `license` (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bans` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) DEFAULT NULL,
  `license` VARCHAR(255) DEFAULT NULL,
  `discord` VARCHAR(255) DEFAULT NULL,
  `ip` VARCHAR(64) DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `expire` BIGINT DEFAULT NULL,
  `bannedby` VARCHAR(255) NOT NULL DEFAULT 'Server',
  PRIMARY KEY (`id`),
  KEY `license` (`license`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `playerskins` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(50) NOT NULL,
  `license` VARCHAR(255) DEFAULT NULL,
  `skin` LONGTEXT DEFAULT NULL,
  `clothes` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `playeroutfit` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `clothes` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `inventories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `identifier` VARCHAR(255) NOT NULL,
  `items` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `identifier` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `shop_stock` (
  `shop_name` VARCHAR(100) NOT NULL,
  `item_name` VARCHAR(100) NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`shop_name`, `item_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `player_jobs` (
  `citizenid` VARCHAR(50) NOT NULL,
  `job` VARCHAR(100) NOT NULL,
  `grade` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`citizenid`, `job`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `address_book` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `owner` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `telegrams` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `citizenid` VARCHAR(50) NOT NULL,
  `recipient` VARCHAR(255) DEFAULT NULL,
  `sender` VARCHAR(255) DEFAULT NULL,
  `sendername` VARCHAR(255) DEFAULT NULL,
  `subject` VARCHAR(255) DEFAULT NULL,
  `sentDate` VARCHAR(64) DEFAULT NULL,
  `message` TEXT DEFAULT NULL,
  `status` INT NOT NULL DEFAULT 0,
  `birdstatus` INT NOT NULL DEFAULT 0,
  `fromPostOffice` INT NOT NULL DEFAULT 0,
  `pickedUp` INT NOT NULL DEFAULT 1,
  `mailbox` VARCHAR(20) NOT NULL DEFAULT 'personal',
  `jobTarget` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `citizenid` (`citizenid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
