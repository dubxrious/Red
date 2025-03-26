# Red Sea Tours - Database Setup Instructions

This document provides step-by-step instructions for setting up the Supabase database for the Red Sea Tours project.

## Prerequisites

- Access to the Supabase project: https://rihqmooghbklkdchzzgm.supabase.co
- Supabase API key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w`

## Database Setup Instructions

### Step 1: Set up the database tables and functions in Supabase

1. Log in to your Supabase project at https://rihqmooghbklkdchzzgm.supabase.co
2. Go to the "SQL Editor" section
3. Create a new query and copy-paste the contents of the `scripts/sql/setup-functions.sql` file
4. Execute the SQL query to create all the necessary functions
5. Go to the "Database" section to verify that the functions have been created successfully

### Step 2: Run the data import script

1. Make sure you have Node.js installed
2. Install the required dependencies:
   ```
   pnpm add csv-parser @supabase/supabase-js
   ```
3. Run the database setup script:
   ```
   node scripts/setup-database.js
   ```
4. This script will:
   - Drop existing tables (if any)
   - Create new tables using the functions we defined
   - Add initial data for categories, destinations, tags, etc.
   - Import tour data from the CSV file

### Troubleshooting

If you encounter any issues with the setup:

1. **Check Function Creation**: In the Supabase UI, go to Database > Functions to verify that all functions were created successfully.
2. **Extension Requirements**: Make sure the `uuid-ossp` extension is enabled in your Supabase project.
3. **Permission Issues**: Ensure that your API key has the appropriate permissions to create tables and execute functions.
4. **Network Issues**: If you see "fetch failed" errors, it might be due to network connectivity problems or API rate limiting.

## Recommended Direct Setup Method

For the most reliable database setup, we recommend using the direct SQL setup:

1. Log in to your Supabase project at https://rihqmooghbklkdchzzgm.supabase.co
2. Go to the "SQL Editor" section
3. Create a new query
4. Copy-paste the contents of the `scripts/sql/manually-fixed-setup.sql` file into the SQL editor
   (This is the most reliable version with manual fixes for SQL syntax)
5. Execute the SQL query

This script will:
- Drop existing tables (if any)
- Create all necessary tables with proper relationships and indexes
- Create functions and triggers for ratings and statistics
- Add initial data including categories, destinations, tags, and sample tours
- Import 20 sample tours from the dataset_viator.csv, complete with features and tags

This is the fastest and most reliable method for setting up the database with all required data.

## Troubleshooting

If you encounter any issues with the SQL setup:

### SQL Syntax Errors
- If you still see errors related to quotes in strings, try the minimal test file `scripts/sql/minimal-test.sql` first to verify syntax
- You can manually edit any problematic line by escaping all apostrophes with double quotes (`'` → `''`)
- In SQL, apostrophes in text must be escaped by doubling them: `'Text with apostrophe''s'`
- If all else fails, try removing apostrophes completely from the problematic text

### Database Connection Issues
- If you see "fetch failed" errors, check your internet connection
- Verify that your Supabase URL and API key are correct
- Try accessing the Supabase dashboard to confirm your account is active

## Database Structure

The database consists of the following tables:

1. `users` - User accounts
2. `categories` - Tour categories (e.g., Sailing, Diving)
3. `destinations` - Tour destinations (e.g., Hurghada, Sharm El Sheikh)
4. `vendors` - Tour providers
5. `tours` - Main tour listings
6. `tags` - Tour tags (e.g., Beach, Adventure)
7. `tour_tags` - Relationship between tours and tags
8. `tour_features` - Features of each tour
9. `tour_availability` - Available dates for each tour
10. `bookings` - Tour bookings
11. `reviews` - Tour reviews

## Manual Database Setup

If the automated setup doesn't work, you can manually create the tables using these SQL commands:

```sql
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

-- Other tables and their associated indexes...
```

## Importing CSV Data

If you need to manually import data from the CSV file, you can use:

1. The `scripts/import-csv-data.js` script which connects to Supabase and uploads the data.
2. The `scripts/generate-sample-tour-sql.js` script which generates SQL statements from the CSV that can be executed directly in the SQL Editor.

Both methods parse the dataset_viator.csv file and import tour data, features, and tags into the database.

## Airtable Integration Alternative

As an alternative to the direct SQL setup approach, you can use the Airtable integration to populate and sync your Supabase database. This method avoids issues with SQL syntax errors and provides a more user-friendly way to manage your tour data.

### Setting Up the Airtable Integration

