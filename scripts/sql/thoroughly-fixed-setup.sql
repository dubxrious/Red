-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tour_availability;
DROP TABLE IF EXISTS tour_features;
DROP TABLE IF EXISTS tour_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT CHECK (role IN ('user', 'vendor', 'admin')) DEFAULT 'user'
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tours table
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  destination_id UUID NOT NULL REFERENCES destinations(id),
  duration_days INTEGER,
  duration_hours INTEGER,
  duration_minutes INTEGER,
  retail_price DECIMAL NOT NULL,
  discounted_price DECIMAL,
  rating_exact_score DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_0_src TEXT NOT NULL,
  image_1_src TEXT,
  image_2_src TEXT,
  image_3_src TEXT,
  image_4_src TEXT,
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vendor_id UUID REFERENCES vendors(id),
  max_capacity INTEGER,
  min_booking_notice INTEGER,
  infant_age INTEGER,
  child_age INTEGER,
  pickup_available BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER
);

-- Add index for faster category and destination lookups
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours(category_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_vendor ON tours(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(featured, featured_order);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tour tags table
CREATE TABLE IF NOT EXISTS tour_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(tour_id, tag_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tour_tags_tour ON tour_tags(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_tags_tag ON tour_tags(tag_id);

-- Tour features table
CREATE TABLE IF NOT EXISTS tour_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tour_features_tour ON tour_features(tour_id);

-- Tour availability table
CREATE TABLE IF NOT EXISTS tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spots_available INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tour_id, date)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tour_availability_tour ON tour_availability(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_availability_date ON tour_availability(date);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  adults INTEGER NOT NULL CHECK (adults >= 0),
  children INTEGER NOT NULL CHECK (children >= 0),
  infants INTEGER NOT NULL DEFAULT 0 CHECK (infants >= 0),
  pickup_required BOOLEAN DEFAULT FALSE,
  pickup_location TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  special_requests TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  payment_id TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_tour ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_tour ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create trigger to update rating on tours when reviews are changed
CREATE OR REPLACE FUNCTION update_tour_rating() RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
  review_count INTEGER;
BEGIN
  -- Calculate average rating
  SELECT AVG(rating), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews
  WHERE tour_id = NEW.tour_id AND status = 'approved';

  -- Update the tour
  UPDATE tours
  SET rating_exact_score = COALESCE(avg_rating, 0),
      review_count = COALESCE(review_count, 0)
  WHERE id = NEW.tour_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS review_update_rating ON reviews;
CREATE TRIGGER review_update_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_tour_rating();

-- Function to get vendor stats
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_id UUID)
RETURNS TABLE (
  total_tours INTEGER,
  pending_bookings INTEGER,
  monthly_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH tour_stats AS (
    SELECT
      COUNT(*) AS tour_count,
      (
        SELECT COUNT(*)
        FROM tours t
        JOIN bookings b ON t.id = b.tour_id
        WHERE t.vendor_id = $1 AND b.status = 'pending'
      ) AS pending_bookings,
      (
        SELECT COALESCE(SUM(
          CASE
            WHEN b.payment_status = 'paid' THEN
              CASE
                WHEN t.discounted_price IS NOT NULL THEN t.discounted_price
                ELSE t.retail_price
              END * (b.adults + b.children)
            ELSE 0
          END
        ), 0)
        FROM tours t
        JOIN bookings b ON t.id = b.tour_id
        WHERE t.vendor_id = $1
          AND b.created_at >= date_trunc('month', CURRENT_DATE)
      ) AS monthly_revenue
    FROM tours
    WHERE vendor_id = $1
  )
  SELECT
    tour_count AS total_tours,
    pending_bookings,
    monthly_revenue
  FROM tour_stats;
END;
$$ LANGUAGE plpgsql;

-- Insert initial admin user
INSERT INTO users (email, full_name, role) 
VALUES ('admin@example.com', 'Admin User', 'admin');

-- Insert categories
INSERT INTO categories (name, slug, description, image)
VALUES 
('Sailing', 'sailing', 'Explore the waters with our sailing tours', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg'),
('Diving', 'diving', 'Discover underwater beauty with our diving experiences', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0c/03/68/e7.jpg'),
('Snorkeling', 'snorkeling', 'Experience the marine life with our snorkeling trips', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/09/a9/0f/45.jpg'),
('Day Trips', 'day-trips', 'Enjoy a full day of adventure with our day trips', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg'),
('Multi-day Tours', 'multi-day-tours', 'Embark on a journey lasting multiple days', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg');

-- Insert destinations
INSERT INTO destinations (name, slug, description, image)
VALUES 
('Hurghada', 'hurghada', 'A beautiful beach resort town along Egypt''s Red Sea coast', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg'),
('Sharm El Sheikh', 'sharm-el-sheikh', 'An Egyptian resort town between the desert of the Sinai Peninsula and the Red Sea', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg'),
('Aswan', 'aswan', 'A city in the south of Egypt, located on the east bank of the Nile', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg'),
('Luxor', 'luxor', 'A city on the east bank of the Nile River in southern Egypt', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/08/52/4b/37.jpg');

-- Insert tags
INSERT INTO tags (name, slug, description)
VALUES 
('Beach', 'beach', 'Tours that involve beach activities'),
('Adventure', 'adventure', 'Tours focused on thrilling experiences'),
('Wildlife', 'wildlife', 'Tours showcasing local wildlife'),
('Cultural', 'cultural', 'Tours highlighting local culture and heritage'),
('Family-friendly', 'family-friendly', 'Tours suitable for all family members');

-- Sample tour data
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_hours, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Orange Bay Island Snorkeling Trip', 
  'orange-bay-island-snorkeling-trip', 
  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.', 
  (SELECT id FROM categories WHERE slug = 'snorkeling'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  8, 
  16.0, 
  15.12,
  4.8,
  1702,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg',
  'active',
  true,
  true
);

-- Add feature for the sample tour
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip'),
  'clock',
  'Duration',
  '8 hours'
),
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip'),
  'tag',
  'Price',
  '$15.12'
),
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Add tags for the sample tour
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES 
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip'),
  (SELECT id FROM tags WHERE slug = 'beach')
),
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip'),
  (SELECT id FROM tags WHERE slug = 'wildlife')
);

-- Additional sample tour
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '4-Days Nile Cruise From Aswan To Luxor', 
  '4-days-nile-cruise-from-aswan-to-luxor', 
  'Sail down one of the world''s most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you''ll disembark for guided visits to the region''s most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple.', 
  (SELECT id FROM categories WHERE slug = 'multi-day-tours'), 
  (SELECT id FROM destinations WHERE slug = 'aswan'), 
  4, 
  349.0, 
  349.0,
  4.8,
  2821,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg',
  'active',
  false,
  true
);

-- Add feature for the second sample tour
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor'),
  'clock',
  'Duration',
  '4 days'
),
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor'),
  'tag',
  'Price',
  '$349.00'
);

-- Add tags for the second sample tour
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES 
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor'),
  (SELECT id FROM tags WHERE slug = 'cultural')
),
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor'),
  (SELECT id FROM tags WHERE slug = 'adventure')
); -- Additional categories
INSERT INTO categories (name, slug, description, image) 
VALUES ('Glass Bottom Boat Tours', 'glass-bottom-boat-tours', 'Tours related to Glass Bottom Boat Tours', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/11/26/d8/fa.jpg');
INSERT INTO categories (name, slug, description, image) 
VALUES ('Nature and Wildlife Tours', 'nature-and-wildlife-tours', 'Tours related to Nature and Wildlife Tours', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/09/74/73/4c.jpg');
INSERT INTO categories (name, slug, description, image) 
VALUES ('Day Cruises', 'day-cruises', 'Tours related to Day Cruises', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/11/26/d8/fa.jpg');
INSERT INTO categories (name, slug, description, image) 
VALUES ('Dining Experiences', 'dining-experiences', 'Tours related to Dining Experiences', 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/e6/1d/b1.jpg');


-- Tour 1: Orange Bay Island Snorkeling Trip With Water Sports - Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Orange Bay Island Snorkeling Trip With Water Sports - Hurghada', 
  'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0', 
  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board, but national park admission fees are at your own expense.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  16, 
  15.12,
  4.8,
  1702,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg',
  'active',
  true,
  true
);

-- Features for tour 1
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0'),
  'tag',
  'Price',
  '$15.12'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 1
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'orange-bay-island-snorkeling-trip-with-water-sports---hurghada-0'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 2: 4-Days Nile Cruise From Aswan To Luxor including Abu Simbel and Hot Air Balloon
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '4-Days Nile Cruise From Aswan To Luxor including Abu Simbel and Hot Air Balloon', 
  '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1', 
  'Sail down one of the world''s most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you''ll disembark for guided visits to the region''s most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple. Tasty onboard meals are included, plus a personalized pickup from the airport, train station, or your Aswan hotel.', 
  (SELECT id FROM categories WHERE slug = 'multi-day-tours'), 
  (SELECT id FROM destinations WHERE slug = 'aswan'), 
  4, 
  NULL, 
  NULL, 
  349, 
  NULL,
  4.8,
  2821,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg',
  'active',
  true,
  true
);

-- Features for tour 2
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1'),
  'clock',
  'Duration',
  '4 days 0 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1'),
  'tag',
  'Price',
  '$349'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 2
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-1'),
  (SELECT id FROM tags WHERE name = 'Cultural')
);


-- Tour 3: Hurghada: Orange Bay, Snorkeling, Watersports, Lunch & Drinks
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Hurghada: Orange Bay, Snorkeling, Watersports, Lunch & Drinks', 
  'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2', 
  'Snorkel the spectacular coral reefs of Giftun Island, including Orange Bay, on this door-to-door day trip to the Giftun Island National Park. Spend your day swimming and snorkeling in the tropical waters, keeping an eye out for dolphins along the way, and have time to sunbathe and relax on the beach. Your day includes a delicious buffet lunch on board the boat, guide assistance, a breakfast sandwich, and free-flow soft drinks and water.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  16.5, 
  NULL,
  4.7,
  1646,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/15/30/8a/6d.jpg',
  'active',
  true,
  true
);

-- Features for tour 3
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2'),
  'tag',
  'Price',
  '$16.5'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 3
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'hurghada-orange-bay-snorkeling-watersports-lunch-drinks-2'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 4: Swimming with Dolphin VIP Snorkeling Sea Trip With Lunch and Transfer - Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Swimming with Dolphin VIP Snorkeling Sea Trip With Lunch and Transfer - Hurghada', 
  'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3', 
  'While in Hurghada, make the most of your proximity to one of the world''s top snorkeling and diving sites. Head out onto the Red Sea and cruise to Dolphin House where you can explore the underwater world by snorkel. As you continue, there will be more opportunities to jump off board and snorkel and explore. Includes lunch served on board.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  16, 
  14.4,
  4.7,
  961,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/8e/7e/85.jpg',
  'active',
  true,
  true
);

-- Features for tour 4
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3'),
  'tag',
  'Price',
  '$14.4'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 4
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'swimming-with-dolphin-vip-snorkeling-sea-trip-with-lunch-and-transfer---hurghada-3'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 5: Sharm El Sheikh: White Island and Ras Mohamed Cruise Adventure
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Sharm El Sheikh: White Island and Ras Mohamed Cruise Adventure', 
  'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4', 
  'Ras Mohammed National Park offers some of the Red Sea''s most vibrant coral reef. Experience it on this Sharm el Sheikh snorkeling cruise featuring professional guides to help with your gear and point out marine life. As well as lunch on board, enjoy time at the beautiful White Island sandbar. Please note that your package excludes park entrance fees, while snorkeling equipment is available as an upgrade.', 
  (SELECT id FROM categories WHERE slug = 'day-trips'), 
  (SELECT id FROM destinations WHERE slug = 'sharm-el-sheikh'), 
  NULL, 
  7, 
  NULL, 
  19.99, 
  NULL,
  4.7,
  1730,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg',
  'active',
  true,
  true
);

-- Features for tour 5
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  'clock',
  'Duration',
  '0 days 7 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  'tag',
  'Price',
  '$19.99'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 5
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-white-island-and-ras-mohamed-cruise-adventure-4'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 6: Diving Full Day 2 Stops Boat Trip For Beginners With Lunch and Transfer–Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Diving Full Day 2 Stops Boat Trip For Beginners With Lunch and Transfer–Hurghada', 
  'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5', 
  'The Red Sea coastline around Hurghada is home to an impressive haul of dive spots, but knowing where to dive or how to do it isn''t easy without local knowledge. Find the safest and scenic sites on a dive tour that''s led by a local PADI guide and tailored to suit beginners. Two dives are included, along with an onboard buffet lunch and time to snorkel, swim, or even ride a banana boat.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  16, 
  NULL,
  4.8,
  29,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0c/03/68/e7.jpg',
  'active',
  true,
  false
);

