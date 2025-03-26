-- Create tables for Red Sea Quest

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

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
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
  rating_exact_score DECIMAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  image_0_src TEXT NOT NULL,
  image_1_src TEXT,
  image_2_src TEXT,
  image_3_src TEXT,
  image_4_src TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vendor_id UUID REFERENCES vendors(id),
  max_capacity INTEGER,
  min_booking_notice INTEGER,
  infant_age INTEGER,
  child_age INTEGER,
  pickup_available BOOLEAN DEFAULT FALSE
);

-- Tour Tags junction table
CREATE TABLE IF NOT EXISTS tour_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(tour_id, tag_id)
);

-- Tour Features table
CREATE TABLE IF NOT EXISTS tour_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT
);

-- Tour Availability table
CREATE TABLE IF NOT EXISTS tour_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  spots_available INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tour_id, date)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id),
  user_id UUID REFERENCES auth.users(id),
  booking_date DATE NOT NULL,
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  infants INTEGER NOT NULL DEFAULT 0,
  pickup_required BOOLEAN DEFAULT FALSE,
  pickup_location TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  payment_id TEXT
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  rating DECIMAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  unhelpful_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL CHECK (role IN ('user', 'vendor', 'admin')) DEFAULT 'user'
);

-- Create function to get vendor stats
CREATE OR REPLACE FUNCTION get_vendor_stats(vendor_id UUID)
RETURNS TABLE (
  total_tours BIGINT,
  pending_bookings BIGINT,
  monthly_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM tours WHERE tours.vendor_id = $1) AS total_tours,
    (SELECT COUNT(*) FROM bookings 
     JOIN tours ON bookings.tour_id = tours.id
     WHERE tours.vendor_id = $1 AND bookings.status = 'pending') AS pending_bookings,
    (SELECT COALESCE(SUM(
       CASE 
         WHEN b.children > 0 THEN 
           (b.adults * COALESCE(t.discounted_price, t.retail_price)) + 
           (b.children * (COALESCE(t.discounted_price, t.retail_price) * 0.7))
         ELSE 
           (b.adults * COALESCE(t.discounted_price, t.retail_price))
       END), 0)
     FROM bookings b
     JOIN tours t ON b.tour_id = t.id
     WHERE t.vendor_id = $1 
     AND b.status = 'confirmed'
     AND b.payment_status = 'paid'
     AND b.created_at >= date_trunc('month', current_date)) AS monthly_revenue;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Tours: Everyone can view active tours
CREATE POLICY "Anyone can view active tours" 
ON tours FOR SELECT USING (status = 'active');

-- Tours: Vendors can manage their own tours
CREATE POLICY "Vendors can manage their own tours" 
ON tours FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM vendors WHERE id = vendor_id
  )
);

-- Tours: Admins can manage all tours
CREATE POLICY "Admins can manage all tours" 
ON tours FOR ALL USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Bookings: Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT USING (
  auth.uid() = user_id
);

-- Bookings: Users can create bookings
CREATE POLICY "Users can create bookings" 
ON bookings FOR INSERT WITH CHECK (true);

-- Bookings: Vendors can view bookings for their tours
CREATE POLICY "Vendors can view bookings for their tours" 
ON bookings FOR SELECT USING (
  auth.uid() IN (
    SELECT v.user_id FROM vendors v
    JOIN tours t ON v.id = t.vendor_id
    WHERE t.id = tour_id
  )
);

-- Reviews: Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" 
ON reviews FOR SELECT USING (status = 'approved');

-- Reviews: Users can create reviews
CREATE POLICY "Users can create reviews" 
ON reviews FOR INSERT WITH CHECK (true);

-- Reviews: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE USING (
  auth.uid() = user_id
);

-- Vendors: Vendors can view their own profile
CREATE POLICY "Vendors can view their own profile" 
ON vendors FOR SELECT USING (
  auth.uid() = user_id
);

-- Users: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT USING (
  auth.uid() = id
);

-- Users: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE USING (
  auth.uid() = id
);

