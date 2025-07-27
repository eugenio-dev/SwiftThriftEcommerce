/*
  This file contains the SQL code necessary to intialize the database for SwiftThrift;
  This will allow people who have access the project to create their own local
  database to test out the website according to the structure, and also provides a 
  view of how the database on the server looks like for anyone contributing to the
  project
*/



-- For running the data base locally
DROP DATABASE IF EXISTS SwiftThriftDB;
CREATE DATABASE IF NOT EXISTS SwiftThriftDB;
USE SwiftThriftDB;



-- Users table (Students / Admins)
DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_role INT NOT NULL DEFAULT 0,
  perms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  profile_picture VARCHAR(255)
);



-- Categories Table
DROP TABLE IF EXISTS categories;
CREATE TABLE IF NOT EXISTS categories (
  category_id INT PRIMARY KEY UNIQUE,
  category_name VARCHAR(255) NOT NULL,
  category_description TEXT
);



-- Listings table (Products / Services)
DROP TABLE IF EXISTS listings;
CREATE TABLE IF NOT EXISTS listings (
  listing_id INT PRIMARY KEY AUTO_INCREMENT,
  seller_id INT NOT NULL, -- FK
  category_id INT NOT NULL, -- FK
  listing_name VARCHAR(75) NOT NULL,
  listing_description TEXT(800),
  price DECIMAL(10,0) NOT NULL DEFAULT 0.00,
  listing_status VARCHAR(255) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (seller_id) REFERENCES users(user_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
  ON DELETE CASCADE ON UPDATE CASCADE
);



-- Pictures Table (Both original and thumbnails)
DROP TABLE IF EXISTS pictures;
CREATE TABLE IF NOT EXISTS pictures (
  picture_id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT, -- FK
  originalName VARCHAR(255) NOT NULL,
  thumbnailName VARCHAR(255) NOT NULL,
  display_order INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
  ON DELETE CASCADE ON UPDATE CASCADE  
);



-- Messages Table
DROP TABLE IF EXISTS messages;
CREATE TABLE IF NOT EXISTS messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  listing_id INT NOT NULL, -- FK
  sender_id INT, -- FK
  reciever_id INT, -- FK
  message_text TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (listing_id) REFERENCES listings(listing_id)
  ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id)
  ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (reciever_id) REFERENCES users(user_id)
  ON DELETE SET NULL ON UPDATE CASCADE
);



-- Keywords Table
DROP TABLE IF EXISTS keywords;
CREATE TABLE IF NOT EXISTS keywords (
  keyword_id INT PRIMARY KEY UNIQUE,
  keyword VARCHAR(255) NOT NULL,
  category_id INT NOT NULL,

  FOREIGN KEY (category_id) REFERENCES categories(category_id)
  ON DELETE CASCADE ON UPDATE CASCADE
);


-- Sessions Table
DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires BIGINT(20) UNSIGNED NOT NULL,
  data TEXT,
  user_id INT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability Table (Time slots for service listings)
DROP TABLE IF EXISTS availability;
CREATE TABLE IF NOT EXISTS availability (
  availability_id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL, -- FK to listings
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,

  FOREIGN KEY (service_id) REFERENCES listings(listing_id)
  ON DELETE CASCADE ON UPDATE CASCADE
);