-- Features for tour 6
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  'tag',
  'Price',
  '$16'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 6
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
),
(
  (SELECT id FROM tours WHERE slug = 'diving-full-day-2-stops-boat-trip-for-beginners-with-lunch-and-transferhurghada-5'),
  (SELECT id FROM tags WHERE name = 'Family-friendly')
);


-- Tour 7: Hurghada: Royal Seascope Submarine cruise with Snorkel stop
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Hurghada: Royal Seascope Submarine cruise with Snorkel stop', 
  'hurghada-royal-seascope-submarine-cruise-with-snorkel-stop-6', 
  'Marvel at the Red Sea''s underwater life without getting wet on this Hurghada semi-submarine trip, complete with optional snorkel stop. Prebook to secure a place for your preferred time and date; and take a seat by the underwater windows to spy on everything from exotic fish to sea turtles. Finally, opt to join a snorkel session to immerse yourself fully in the reef life. Includes Hurghada hotel transfers, with other, select transfers at extra charge.', 
  (SELECT id FROM categories WHERE slug = 'glass-bottom-boat-tours'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  2, 
  NULL, 
  16.51, 
  NULL,
  4.1,
  69,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/11/26/d8/fa.jpg',
  'active',
  true,
  false
);

-- Features for tour 7
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-royal-seascope-submarine-cruise-with-snorkel-stop-6'),
  'clock',
  'Duration',
  '0 days 2 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-royal-seascope-submarine-cruise-with-snorkel-stop-6'),
  'tag',
  'Price',
  '$16.51'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'hurghada-royal-seascope-submarine-cruise-with-snorkel-stop-6'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 7
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'hurghada-royal-seascope-submarine-cruise-with-snorkel-stop-6'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 8: Glass Bottom Boat Excursion in Sharm El Sheikh
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Glass Bottom Boat Excursion in Sharm El Sheikh', 
  'glass-bottom-boat-excursion-in-sharm-el-sheikh-7', 
  'Experience the breathtakingly beautiful coral reefs of the Red Sea in Sharm El Sheikh boarding on the glass bottom boat', 
  (SELECT id FROM categories WHERE slug = 'nature-and-wildlife-tours'), 
  (SELECT id FROM destinations WHERE slug = 'sharm-el-sheikh'), 
  NULL, 
  2, 
  NULL, 
  24, 
  NULL,
  4.8,
  125,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/09/74/73/4c.jpg',
  'active',
  true,
  false
);

