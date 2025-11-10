-- This script provides mock data for the Fishermen application.
-- It assumes that the tables have been created by Hibernate (ddl-auto=update).
-- Note: Timestamps are hardcoded for reproducibility. In a real scenario, these would be dynamic.

-- Clear existing data to prevent conflicts on re-run (optional, use with caution)
-- DELETE FROM reviews;
-- DELETE FROM payments;
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM fish_listings;
-- DELETE FROM users;


-- =================================================================
-- USERS
-- =================================================================
-- Passwords are in plain text as requested.
INSERT INTO users (id, username, email, password, first_name, last_name, role, profile_info, location, created_at) VALUES
('FISHER0001', 'captain_jack', 'jack.sparrow@sea.com', 'blackpearl', 'Jack', 'Sparrow', 'FISHERMAN', 'Experienced captain specializing in deep-sea tuna.', 'Port Royal', '2024-05-01 10:00:00'),
('FISHER0002', 'salty_sue', 'sue.storm@ocean.com', 'saltydog', 'Susan', 'Storm', 'FISHERMAN', 'Local expert in coastal fish like snapper and grouper.', 'Coastal City', '2024-05-01 11:30:00'),
('FISHER0003', 'ahab_returns', 'ahab@whales.com', 'mobydick', 'Ahab', 'M.', 'FISHERMAN', 'Sells a variety of fresh catches daily.', 'Nantucket', '2024-05-02 09:00:00'),
('BUY0001', 'alice_b', 'alice.b@email.com', 'password123', 'Alice', 'Brown', 'BUYER', 'Home cook looking for fresh fish for the family.', 'Maple Creek', '2024-05-03 14:00:00'),
('BUY0002', 'bob_c', 'bob.c@email.com', 'password123', 'Bob', 'Carter', 'BUYER', 'Restaurant owner sourcing local seafood.', 'Metro City', '2024-05-03 15:20:00'),
('BUY0003', 'charlie_d', 'charlie.d@email.com', 'password123', 'Charlie', 'Davis', 'BUYER', 'Loves grilling fish on the weekend.', 'Suburbia', '2024-05-04 18:00:00');


-- =================================================================
-- FISH LISTINGS
-- =================================================================
-- Note: id is auto-generated, so we don't specify it.
INSERT INTO fish_listings (
    fish_type, weight_in_kg, price, photo_url, catch_date, status, fisherman_id, created_at, location
) VALUES
('Anchovy', 1.2, 8.50, 'https://example.com/images/anchovy.jpg', '2024-05-10 08:00:00', 'AVAILABLE', 'FISHER0001', '2024-05-10 10:00:00', 'Phuket'),
('Bluefin Tuna', 30.0, 45.00, 'https://example.com/images/bluefin_tuna.jpg', '2024-05-09 06:00:00', 'AVAILABLE', 'FISHER0002', '2024-05-09 08:00:00', 'Songkhla'),
('Carp', 3.5, 10.00, 'https://example.com/images/carp.jpg', '2024-05-11 09:30:00', 'AVAILABLE', 'FISHER0003', '2024-05-11 11:00:00', 'Chiang Mai'),
('Catfish', 4.0, 12.00, 'https://example.com/images/catfish.jpg', '2024-05-12 07:00:00', 'SOLD', 'FISHER0001', '2024-05-12 09:00:00', 'Nakhon Sawan'),
('Cod', 8.0, 14.00, 'https://example.com/images/cod.jpg', '2024-05-08 10:30:00', 'AVAILABLE', 'FISHER0002', '2024-05-08 12:00:00', 'Trang'),
('Eel', 2.5, 16.50, 'https://example.com/images/eel.jpg', '2024-05-10 14:00:00', 'AVAILABLE', 'FISHER0003', '2024-05-10 16:00:00', 'Phang Nga'),
('Herring', 1.8, 9.00, 'https://example.com/images/herring.jpg', '2024-05-09 08:30:00', 'AVAILABLE', 'FISHER0001', '2024-05-09 10:00:00', 'Krabi'),
('Kingfish', 10.5, 22.00, 'https://example.com/images/kingfish.jpg', '2024-05-11 07:45:00', 'AVAILABLE', 'FISHER0002', '2024-05-11 09:45:00', 'Phuket'),
('Mackerel', 3.0, 13.50, 'https://example.com/images/mackerel.jpg', '2024-05-12 06:15:00', 'SOLD', 'FISHER0003', '2024-05-12 08:00:00', 'Pattani'),
('Pollock', 6.0, 15.00, 'https://example.com/images/pollock.jpg', '2024-05-09 09:00:00', 'AVAILABLE', 'FISHER0001', '2024-05-09 11:00:00', 'Songkhla'),
('Pomfret', 4.2, 18.75, 'https://example.com/images/pomfret.jpg', '2024-05-10 05:30:00', 'AVAILABLE', 'FISHER0002', '2024-05-10 07:00:00', 'Phuket'),
('Salmon', 5.5, 25.00, 'https://example.com/images/salmon.jpg', '2024-05-11 10:00:00', 'AVAILABLE', 'FISHER0003', '2024-05-11 12:00:00', 'Bangkok'),
('Sea Bass', 7.2, 20.00, 'https://example.com/images/seabass.jpg', '2024-05-08 06:00:00', 'SOLD', 'FISHER0001', '2024-05-08 08:00:00', 'Krabi'),
('Snapper', 5.8, 17.50, 'https://example.com/images/snapper.jpg', '2024-05-10 09:00:00', 'AVAILABLE', 'FISHER0002', '2024-05-10 11:00:00', 'Trang'),
('Swordfish', 25.0, 28.00, 'https://example.com/images/swordfish.jpg', '2024-05-12 06:00:00', 'UNAVAILABLE', 'FISHER0003', '2024-05-12 09:00:00', 'Phuket'),
('Trout', 4.0, 19.00, 'https://example.com/images/trout.jpg', '2024-05-09 07:30:00', 'AVAILABLE', 'FISHER0001', '2024-05-09 09:00:00', 'Chiang Mai'),
('Tuna', 12.0, 21.00, 'https://example.com/images/tuna.jpg', '2024-05-10 08:00:00', 'AVAILABLE', 'FISHER0002', '2024-05-10 10:00:00', 'Phuket'),
('Yellowtail', 9.0, 23.00, 'https://example.com/images/yellowtail.jpg', '2024-05-11 08:15:00', 'AVAILABLE', 'FISHER0003', '2024-05-11 10:15:00', 'Songkhla');



