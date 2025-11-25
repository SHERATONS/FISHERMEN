-- This script provides mock data for the Fishermen application.
-- It assumes that the tables have been created by Hibernate (ddl-auto=update).
-- Note: Timestamps are hardcoded for reproducibility. In a real scenario, these would be dynamic.

-- Clear existing data and reset sequences
TRUNCATE TABLE reviews, payments, order_items, orders, fish_listings, users RESTART IDENTITY CASCADE;

-- =================================================================
-- USERS (EXPANDED)
-- =================================================================
INSERT INTO users (id, username, email, password, first_name, last_name, role, profile_info, location, created_at) VALUES
-- Existing users remain unchanged
('FISHER0001', 'captain_jack', 'jack.sparrow@sea.com', 'blackpearl', 'Jack', 'Sparrow', 'FISHERMAN', 'Experienced captain specializing in deep-sea tuna.', 'Port Royal', '2024-05-01 10:00:00'),
('FISHER0002', 'salty_sue', 'sue.storm@ocean.com', 'saltydog', 'Susan', 'Storm', 'FISHERMAN', 'Local expert in coastal fish like snapper and grouper.', 'Coastal City', '2024-05-01 11:30:00'),
('FISHER0003', 'ahab_returns', 'ahab@whales.com', 'mobydick', 'Ahab', 'M.', 'FISHERMAN', 'Sells a variety of fresh catches daily.', 'Nantucket', '2024-05-02 09:00:00'),
('BUY0001', 'alice_b', 'alice.b@email.com', 'password123', 'Alice', 'Brown', 'BUYER', 'Home cook looking for fresh fish for the family.', 'Maple Creek', '2024-05-03 14:00:00'),
('BUY0002', 'bob_c', 'bob.c@email.com', 'password123', 'Bob', 'Carter', 'BUYER', 'Restaurant owner sourcing local seafood.', 'Metro City', '2024-05-03 15:20:00'),
('BUY0003', 'charlie_d', 'charlie.d@email.com', 'password123', 'Charlie', 'Davis', 'BUYER', 'Loves grilling fish on the weekend.', 'Suburbia', '2024-05-04 18:00:00'),

-- Additional Fishermen
('FISHER0004', 'ocean_mike', 'mike.fisher@waves.com', 'deepblue', 'Michael', 'Fisher', 'FISHERMAN', 'Third-generation fisherman specializing in salmon and trout.', 'Pacific Harbor', '2024-05-05 08:00:00'),
('FISHER0005', 'sea_captain_anna', 'anna.seas@marine.com', 'anchorage', 'Anna', 'Seas', 'FISHERMAN', 'Expert in Mediterranean fish varieties and sustainable fishing.', 'Marina Bay', '2024-05-05 09:30:00'),
('FISHER0006', 'cod_master_tom', 'tom.cod@arctic.com', 'iceberg', 'Thomas', 'Cod', 'FISHERMAN', 'Arctic fishing specialist with 20 years experience.', 'Northern Port', '2024-05-06 07:00:00'),
('FISHER0007', 'tropical_fisher', 'maria.tropical@coral.com', 'reeflife', 'Maria', 'Coral', 'FISHERMAN', 'Tropical fish expert from warm water regions.', 'Coral Bay', '2024-05-06 10:15:00'),

-- Additional Buyers
('BUY0004', 'chef_david', 'david.chef@restaurant.com', 'culinary123', 'David', 'Wilson', 'BUYER', 'Head chef at fine dining restaurant, seeks premium seafood.', 'Downtown', '2024-05-07 11:00:00'),
('BUY0005', 'fish_lover_emma', 'emma.fish@home.com', 'seafood456', 'Emma', 'Johnson', 'BUYER', 'Seafood enthusiast who cooks for large family gatherings.', 'Riverside', '2024-05-07 14:30:00'),
('BUY0006', 'market_owner_frank', 'frank.market@wholesale.com', 'wholesale789', 'Frank', 'Martinez', 'BUYER', 'Fish market owner buying in bulk for retail.', 'Market District', '2024-05-08 09:00:00'),
('BUY0007', 'home_cook_lisa', 'lisa.cook@family.com', 'homemade321', 'Lisa', 'Anderson', 'BUYER', 'Health-conscious home cook focusing on fresh fish meals.', 'Suburban Hills', '2024-05-08 16:00:00'),
('BUY0008', 'sushi_master_ken', 'ken.sushi@japanese.com', 'sashimi654', 'Ken', 'Tanaka', 'BUYER', 'Sushi restaurant owner requiring highest quality fish.', 'Little Tokyo', '2024-05-09 12:00:00');

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
-- ORDERS & ORDER ITEMS (EXPANDED AND CORRECTED)
-- =================================================================