-- Features for tour 8
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'glass-bottom-boat-excursion-in-sharm-el-sheikh-7'),
  'clock',
  'Duration',
  '0 days 2 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'glass-bottom-boat-excursion-in-sharm-el-sheikh-7'),
  'tag',
  'Price',
  '$24'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'glass-bottom-boat-excursion-in-sharm-el-sheikh-7'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 8
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'glass-bottom-boat-excursion-in-sharm-el-sheikh-7'),
  (SELECT id FROM tags WHERE name = 'Adventure')
);


-- Tour 9: Parasailing Fly With Transportation Fly in The Sky - Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Parasailing Fly With Transportation Fly in The Sky - Hurghada', 
  'parasailing-fly-with-transportation-fly-in-the-sky---hurghada-8', 
  'Plan an exciting adventure while visiting Egypt and explore the area from the sky during this Hurghada Parasailing Experience. This fun adventure takes you up to 164 feet (50 meters) into the sky as you fly from a speedboat below. Plus, to make your adventure a smooth one, hotel pickup from the Hurghada area is also included.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  1, 
  30, 
  5, 
  4.25,
  4.3,
  99,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/07/2c/0b/c7.jpg',
  'active',
  true,
  false
);

-- Features for tour 9
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-fly-with-transportation-fly-in-the-sky---hurghada-8'),
  'clock',
  'Duration',
  '0 days 1 hours 30 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-fly-with-transportation-fly-in-the-sky---hurghada-8'),
  'tag',
  'Price',
  '$4.25'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-fly-with-transportation-fly-in-the-sky---hurghada-8'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 9
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'parasailing-fly-with-transportation-fly-in-the-sky---hurghada-8'),
  (SELECT id FROM tags WHERE name = 'Adventure')
);