-- =================================================================
-- ORDERS & ORDER ITEMS
-- =================================================================

-- Order 1: Alice buys Red Snapper and Grouper
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD001', '2024-05-11 12:00:00', 'COMPLETED', 289.80, 'BUY0001');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD001', 2, 2.0, 18.00), -- 2kg of Red Snapper
('ORD001', 4, 1.5, 16.50); -- 1.5kg of Grouper
-- Note: Manually update total_price in orders table: (2.0 * 18.00) + (1.5 * 16.50) = 36 + 24.75 = 60.75. Let's assume a mistake in manual entry and correct it.
UPDATE orders SET total_price = 60.75 WHERE id = 'ORD001';


-- Order 2: Bob (restaurant owner) buys a lot of Tuna
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD002', '2024-05-11 14:30:00', 'CONFIRMED', 225.00, 'BUY0002');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD002', 1, 10.0, 22.50); -- 10kg of Yellowfin Tuna


-- Order 3: Charlie buys Cod and Salmon
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD003', '2024-05-12 10:00:00', 'PENDING', 99.00, 'BUY0003');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD003', 5, 3.0, 12.00), -- 3kg of Cod
('ORD003', 6, 2.5, 25.00); -- 2.5kg of Salmon
-- Correcting total price: (3.0 * 12.00) + (2.5 * 25.00) = 36 + 62.5 = 98.50
UPDATE orders SET total_price = 98.50 WHERE id = 'ORD003';


-- =================================================================
-- PAYMENTS
-- =================================================================
-- Note: id is auto-generated.

-- Payment for Order 1
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD001', 60.75, 'SUCCESSFUL', 'txn_1a2b3c4d5e6f', '2024-05-11 12:01:00');

-- Payment for Order 2
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD002', 225.00, 'SUCCESSFUL', 'txn_7g8h9i0j1k2l', '2024-05-11 14:31:00');

-- No payment for Order 3 yet as it is PENDING


-- =================================================================
-- REVIEWS
-- =================================================================
-- Note: id is auto-generated.

-- Review from Alice for the Red Snapper (order_item.id = 1)
INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
(5, 'Absolutely fantastic! The snapper was incredibly fresh and perfect for my recipe. Arrived well-packaged and on time.', 'BUY0001', 1, '2024-05-13 18:00:00');

-- Review from Alice for the Grouper (order_item.id = 2)
INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
(4, 'Very good quality grouper. A little smaller than I expected but tasted great. Would buy again.', 'BUY0001', 2, '2024-05-13 18:05:00');

-- Review from Bob for the Tuna (order_item.id = 3)
INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
(5, 'Excellent quality tuna, perfect for our restaurant''s sushi and sashimi dishes. Consistent quality, will be a regular customer.', 'BUY0002', 3, '2024-05-14 11:00:00');


-- =================================================================
-- Update sequences for auto-generated IDs to avoid conflicts
-- This is good practice if you are inserting data with explicit IDs and also have auto-incrementing.
-- Since we are not setting IDs for auto-increment tables, we can find the max and set the sequence.
-- Note: This syntax is for PostgreSQL.
-- =================================================================
SELECT setval('fish_listings_id_seq', (SELECT MAX(id) FROM fish_listings));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));