-- Order 1: Alice buys Anchovy and Bluefin Tuna (CORRECTED)
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD001', '2024-05-11 12:00:00', 'SHIPPED', 0, 'BUY0001');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD001', 2, 2.0, 235.00),  -- 2kg Anchovy (id=2, price=235)
('ORD001', 4, 1.5, 7920.00); -- 1.5kg Bluefin Tuna (id=4, price=7920)

UPDATE orders SET total_price = (2.0 * 235.00 + 1.5 * 7920.00) WHERE id = 'ORD001';

-- Order 2: Bob buys Snapper (CORRECTED)
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD002', '2024-05-11 14:30:00', 'COMPLETED', 0, 'BUY0002');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD002', 21, 10.0, 1370.00); -- 10kg Snapper (id=21, price=1370)

UPDATE orders SET total_price = (10.0 * 1370.00) WHERE id = 'ORD002';

-- Order 3: Charlie buys Herring and Salmon
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD003', '2024-05-12 10:00:00', 'PENDING', 0, 'BUY0003');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD003', 11, 3.0, 430.00),  -- 3kg Herring (id=11, price=430)
('ORD003', 18, 2.5, 1260.00); -- 2.5kg Salmon (id=18, price=1260)

UPDATE orders SET total_price = (3.0 * 430.00 + 2.5 * 1260.00) WHERE id = 'ORD003';

-- Order 4: Chef David buys premium fish
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD004', '2024-05-13 09:00:00', 'COMPLETED', 0, 'BUY0004');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD004', 3, 5.0, 5400.00),   -- 5kg Bluefin Tuna (id=3, price=5400)
('ORD004', 13, 3.0, 1260.00),  -- 3kg Pomfret (id=13, price=1260)
('ORD004', 23, 2.0, 2340.00);  -- 2kg Yellowtail (id=23, price=2340)

UPDATE orders SET total_price = (5.0 * 5400.00 + 3.0 * 1260.00 + 2.0 * 2340.00) WHERE id = 'ORD004';

-- Order 5: Emma buys family fish
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD005', '2024-05-13 15:00:00', 'SHIPPED', 0, 'BUY0005');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD005', 9, 4.0, 1080.00),   -- 4kg Cod (id=9, price=1080)
('ORD005', 17, 3.0, 650.00);   -- 3kg Trout (id=17, price=650)

UPDATE orders SET total_price = (4.0 * 1080.00 + 3.0 * 650.00) WHERE id = 'ORD005';

-- Order 6: Frank buys bulk fish
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD006', '2024-05-14 08:00:00', 'COMPLETED', 0, 'BUY0006');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD006', 11, 15.0, 430.00),  -- 15kg Herring (id=11, price=430)
('ORD006', 15, 8.0, 360.00),   -- 8kg Mackerel (id=15, price=360)
('ORD006', 5, 6.0, 290.00);    -- 6kg Carp (id=5, price=290)

UPDATE orders SET total_price = (15.0 * 430.00 + 8.0 * 360.00 + 6.0 * 290.00) WHERE id = 'ORD006';

-- Order 7: Lisa buys healthy fish
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD007', '2024-05-14 11:00:00', 'CANCELLED', 0, 'BUY0007');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD007', 17, 2.0, 650.00),   -- 2kg Trout (id=17, price=650)
('ORD007', 19, 1.5, 790.00);   -- 1.5kg Sea Bass (id=19, price=790)

UPDATE orders SET total_price = (2.0 * 650.00 + 1.5 * 790.00) WHERE id = 'ORD007';

-- Order 8: Ken buys sushi-grade fish
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD008', '2024-05-15 07:00:00', 'COMPLETED', 0, 'BUY0008');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD008', 4, 3.0, 7920.00),   -- 3kg Bluefin Tuna (id=4, price=7920)
('ORD008', 24, 2.0, 2700.00);  -- 2kg Yellowtail (id=24, price=2700)

UPDATE orders SET total_price = (3.0 * 7920.00 + 2.0 * 2700.00) WHERE id = 'ORD008';

-- Order 9: Alice's second order
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD009', '2024-05-15 14:00:00', 'SHIPPED', 0, 'BUY0001');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD009', 10, 2.5, 900.00),   -- 2.5kg Cod (id=10, price=900)
('ORD009', 16, 1.0, 415.00);   -- 1kg Mackerel (id=16, price=415)

UPDATE orders SET total_price = (2.5 * 900.00 + 1.0 * 415.00) WHERE id = 'ORD009';

-- Order 10: Bob's restaurant order
INSERT INTO orders (id, order_date, status, total_price, buyer_id) VALUES
('ORD010', '2024-05-16 10:00:00', 'PENDING', 0, 'BUY0002');