-- Tour 10: 4-Day 3-Night Nile Cruise from Aswan to Luxor including Abu Simbel, Air Balloon
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '4-Day 3-Night Nile Cruise from Aswan to Luxor including Abu Simbel, Air Balloon', 
  '4-day-3-night-nile-cruise-from-aswan-to-luxor-including-abu-simbel-air-balloon-9', 
  'Cruise along the Nile River, from Aswan to Luxor, on this 4-day experience. Glide by ancient riverbanks, with stops to visit sites such as the temples at Kom Ombo and Edfu, and Luxor''s celebrated temple complexes of Luxor and Karnak, all with a tour guide by your side to explain local history to you. Your package includes a sunrise hot-air balloon ride, but entrance fees are at your own expense.', 
  (SELECT id FROM categories WHERE slug = 'multi-day-tours'), 
  (SELECT id FROM destinations WHERE slug = 'aswan'), 
  4, 
  NULL, 
  NULL, 
  329, 
  NULL,
  4.6,
  594,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/26/45/7c.jpg',
  'active',
  true,
  false
);

-- Features for tour 10
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = '4-day-3-night-nile-cruise-from-aswan-to-luxor-including-abu-simbel-air-balloon-9'),
  'clock',
  'Duration',
  '4 days 0 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = '4-day-3-night-nile-cruise-from-aswan-to-luxor-including-abu-simbel-air-balloon-9'),
  'tag',
  'Price',
  '$329'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = '4-day-3-night-nile-cruise-from-aswan-to-luxor-including-abu-simbel-air-balloon-9'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 10
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = '4-day-3-night-nile-cruise-from-aswan-to-luxor-including-abu-simbel-air-balloon-9'),
  (SELECT id FROM tags WHERE name = 'Cultural')
);