1. **Create an Airtable account and base**:
   - Sign up for an Airtable account at [airtable.com](https://airtable.com) if you don't have one.
   - Create a new base with the following tables:
     - tourx (main tours table with the complex field structure)
     - Categories
     - Destinations
     - Tags
     - Tour Features
     - Tour Tags

2. **Set up your environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Airtable API key and Base ID to `.env`
   - Add your Supabase URL and API key to `.env`

3. **Install dependencies**:
   ```bash
   pnpm install
   ```

4. **Run the connection test script**:
   ```bash
   node scripts/test-airtable-sync.js tourz.csv
   ```

5. **Import data to Airtable** (if starting with CSV data):
   ```bash
   node scripts/airtable-to-supabase.js import-csv tourz.csv
   ```

6. **Sync data from Airtable to Supabase**:
   ```bash
   node scripts/airtable-to-supabase.js sync
   ```

### Setting Up the tourx Table in Airtable

The tourx table should have the following field structure:

| Field Name | Field Type |
|------------|------------|
| badges/0 | Single Line Text |
| behaviours/hasFreeCancellation | Checkbox |
| behaviours/hasUnlimitedReschedule | Checkbox |
| behaviours/shouldHideFromCrawlers | Single Line Text |
| category | Single Select |
| code | Single Line Text |
| description | Long Text |
| displayDuration/duration/days | Number (Integer) |
| displayDuration/duration/hours | Number (Integer) |
| displayDuration/duration/minutes | Number (Integer) |
| displayDuration/isFlexible | Single Line Text |
| displayDuration/isFullyFlexible | Single Line Text |
| displayDuration/isSingleTimeUnit | Single Line Text |
| geolocation/latitude | Number (Decimal) |
| geolocation/longitude | Number (Decimal) |
| image/alt | Single Line Text |
| image/elementType | Single Line Text |
| image/isEnhanced | Checkbox |
| image/sizes | Single Line Text |
| image/src | Single Line Text |
| image/srcSet | Long Text |
| images/0/alt - images/5/alt | Single Line Text (6 fields) |
| images/0/elementType - images/5/elementType | Single Line Text (6 fields) |
| images/0/isEnhanced - images/5/isEnhanced | Checkbox (6 fields) |
| images/0/sizes - images/5/sizes | Single Line Text (6 fields) |
| images/0/src - images/5/src | Single Line Text (6 fields) |
| images/0/srcSet - images/5/srcSet | Long Text (6 fields) |
| isHighlighted | Single Line Text |
| languages/0 | Single Line Text |
| location | Single Line Text or Multiple Select |
| maxTravelersAllowed | Number (Integer) |
| maxTravelersPerUnit | Number (Integer) |
| price/discountAmount/amount | Number (Decimal) |
| price/discountAmount/currencyCode | Single Line Text |
| price/discountAmount/currencySymbol | Single Line Text |
| price/discountedPrice/amount | Number (Decimal) |
| price/discountedPrice/currencyCode | Single Line Text |
| price/discountedPrice/currencySymbol | Single Line Text |
| price/hasTieredPricing | Checkbox |
| price/hasUnitPricing | Single Line Text |
| price/isDiscounted | Checkbox |
| price/retailPrice/amount | Number (Decimal) |
| price/retailPrice/currencyCode | Single Line Text |
| price/retailPrice/currencySymbol | Single Line Text |
| primaryLabel | Single Line Text |
| qualityBadges/isBestConversion | Single Line Text |
| qualityBadges/isExcellent | Single Line Text |
| rating/exactScore | Number (Decimal) |
| rating/reviewCount | Number (Integer) |
| rating/score | Number (Decimal) |
| title | Single Line Text |
| url | Single Line Text |
| videoCount | Number (Integer) |

### Benefits of the Airtable Integration

- **No SQL syntax errors**: Avoids issues with escaping quotes and apostrophes in text.
- **Visual data management**: Use Airtable's friendly interface to manage your tour data.
- **Easier content editing**: Non-technical team members can update content without SQL knowledge.
- **Automatic relationships**: The script handles converting Airtable relationships to Supabase foreign keys.
- **Incremental updates**: You can run the sync script repeatedly to update only changed data.

### Running the Integration Scripts

The integration comes with two main commands:

1. **Import CSV to Airtable**:
   ```bash
   node scripts/airtable-to-supabase.js import-csv [csv-path]
   ```
   This will parse your CSV tour data and populate your Airtable base with categories, destinations, tags, and tours.

2. **Sync from Airtable to Supabase**:
   ```bash
   node scripts/airtable-to-supabase.js sync
   ```
   This will fetch all data from your Airtable base and insert it into your Supabase database with proper relationships.

For more information and options, run:
```bash
node scripts/airtable-to-supabase.js
``` 