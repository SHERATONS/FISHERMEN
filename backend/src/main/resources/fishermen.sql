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
-- Anchovy (Commonly found in the Mediterranean and Gulf of Thailand)
('Anchovy', 1.0, 180.00, '/images/anchovy.jpg', '2025-05-10 08:00:00', 'SENT_FRESH', 'FISHER0001', '2025-05-10 10:00:00', 'Gulf of Thailand'),
('Anchovy', 1.0, 235.00, '/images/anchovy2.jpg', '2025-05-13 07:00:00', 'SENT_FRESH', 'FISHER0002', '2025-05-13 09:00:00', 'Mediterranean Sea'),

-- Bluefin Tuna (Oceanic, highly migratory)
('Bluefin Tuna', 1.0, 5400.00, '/images/BluefinTuna.jpg', '2025-05-09 06:00:00', 'SENT_FRESH', 'FISHER0002', '2025-05-09 08:00:00', 'Atlantic Ocean'),
('Bluefin Tuna', 1.0, 7920.00, '/images/BluefinTuna2.jpg', '2025-05-14 05:30:00', 'SENT_FRESH', 'FISHER0001', '2025-05-14 08:00:00', 'Pacific Ocean'),

-- Carp (Freshwater, but using an associated water body name)
('Carp', 1.0, 290.00, '/images/carp.jpg', '2025-05-11 09:30:00', 'SENT_FRESH', 'FISHER0003', '2025-05-11 11:00:00', 'Black Sea (Azov area)'),
('Carp', 1.0, 380.00, '/images/carp_2.jpg', '2025-05-13 10:00:00', 'SENT_FROZEN', 'FISHER0001', '2025-05-13 12:00:00', 'Caspian Sea Basin'),

-- Catfish (Freshwater, but using an associated water body name)
('Catfish', 1.0, 270.00, '/images/catfish.jpg', '2025-05-12 07:00:00', 'SENT_FROZEN', 'FISHER0001', '2025-05-12 09:00:00', 'Gulf of Mexico'),
('Catfish', 1.0, 325.00, '/images/catfish_small.jpg', '2025-05-14 06:00:00', 'SENT_FRESH', 'FISHER0003', '2025-05-14 08:00:00', 'South China Sea'),

-- Cod (Major fishing grounds in the North Atlantic and Pacific)
('Cod', 1.0, 1080.00, '/images/cod.jpg', '2025-05-08 10:30:00', 'SENT_FRESH', 'FISHER0002', '2025-05-08 12:00:00', 'Barents Sea'),
('Cod', 1.0, 900.00, '/images/cod_2.jpg', '2025-05-12 11:00:00', 'SENT_FRESH', 'FISHER0002', '2025-05-12 13:00:00', 'North Sea'),

-- Herring (Large fisheries in the North Atlantic and Pacific)
('Herring', 1.0, 430.00, '/images/herring.jpg', '2025-05-09 08:30:00', 'SENT_FRESH', 'FISHER0001', '2025-05-09 10:00:00', 'Baltic Sea'),
('Herring', 1.0, 520.00, '/images/herring_2.jpg', '2025-05-12 09:00:00', 'SENT_FRESH', 'FISHER0002', '2025-05-12 10:30:00', 'Norwegian Sea'),

-- Mackerel (Coastal pelagic species)
('Mackerel', 1.0, 360.00, '/images/mackerel.jpg', '2025-05-12 06:15:00', 'SENT_FROZEN', 'FISHER0003', '2025-05-12 08:00:00', 'Celtic Sea'),
('Mackerel', 1.0, 415.00, '/images/mackerel_2.jpg', '2025-05-14 07:00:00', 'SENT_FRESH', 'FISHER0001', '2025-05-14 09:00:00', 'English Channel'),

-- Pomfret (Tropical and temperate marine waters)
('Pomfret', 1.0, 1260.00, '/images/pomfret.jpg', '2025-05-10 05:30:00', 'SENT_FRESH', 'FISHER0002', '2025-05-10 07:00:00', 'Andaman Sea'),
('Pomfret', 1.0, 1510.00, '/images/pomfret_2.jpg', '2025-05-14 06:00:00', 'SENT_FRESH', 'FISHER0003', '2025-05-14 08:00:00', 'Persian Gulf'),

-- Salmon (Anadromous, but commonly associated with oceans/bays)
('Salmon', 1.0, 1000.00, '/images/salmon.jpg', '2025-05-11 10:00:00', 'SENT_FRESH', 'FISHER0003', '2025-05-11 12:00:00', 'North Atlantic Ocean'),
('Salmon', 1.0, 1260.00, '/images/salmon_2.jpg', '2025-05-13 09:00:00', 'SENT_FRESH', 'FISHER0001', '2025-05-13 11:00:00', 'Gulf of Alaska'),

-- Sea Bass (Coastal waters and estuaries)
('Sea Bass', 1.0, 790.00, '/images/seabass.jpg', '2025-05-08 06:00:00', 'SENT_FROZEN', 'FISHER0001', '2025-05-08 08:00:00', 'Adriatic Sea'),
('Sea Bass', 1.0, 1000.00, '/images/seabass_2.jpg', '2025-05-12 07:30:00', 'SENT_FRESH', 'FISHER0002', '2025-05-12 09:30:00', 'Ionian Sea'),

-- Snapper (Found in tropical and subtropical regions)
('Snapper', 1.0, 1370.00, '/images/snapper.jpg', '2025-05-10 09:00:00', 'SENT_FRESH', 'FISHER0002', '2025-05-10 11:00:00', 'Caribbean Sea'),
('Snapper', 1.0, 1620.00, '/images/snapper_2.jpg', '2025-05-14 08:30:00', 'SENT_FRESH', 'FISHER0003', '2025-05-14 10:30:00', 'Coral Sea'),

-- Trout (Freshwater/Anadromous, using associated sea/bay names)
('Trout', 1.0, 650.00, '/images/trout.jpg', '2025-05-09 07:30:00', 'SENT_FRESH', 'FISHER0001', '2025-05-09 09:00:00', 'Great Lakes (Connecting to the Atlantic)'),
('Trout', 1.0, 900.00, '/images/trout_2.jpg', '2025-05-12 08:00:00', 'SENT_FRESH', 'FISHER0003', '2025-05-12 09:30:00', 'Chesapeake Bay'),

-- Yellowtail (e.g., Japanese Amberjack, found in Pacific waters)
('Yellowtail', 1.0, 2340.00, '/images/yellowtail.jpg', '2025-05-11 08:15:00', 'SENT_FRESH', 'FISHER0003', '2025-05-11 10:15:00', 'Sea of Japan'),
('Yellowtail', 1.0, 2700.00, '/images/yellowtail_2.jpg', '2025-05-13 07:45:00', 'SENT_FRESH', 'FISHER0002', '2025-05-13 09:45:00', 'South China Sea');


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