-- Tour 11: 4-Days Nile Cruise From Aswan To Luxor including Abu Simbel and Hot Air Balloon
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '4-Days Nile Cruise From Aswan To Luxor including Abu Simbel and Hot Air Balloon', 
  '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-10', 
  'Discover royal tombs and regal temples on this 4-day Nile cruise, with an overland visit to the Abu Simbel Temples and a sunrise balloon trip over Luxor. Exploring with an Egyptologist guide, see Philae Temple, Kom Ombo, the Temple of Horus, the Valley of the Kings, and so much more. Your package includes transfers, guiding, the hot air balloon, a carriage ride and nine meals: entrance fees are at your expense.', 
  (SELECT id FROM categories WHERE slug = 'multi-day-tours'), 
  (SELECT id FROM destinations WHERE slug = 'aswan'), 
  4, 
  NULL, 
  NULL, 
  320, 
  NULL,
  4.6,
  487,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/ff/56/57.jpg',
  'active',
  true,
  false
);

-- Features for tour 11
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-10'),
  'clock',
  'Duration',
  '4 days 0 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-10'),
  'tag',
  'Price',
  '$320'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-10'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 11
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = '4-days-nile-cruise-from-aswan-to-luxor-including-abu-simbel-and-hot-air-balloon-10'),
  (SELECT id FROM tags WHERE name = 'Cultural')
);


