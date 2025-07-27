-- Sample Data Set Provided by ChatGPT
-- To Insert Data run: mysql -u 'user' -p SwiftThriftDB < sampleData.sql 

USE SwiftThriftDB;

DELETE FROM pictures;
DELETE FROM messages;
DELETE FROM keywords;
DELETE FROM listings;
DELETE FROM users;
DELETE FROM categories;
DELETE FROM sessions;

-- Insert Users
INSERT INTO users (firstName, lastName, email, user_password, user_role, perms, profile_picture) VALUES 
('Alice', 'Walker', 'alice@sfsu.edu', '$2a$11$xShPR7hLQ3EyQaNqyGc6bumQ3EeRDdd.pyZ9tVdRNw4SdgjZyKWzG', 1, 3,"profilePic-1.png"), -- password: hashedpass1
('Bob', 'Smith', 'bob@sfsu.edu', '$2a$11$JZ/MtStzUtRoqOrG4dADH.TSIJml9F1po/z4aOjGLlHUr.PEGJUna', 0, 1,"profilePic-2.png"), -- ... hashedpass2
('Charlie', 'Johnson', 'charlie@sfsu.edu', '$2a$11$ZzkNDSUvcGgdMPK0ThwW7uFWYNS0iBWva8td4YhvrZqlTxm5Btx5e', 0, 0,"profilePic-3.png"), -- ... hashedpass3
('Dana', 'Lee', 'dana@sfsu.edu', '$2a$11$FKXo7/lqXQ8pOR3Z4lmRpOaYNHMIAZtsWAjAvdscHMWsCcrVC5tgW', 0, 2,"profilePic-4.png"), -- ... hashedpass4
('Eve', 'Brown', 'eve@sfsu.edu', '$2a$11$5rAGmqRrG/bTmOAvzcnvme8BfG1W/G7FuZ8hXFik1xwAkwnnw2ruS', 0, 2,"profilePic-5.png"); -- ... hashedpass5

-- Insert Categories
INSERT INTO categories (category_id, category_name, category_description) VALUES
(1, 'Electronics', 'Devices, gadgets, and digital gear'),
(2, 'Books', 'New and used books'),
(3, 'Services', 'Freelance and professional services');

-- Insert Keywords
INSERT INTO keywords (keyword_id, keyword, category_id) VALUES
(1, 'laptop', 1),
(2, 'camera', 1),
(3, 'novel', 2),
(4, 'editing', 3),
(5, 'tutoring', 3);

-- Insert Listings (Limiting to 5 listings per category)

-- Electronics Listings
INSERT INTO listings (seller_id, category_id, listing_name, listing_description, price, listing_status) VALUES
(1, 1, 'Used MacBook Pro', '2019 model in good condition.', 1000, 'active'),
(2, 1, 'Canon Camera', 'Used DSLR camera, includes lens and accessories.', 350, 'active'),
(3, 1, 'Sony Headphones', 'Noise-canceling headphones, like new.', 120, 'active'),
(4, 1, 'Samsung Refrigerator', 'Stainless steel, works perfectly.', 300, 'active'),
(5, 1, 'iPad Pro', '11-inch, WiFi, 64GB, in good condition.', 500, 'active');

-- Books Listings
INSERT INTO listings (seller_id, category_id, listing_name, listing_description, price, listing_status) VALUES
(1, 2, 'The Great Gatsby', 'Paperback edition, gently used.', 900, 'active'),
(2, 2, '1984 by George Orwell', 'Classic dystopian novel, gently used.', 8, 'active'),
(3, 2, 'Harry Potter Book Set', 'All 7 books in hardcover, excellent condition.', 60, 'active'),
(4, 2, 'To Kill a Mockingbird', 'Harper Lee classic novel, hardcover edition.', 12, 'active'),
(5, 2, 'The Catcher in the Rye', 'Salinger’s classic novel, used but in good condition.', 10, 'active');

-- Services Listings
INSERT INTO listings (seller_id, category_id, listing_name, listing_description, price, listing_status) VALUES
(1, 3, 'Math Tutoring', 'Hourly math tutoring for high school students.', 30, 'active'),
(2, 3, 'English Tutoring', 'Improve your English skills, all levels.', 800, 'active'),
(3, 3, 'Science Tutoring', 'Hourly tutoring for science subjects, all levels.', 35, 'active'),
(4, 3, 'Programming Tutoring', 'Learn programming from beginner to advanced levels.', 50, 'active'),
(5, 3, 'Editing Services', 'Professional editing services for essays and reports.', 25, 'active');

-- Insert Pictures (For Listings)
INSERT INTO pictures (listing_id, originalName, thumbnailName, display_order) VALUES
(1, 'listingOrg-macbook.jpg', 'listingThumb-macbook.jpeg', 0),
(2, 'listingOrg-canon.jpg', 'listingThumb-canon.jpeg', 0),
(3, 'listingOrg-headphones.jpg','listingThumb-headphones.jpeg', 0),
(4, 'listingOrg-fridge.jpg', 'listingThumb-fridge.jpeg', 0),
(5, 'listingOrg-ipad.jpg', 'listingThumb-ipad.jpeg', 0),

(6, 'listingOrg-gatsby.jpg', 'listingThumb-gatsby.jpeg', 0),
(7, 'listingOrg-1984.jpg', 'listingThumb-1984.jpeg', 0),
(8, 'listingOrg-potter.jpg', 'listingThumb-potter.jpeg', 0),
(9, 'listingOrg-mockingbird.jpg', 'listingThumb-mockingbird.jpeg', 0),
(10, 'listingOrg-rye.jpg', 'listingThumb-rye.jpeg', 0),

(11, 'listingOrg-editing.jpg', 'listingThumb-editing.jpeg', 0),
(12, 'listingOrg-math.jpg', 'listingThumb-math.jpeg', 0),
(13, 'listingOrg-coding.jpg', 'listingThumb-coding.jpeg', 0),
(14, 'listingOrg-science.jpg', 'listingThumb-science.jpeg', 0),
(15, 'listingOrg-english.jpg', 'listingThumb-english.jpeg', 0);

-- Insert Messages
INSERT INTO messages (listing_id, sender_id, reciever_id, message_text) VALUES
(1, 2, 1, 'Hi, is the MacBook Pro still available?'),
(2, 3, 2, 'Can you ship the book to my address?'),
(3, 1, 3, 'I’m interested in your tutoring service. Are you available weekends?'),
(4, 2, 4, 'Is the refrigerator still for sale?'),
(5, 1, 5, 'Do you offer group tutoring for math?'),
(6, 4, 1, 'Is the book still available for purchase?'),
(7, 3, 2, 'Do you ship internationally?'),
(8, 5, 3, 'I need help with English grammar. Are you available on weekends?'),
(9, 4, 2, 'I would like to buy your book set, are they in good condition?'),
(10, 5, 1, 'I’m interested in programming tutoring. Can you teach Python?');

-- Sample availability for listing_id = 3 
INSERT INTO availability (service_id, available_date, start_time, end_time)
VALUES 
(3, '2025-03-21', '08:00:00', '09:00:00'),
(3, '2025-03-21', '10:00:00', '11:00:00'),
(3, '2025-03-22', '14:00:00', '15:00:00');
