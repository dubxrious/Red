-- Function to drop all tables (to be called when resetting the database)
CREATE OR REPLACE FUNCTION drop_all_tables()
RETURNS void AS $$
BEGIN
  -- Drop tables in reverse order of dependencies
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
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    role TEXT CHECK (role IN ('user', 'vendor', 'admin')) DEFAULT 'user'
  );
END;
$$ LANGUAGE plpgsql;

-- Categories table
CREATE OR REPLACE FUNCTION create_categories_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Destinations table
CREATE OR REPLACE FUNCTION create_destinations_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Vendors table
CREATE OR REPLACE FUNCTION create_vendors_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Tours table
CREATE OR REPLACE FUNCTION create_tours_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Tags table
CREATE OR REPLACE FUNCTION create_tags_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Tour tags table
CREATE OR REPLACE FUNCTION create_tour_tags_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS tour_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(tour_id, tag_id)
  );

  -- Add index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_tour_tags_tour ON tour_tags(tour_id);
  CREATE INDEX IF NOT EXISTS idx_tour_tags_tag ON tour_tags(tag_id);
END;
$$ LANGUAGE plpgsql;

-- Tour features table
CREATE OR REPLACE FUNCTION create_tour_features_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS tour_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    icon TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT
  );

  -- Add index for faster lookups
  CREATE INDEX IF NOT EXISTS idx_tour_features_tour ON tour_features(tour_id);
END;
$$ LANGUAGE plpgsql;

-- Tour availability table
CREATE OR REPLACE FUNCTION create_tour_availability_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Bookings table
CREATE OR REPLACE FUNCTION create_bookings_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Reviews table
CREATE OR REPLACE FUNCTION create_reviews_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor stats
CREATE OR REPLACE FUNCTION create_get_vendor_stats_function()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql; 