-- Tour 12: Sharm El-Sheikh: Royal Seascope Submarine cruise in with pickup
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Sharm El-Sheikh: Royal Seascope Submarine cruise in with pickup', 
  'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11', 
  'The Red Sea coral around Sharm el Sheikh teems with color and life. But snorkeling is not for everyone. Get up close to the underwater world without getting your face and hair wet on this semisubmersible adventure that''s suitable for all ages and fitness levels. You''ll sit by a panoramic window in an observation deck 10 feet (3 meters) below the surface, with 2-way transfers direct from your hotel.', 
  (SELECT id FROM categories WHERE slug = 'day-cruises'), 
  (SELECT id FROM destinations WHERE slug = 'sharm-el-sheikh'), 
  NULL, 
  1, 
  30, 
  44.03, 
  37.42,
  4.3,
  23,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/11/26/d8/fa.jpg',
  'active',
  true,
  false
);

-- Features for tour 12
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11'),
  'clock',
  'Duration',
  '0 days 1 hours 30 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11'),
  'tag',
  'Price',
  '$37.42'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 12
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'sharm-el-sheikh-royal-seascope-submarine-cruise-in-with-pickup-11'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 13: Safaga & Makadi Bay: Royal Seascope Submarine cruise with pickup
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Safaga & Makadi Bay: Royal Seascope Submarine cruise with pickup', 
  'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12', 
  'View the Red Sea''s underwater world without having to swim on this semi-submarine excursion, which includes Makadi Bay transfers. After hotel pickup, hit the open sea on a yellow submarine-style craft and visit the underwater 
gallery to observe the reefs, rainbow-hued fish, and more through the windows. If you wish, finish with a snorkel in the surrounding waters. Ideal for non-swimmers and young children. Transfers from other, select resorts are available for an extra cost.', 
  (SELECT id FROM categories WHERE slug = 'nature-and-wildlife-tours'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  2, 
  NULL, 
  18.71, 
  NULL,
  4.6,
  66,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/11/26/d8/fa.jpg',
  'active',
  true,
  false
);

-- Features for tour 13
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  'clock',
  'Duration',
  '0 days 2 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  'tag',
  'Price',
  '$18.71'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 13
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
),
(
  (SELECT id FROM tours WHERE slug = 'safaga-makadi-bay-royal-seascope-submarine-cruise-with-pickup-12'),
  (SELECT id FROM tags WHERE name = 'Family-friendly')
);


-- Tour 14: Super Safari ATV, Buggy Car, Camel Ride, Bedouin Dinner -Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Super Safari ATV, Buggy Car, Camel Ride, Bedouin Dinner -Hurghada', 
  'super-safari-atv-buggy-car-camel-ride-bedouin-dinner--hurghada-13', 
  'Venture away from the resort town of Hurghada and head into the Sahara Desert for a day of fun activities. Start off with a thrilling quad bike tour through the desert sands followed by a dune buggy ride. Then, head to a Bedouin village to learn about the local desert culture and take a camel ride. Your day concludes with a traditional barbecue and folklore show.', 
  (SELECT id FROM categories WHERE slug = 'dining-experiences'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  7, 
  NULL, 
  5, 
  4.45,
  4.8,
  124,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/e6/1d/b1.jpg',
  'active',
  true,
  false
);