INSERT INTO order_items (order_id, fish_listing_id, quantity, price_at_purchase) VALUES
('ORD010', 22, 5.0, 1620.00),  -- 5kg Snapper (id=22, price=1620)
('ORD010', 20, 3.0, 1000.00);  -- 3kg Sea Bass (id=20, price=1000)

UPDATE orders SET total_price = (5.0 * 1620.00 + 3.0 * 1000.00) WHERE id = 'ORD010';

-- =================================================================
-- PAYMENTS (EXPANDED)
-- =================================================================

-- Payment for Order 1 (CORRECTED)
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD001', 12350.00, 'SUCCESSFUL', 'txn_1a2b3c4d5e6f', '2024-05-11 12:01:00');

-- Payment for Order 2 (CORRECTED)
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD002', 13700.00, 'SUCCESSFUL', 'txn_7g8h9i0j1k2l', '2024-05-11 14:31:00');

-- Payment for Order 4
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD004', 35460.00, 'SUCCESSFUL', 'txn_chef_premium', '2024-05-13 09:05:00');

-- Payment for Order 5
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD005', 6270.00, 'SUCCESSFUL', 'txn_family_fish', '2024-05-13 15:05:00');

-- Payment for Order 6
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD006', 10080.00, 'SUCCESSFUL', 'txn_bulk_order', '2024-05-14 08:05:00');

-- Payment for Order 8
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD008', 29160.00, 'SUCCESSFUL', 'txn_sushi_grade', '2024-05-15 07:05:00');

-- Payment for Order 9
INSERT INTO payments (order_id, amount, status, transaction_id, payment_date) VALUES
('ORD009', 2665.00, 'SUCCESSFUL', 'txn_alice_second', '2024-05-15 14:05:00');

-- =================================================================
-- REVIEWS (EXPANDED AND CORRECTED)
-- =================================================================

-- Reviews for Order 1 (SHIPPED - can be reviewed)
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (4, 'Good quality anchovy, fresh and well-packaged. Perfect for my pasta sauce!', 'BUY0001', 1, '2024-05-12 18:00:00'),
-- (5, 'Exceptional bluefin tuna! The quality was restaurant-grade. Will definitely order again.', 'BUY0001', 2, '2024-05-12 18:15:00');

-- -- Reviews for Order 2 (COMPLETED)
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (5, 'Perfect snapper for our restaurant. Customers loved the freshness and taste. Excellent supplier!', 'BUY0002', 3, '2024-05-12 20:00:00');

-- -- Reviews for Order 4 (COMPLETED)
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (5, 'Outstanding bluefin tuna! Perfect for our high-end sashimi menu. Impeccable quality.', 'BUY0004', 4, '2024-05-14 10:00:00'),
-- (4, 'Very good pomfret, fresh and flavorful. Slight delay in delivery but quality made up for it.', 'BUY0004', 5, '2024-05-14 10:15:00'),
-- (5, 'Excellent yellowtail! Perfect texture and taste for our Japanese dishes. Highly recommended.', 'BUY0004', 6, '2024-05-14 10:30:00');

-- -- Reviews for Order 6 (COMPLETED)
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (4, 'Good bulk herring order. Fresh fish, well-packaged. Great for our market customers.', 'BUY0006', 9, '2024-05-15 09:00:00'),
-- (3, 'Mackerel was okay, some pieces were better than others. Decent for the price point.', 'BUY0006', 10, '2024-05-15 09:15:00'),
-- (4, 'Solid carp quality. Good for our budget-conscious customers. Reliable supplier.', 'BUY0006', 11, '2024-05-15 09:30:00');

-- -- Reviews for Order 8 (COMPLETED)
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (5, 'Absolutely perfect bluefin tuna! Our sushi customers were amazed by the quality. Top-tier fish!', 'BUY0008', 12, '2024-05-16 08:00:00'),
-- (5, 'Exceptional yellowtail! Perfect for sashimi and nigiri. Will be ordering regularly from this supplier.', 'BUY0008', 13, '2024-05-16 08:15:00');

-- -- Additional diverse reviews
-- INSERT INTO reviews (rating, comment, buyer_id, order_item_id, review_date) VALUES
-- (2, 'Fish arrived later than expected and quality was not as fresh as hoped. Disappointed with this order.', 'BUY0005', 7, '2024-05-14 19:00:00'),
-- (1, 'Very poor quality trout. Fish smelled off and had to throw it away. Requesting refund.', 'BUY0005', 8, '2024-05-14 19:15:00');

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

SELECT id, fish_type, photo_url FROM fish_listings ORDER BY id;