-- Features for tour 14
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'super-safari-atv-buggy-car-camel-ride-bedouin-dinner--hurghada-13'),
  'clock',
  'Duration',
  '0 days 7 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'super-safari-atv-buggy-car-camel-ride-bedouin-dinner--hurghada-13'),
  'tag',
  'Price',
  '$4.45'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'super-safari-atv-buggy-car-camel-ride-bedouin-dinner--hurghada-13'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 14
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'super-safari-atv-buggy-car-camel-ride-bedouin-dinner--hurghada-13'),
  (SELECT id FROM tags WHERE name = 'Adventure')
);


-- Tour 15: Excursion to the White Island & Ras Mohammed National Park from Sharm El Sheikh
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Excursion to the White Island & Ras Mohammed National Park from Sharm El Sheikh', 
  'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14', 
  'Go beyond Sharm el Sheik to visit the White Island, part of the Ras Mohammed National Park at the tip of the Sinai Peninsula. With your logistics taken care of, you''ll have more time to focus on the tide-exposed island and its underwater delights. A boat ride with stops to snorkel and an onboard lunch are part of the experience; just note that snorkel gear and park entry fees are not included.', 
  (SELECT id FROM categories WHERE slug = 'snorkeling'), 
  (SELECT id FROM destinations WHERE slug = 'sharm-el-sheikh'), 
  NULL, 
  8, 
  NULL, 
  25.32, 
  NULL,
  4.5,
  310,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/07/20/31/2a.jpg',
  'active',
  true,
  false
);

-- Features for tour 15
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14'),
  'tag',
  'Price',
  '$25.32'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 15
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'excursion-to-the-white-island-ras-mohammed-national-park-from-sharm-el-sheikh-14'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 16: Full-day Scuba Diving Experience for Beginners & Lunch - Sharm El Sheikh
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Full-day Scuba Diving Experience for Beginners & Lunch - Sharm El Sheikh', 
  'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15', 
  'Check out the underwater life in the Red Sea on this full-day scuba diving experience from Sharm El Sheikh. Your guide and captain will take care of the details, like life-jackets for safety and all of your snorkel gear, to keep you safe and comfortable. Beginners are welcome. Make about three stops for diving with different kinds of fish and corals, plus enjoy an included lunch made on the boat.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'sharm-el-sheikh'), 
  NULL, 
  8, 
  NULL, 
  5, 
  NULL,
  3.9,
  19,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0c/11/1a/a2.jpg',
  'active',
  true,
  false
);

-- Features for tour 16
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15'),
  'tag',
  'Price',
  '$5'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 16
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
),
(
  (SELECT id FROM tours WHERE slug = 'full-day-scuba-diving-experience-for-beginners-lunch---sharm-el-sheikh-15'),
  (SELECT id FROM tags WHERE name = 'Family-friendly')
);


-- Tour 17: Scuba Diving Full Day Boat Trip for beginners With Lunch & Transfer – Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Scuba Diving Full Day Boat Trip for beginners With Lunch & Transfer – Hurghada', 
  'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16', 
  'This full-day diving trip from Hurghada is ideal for novices and experts traveling together. You''ll head out onto the Red Sea and explore shallow dive sites suitable for beginners, as well as deeper areas and walls for those with more experience. Includes lunch and hotel transfers.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  22, 
  NULL,
  4.7,
  557,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/46/e5/1b.jpg',
  'active',
  true,
  false
);

-- Features for tour 17
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16'),
  'tag',
  'Price',
  '$22'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 17
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'scuba-diving-full-day-boat-trip-for-beginners-with-lunch-transfer-hurghada-16'),
  (SELECT id FROM tags WHERE name = 'Family-friendly')
);


-- Tour 18: Giftun Island ( Orange bay ) from Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Giftun Island ( Orange bay ) from Hurghada', 
  'giftun-island-orange-bay-from-hurghada-17', 
  'Experience the beauty of Giftun Island without worrying about transportation on this hassle-free excursion. Begin with hotel pickup, then continue to the port in a comfortable minibus. The boat trip takes you straight to Giftun Island where you can see the stunning beaches and snorkel if you wish. After some free time to explore the island, satisfy your hunger with a delicious lunch on the boat before heading back to port.', 
  (SELECT id FROM categories WHERE slug = 'snorkeling'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  8, 
  NULL, 
  19.81, 
  NULL,
  4.7,
  44,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/2a/64/70.jpg',
  'active',
  true,
  false
);

-- Features for tour 18
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  'clock',
  'Duration',
  '0 days 8 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  'tag',
  'Price',
  '$19.81'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 18
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = 'giftun-island-orange-bay-from-hurghada-17'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 19: 2 Hours Semi-submarine, and 3 Hours ATV Safari, Camel Ride, & Parachute-Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '2 Hours Semi-submarine, and 3 Hours ATV Safari, Camel Ride, & Parachute-Hurghada', 
  '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18', 
  'Go beyond Hurghada for a day of adventure: snorkeling, parasailing, and riding a semi-submarine and an all-terrain vehicle (ATV). Filling the best part of a day with activities in the Red Sea and the desert, this trip is perfect for those who want something more than basking on a beach. An extra perk is a stop at a Bedouin village where you can learn about traditional bread making and have the chance to ride a camel, if you wish.', 
  (SELECT id FROM categories WHERE slug = 'nature-and-wildlife-tours'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  6, 
  NULL, 
  40, 
  NULL,
  4.5,
  19,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/0d/c4/34/ab.jpg',
  'active',
  true,
  false
);

-- Features for tour 19
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  'clock',
  'Duration',
  '0 days 6 hours 0 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  'tag',
  'Price',
  '$40'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 19
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  (SELECT id FROM tags WHERE name = 'Beach')
),
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  (SELECT id FROM tags WHERE name = 'Adventure')
),
(
  (SELECT id FROM tours WHERE slug = '2-hours-semi-submarine-and-3-hours-atv-safari-camel-ride-parachute-hurghada-18'),
  (SELECT id FROM tags WHERE name = 'Wildlife')
);


-- Tour 20: Parasailing Adventure Fly to Sky with Hotel Pickup - Hurghada
INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  'Parasailing Adventure Fly to Sky with Hotel Pickup - Hurghada', 
  'parasailing-adventure-fly-to-sky-with-hotel-pickup---hurghada-19', 
  'Experience a fun parasailing adventure over the red sea. Be adventure ready when the tour guide picks you up from your hotel to the Marina, where the parasailing boat will be waiting for you. Feel the air kiss your face as you parasail over the red sea and have the experience of a lifetime. Ascend to up to 164 feet above the water for about seven minutes of flight time.', 
  (SELECT id FROM categories WHERE slug = 'sailing'), 
  (SELECT id FROM destinations WHERE slug = 'hurghada'), 
  NULL, 
  1, 
  30, 
  5, 
  NULL,
  4.6,
  38,
  'https://media.tacdn.com/media/attractions-splice-spp-360x240/07/9e/23/a7.jpg',
  'active',
  true,
  false
);

-- Features for tour 20
INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-adventure-fly-to-sky-with-hotel-pickup---hurghada-19'),
  'clock',
  'Duration',
  '0 days 1 hours 30 minutes'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-adventure-fly-to-sky-with-hotel-pickup---hurghada-19'),
  'tag',
  'Price',
  '$5'
),
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = 'parasailing-adventure-fly-to-sky-with-hotel-pickup---hurghada-19'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
);

-- Tags for tour 20
INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES
(
  (SELECT id FROM tours WHERE slug = 'parasailing-adventure-fly-to-sky-with-hotel-pickup---hurghada-19'),
  (SELECT id FROM tags WHERE name = 'Adventure')
);


