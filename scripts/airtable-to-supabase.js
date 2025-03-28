// Airtable to Supabase Sync Script
const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');
require('dotenv').config();

// Configuration - Replace these with your actual credentials
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_airtable_api_key';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_airtable_base_id';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uapeongczwcjbfvhozyw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcGVvbmdjendjamJmdmhvenl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTY0NzI2NSwiZXhwIjoyMDU3MjIzMjY1fQ.45iZyKLi3nLTw9BAYQDxAha6aMAA-8wrMR06Cb5lAVs';

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Table mapping between Airtable and Supabase
const tableMapping = {
  'tourz': 'tours',
  'Categories': 'categories',
  'Destinations': 'destinations',
  'Tags': 'tags',
  'Tour_Tags': 'tour_tags',
  'Tour_Features': 'tour_features',
  'Tour Availability': 'tour_availability',
  'Bookings': 'bookings',
  'Reviews': 'reviews'
};

// Field mapping for main tourz table
const tourFieldMapping = {
  'title': 'title',
  'description': 'description',
  'category': 'category_id', // This will need to be processed
  'location': 'destination_id', // This will need to be processed
  'displayDuration/duration/days': 'duration_days',
  'displayDuration/duration/hours': 'duration_hours',
  'displayDuration/duration/minutes': 'duration_minutes',
  'displayDuration/isFlexible': 'is_flexible_duration',
  'price/retailPrice/amount': 'retail_price',
  'price/discountedPrice/amount': 'discounted_price',
  'price/retailPrice/currencyCode': 'currency_code',
  'price/retailPrice/currencySymbol': 'currency_symbol',
  'rating/exactScore': 'rating',
  'rating/reviewCount': 'review_count',
  'image/src': 'image_url',
  'code': 'code',
  'badges/0': 'badges',
  'behaviours/hasFreeCancellation': 'free_cancellation',
  'behaviours/hasUnlimitedReschedule': 'unlimited_reschedule',
  'isHighlighted': 'featured',
  'languages/0': 'languages',
  'maxTravelersAllowed': 'max_travelers',
  'geolocation/latitude': 'latitude',
  'geolocation/longitude': 'longitude',
  'url': 'external_url'
};

// Main sync function
async function syncAirtableToSupabase() {
  try {
    console.log('Starting Airtable to Supabase sync...');
    
    // First, sync the categories
    await syncCategories();
    
    // Then sync destinations
    await syncDestinations();
    
    // Sync tags
    await syncTags();
    
    // Now sync tours
    await syncTours();
    
    // Finally sync tour relationships
    await syncTourRelationships();
    
    // Mark highlighted tours as featured
    await markFeaturedTours();
    
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// Sync categories
async function syncCategories() {
  console.log('Syncing categories...');
  
  try {
    // Get existing categories from Supabase
    const { data: existingCategories, error: fetchError } = await supabase.from('categories').select('name, slug');
    
    if (fetchError) throw fetchError;
    
    // Create sets of existing category names and slugs for quick lookup
    const existingNames = new Set(existingCategories.map(cat => cat.name.toLowerCase()));
    const existingSlugs = new Set(existingCategories.map(cat => cat.slug.toLowerCase()));
    
    // Get unique categories from tourz table
    const records = await airtable('tourz').select({
      fields: ['category']
    }).all();
    
    // Extract unique categories and filter out ones that already exist in Supabase
    const uniqueCategories = [...new Set(records.map(record => record.fields.category).filter(Boolean))];
    const newCategories = uniqueCategories.filter(categoryName => {
      const slug = createSlug(categoryName);
      return !existingNames.has(categoryName.toLowerCase()) && !existingSlugs.has(slug);
    });
    
    if (newCategories.length === 0) {
      console.log('No new categories to sync - all categories already exist in Supabase');
      return existingCategories;
    }
    
    // Transform for Supabase
    const categories = newCategories.map(categoryName => ({
      name: categoryName,
      slug: createSlug(categoryName),
      description: `Tours related to ${categoryName}`,
      image: 'https://via.placeholder.com/800x600'
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('categories').insert(categories);
    
    if (error) throw error;
    console.log(`Synced ${categories.length} new categories`);
    
    return [...existingCategories, ...categories];
  } catch (error) {
    console.error('Error syncing categories:', error);
    // Continue with the process even if there's an error with categories
    console.log('Continuing with sync process despite category sync error...');
    return null;
  }
}

// Sync destinations
async function syncDestinations() {
  console.log('Syncing destinations...');
  
  try {
    // Get existing destinations from Supabase
    const { data: existingDestinations, error: fetchError } = await supabase.from('destinations').select('name, slug');
    
    if (fetchError) throw fetchError;
    
    // Create sets of existing destination names and slugs for quick lookup
    const existingNames = new Set();
    const existingSlugs = new Set();
    
    if (existingDestinations) {
      existingDestinations.forEach(dest => {
        existingNames.add(dest.name.toLowerCase());
        existingSlugs.add(dest.slug.toLowerCase());
      });
    }
    
    // Get unique locations from tourz table
    const records = await airtable('tourz').select({
      fields: ['location']
    }).all();
    
    // Extract unique destinations (first part of location string)
    const uniqueDestinations = new Set();
    records.forEach(record => {
      if (record.fields.location) {
        const locations = Array.isArray(record.fields.location) 
          ? record.fields.location 
          : [record.fields.location];
          
        locations.forEach(location => {
          if (location && location.includes(',')) {
            uniqueDestinations.add(location.split(',')[0].trim());
          } else if (location) {
            uniqueDestinations.add(location.trim());
          }
        });
      }
    });
    
    // Filter out destinations that already exist in Supabase
    const newDestinations = [...uniqueDestinations].filter(destinationName => {
      const slug = createSlug(destinationName);
      return !existingNames.has(destinationName.toLowerCase()) && !existingSlugs.has(slug);
    });
    
    if (newDestinations.length === 0) {
      console.log('No new destinations to sync - all destinations already exist in Supabase');
      return existingDestinations || [];
    }
    
    // Transform for Supabase
    const destinations = newDestinations.map(destinationName => ({
      name: destinationName,
      slug: createSlug(destinationName),
      description: `Tours in the beautiful ${destinationName} area`,
      image: 'https://via.placeholder.com/800x600'
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('destinations').insert(destinations);
    
    if (error) throw error;
    console.log(`Synced ${destinations.length} new destinations`);
    
    return [...(existingDestinations || []), ...(data || [])];
  } catch (error) {
    console.error('Error syncing destinations:', error);
    // Continue with the process even if there's an error with destinations
    console.log('Continuing with sync process despite destination sync error...');
    return [];
  }
}

// Sync tags
async function syncTags() {
  console.log('Syncing tags...');
  
  try {
    // Get existing tags from Supabase
    const { data: existingTags, error: fetchError } = await supabase.from('tags').select('name, slug');
    
    if (fetchError) throw fetchError;
    
    // Create sets of existing tag names and slugs for quick lookup
    const existingNames = new Set();
    const existingSlugs = new Set();
    
    if (existingTags) {
      existingTags.forEach(tag => {
        existingNames.add(tag.name.toLowerCase());
        existingSlugs.add(tag.slug.toLowerCase());
      });
    }
    
    // Fetch from Airtable
    const records = await airtable('Tags').select().all();
    
    // Filter out tags that already exist in Supabase
    const newTags = records.filter(record => {
      const name = record.fields.Name;
      const slug = record.fields.Slug || createSlug(name);
      return name && !existingNames.has(name.toLowerCase()) && !existingSlugs.has(slug.toLowerCase());
    });
    
    if (newTags.length === 0) {
      console.log('No new tags to sync - all tags already exist in Supabase');
      return existingTags || [];
    }
    
    // Transform for Supabase
    const tags = newTags.map(record => ({
      name: record.fields.Name,
      slug: record.fields.Slug || createSlug(record.fields.Name),
      description: record.fields.Description || `Tours tagged with ${record.fields.Name}`
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('tags').insert(tags);
    
    if (error) throw error;
    console.log(`Synced ${tags.length} new tags`);
    
    return [...(existingTags || []), ...(data || [])];
  } catch (error) {
    console.error('Error syncing tags:', error);
    // Continue with the process even if there's an error with tags
    console.log('Continuing with sync process despite tag sync error...');
    return [];
  }
}

// Sync tours from tourz
async function syncTours() {
  console.log('Syncing tours from tourz table...');
  
  try {
    // First check if the airtable_id column exists in the tours table
    let hasAirtableIdColumn = true;
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('airtable_id')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        hasAirtableIdColumn = false;
        console.log('Warning: airtable_id column does not exist in tours table');
        console.log('Will use title matching for tour synchronization instead');
      }
    } catch (err) {
      hasAirtableIdColumn = false;
      console.log('Warning: Could not verify airtable_id column. Will use title matching instead');
    }
    
    // Check if the tours table has any records
    let validColumns = [
      'title', 'slug', 'description', 'status', 'retail_price', 'discounted_price', 
      'category_id', 'destination_id', 'image_0_src'
    ];
    try {
      const { data: sampleTour, error: sampleError } = await supabase
        .from('tours')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.log('Could not fetch sample tour to determine schema:', sampleError);
        console.log('Using basic columns for tours table');
      } else {
        // Get the actual column names from the sample
        validColumns = Object.keys(sampleTour);
        console.log('Valid columns in tours table:', validColumns.join(', '));
      }
    } catch (schemaError) {
      console.log('Error determining schema, using basic columns:', schemaError.message);
    }
    
    // Get existing tours from Supabase
    const { data: existingTours, error: fetchError } = await supabase
      .from('tours')
      .select(hasAirtableIdColumn ? 'id, title, slug, airtable_id' : 'id, title, slug');
    
    if (fetchError) {
      console.error('Error fetching existing tours:', fetchError);
      existingTours = [];
    }
    
    // Create maps for quick lookup of existing tours
    const existingAirtableIds = new Map();
    const existingTitles = new Map();
    const existingSlugs = new Set();
    
    if (existingTours) {
      existingTours.forEach(tour => {
        if (hasAirtableIdColumn && tour.airtable_id) existingAirtableIds.set(tour.airtable_id, tour.id);
        existingTitles.set(tour.title.toLowerCase(), tour.id);
        existingSlugs.add(tour.slug.toLowerCase());
      });
    }
    
    // Get category and destination mappings (for id lookup)
    const { data: categories, error: categoryError } = await supabase.from('categories').select('id, name, slug');
    const { data: destinations, error: destinationError } = await supabase.from('destinations').select('id, name, slug');
    
    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
    }
    
    if (destinationError) {
      console.error('Error fetching destinations:', destinationError);
    }
    
    // Find or create a default category
    let defaultCategoryId = null;
    
    if (categories) {
      // Look for "Uncategorized" category
      const defaultCategory = categories.find(
        cat => cat.slug === 'uncategorized' || cat.name.toLowerCase() === 'uncategorized'
      );
      
      if (defaultCategory) {
        defaultCategoryId = defaultCategory.id;
        console.log(`Using existing default category: ${defaultCategory.name} (${defaultCategoryId})`);
      } else {
        // Create a default category if not found
        try {
          const { data: newCategory, error: createError } = await supabase
            .from('categories')
            .insert({
              name: 'Uncategorized',
              slug: 'uncategorized',
              description: 'Default category for uncategorized tours',
              image: 'https://via.placeholder.com/800x600'
            })
            .select('id');
            
          if (createError) {
            console.error('Error creating default category:', createError);
          } else {
            defaultCategoryId = newCategory[0].id;
            console.log(`Created default category with ID: ${defaultCategoryId}`);
          }
        } catch (err) {
          console.error('Error creating default category:', err);
        }
      }
    }
    
    // Find or create a default destination
    let defaultDestinationId = null;
    
    if (destinations) {
      // Look for "Other" destination
      const defaultDestination = destinations.find(
        dest => dest.slug === 'other' || dest.name.toLowerCase() === 'other'
      );
      
      if (defaultDestination) {
        defaultDestinationId = defaultDestination.id;
        console.log(`Using existing default destination: ${defaultDestination.name} (${defaultDestinationId})`);
      } else {
        // Create a default destination if not found
        try {
          const { data: newDestination, error: createError } = await supabase
            .from('destinations')
            .insert({
              name: 'Other',
              slug: 'other',
              description: 'Other destinations',
              image: 'https://via.placeholder.com/800x600'
            })
            .select('id');
            
          if (createError) {
            console.error('Error creating default destination:', createError);
          } else {
            defaultDestinationId = newDestination[0].id;
            console.log(`Created default destination with ID: ${defaultDestinationId}`);
          }
        } catch (err) {
          console.error('Error creating default destination:', err);
        }
      }
    }
    
    // Default image URL for tours without images
    const DEFAULT_IMAGE_URL = 'https://via.placeholder.com/800x600';
    
    // Create lookup maps
    const categoryMap = new Map();
    if (categories) {
      categories.forEach(cat => {
        categoryMap.set(cat.name.toLowerCase(), cat.id);
        categoryMap.set(cat.slug.toLowerCase(), cat.id);
      });
    }
    
    const destinationMap = new Map();
    if (destinations) {
      destinations.forEach(dest => {
        destinationMap.set(dest.name.toLowerCase(), dest.id);
        destinationMap.set(dest.slug.toLowerCase(), dest.id);
      });
    }
    
    // Fetch from Airtable
    const records = await airtable('tourz').select().all();
    console.log(`Found ${records.length} tours in Airtable`);
    
    // Split records into ones to update and ones to insert
    const toUpdate = [];
    const toInsert = [];
    
    // Process records
    for (const record of records) {
      const airtableId = record.id;
      const fields = record.fields;
      
      // Get basic info
      const title = fields.title || 'Untitled Tour';
      const baseSlug = slugify(title);
      // Add a unique identifier to each slug to avoid duplicates
      const slug = baseSlug + '-' + airtableId.substring(0, 8);
      const description = fields.description || '';
      
      // Start with minimal data that definitely exists in the schema
      const tourData = {
        title,
        slug,
        description,
        status: 'active',
        retail_price: fields.price?.retailPrice?.amount || 0,
        discounted_price: fields.price?.discountedPrice?.amount || 0,
      };
      
      // Add required category_id field with default if not present
      if (validColumns.includes('category_id')) {
        // Look up category from Airtable data
        if (fields.category) {
          const categoryName = String(fields.category).toLowerCase();
          if (categoryMap.has(categoryName)) {
            tourData.category_id = categoryMap.get(categoryName);
          } else {
            console.log(`Warning: Category not found for "${fields.category}", using default`);
            tourData.category_id = defaultCategoryId;
          }
        } else {
          // Use default category if none specified
          tourData.category_id = defaultCategoryId;
        }
      }
      
      // Add required destination_id field with default if not present
      if (validColumns.includes('destination_id')) {
        if (fields.location) {
          // Handle different types of location data
          let locationName = '';
          if (typeof fields.location === 'string') {
            locationName = fields.location.split(',')[0].trim().toLowerCase();
          } else if (Array.isArray(fields.location) && fields.location.length > 0) {
            locationName = String(fields.location[0]).split(',')[0].trim().toLowerCase();
          } else if (fields.location && typeof fields.location === 'object') {
            locationName = String(Object.values(fields.location)[0] || '').split(',')[0].trim().toLowerCase();
          }
          
          if (locationName && destinationMap.has(locationName)) {
            tourData.destination_id = destinationMap.get(locationName);
          } else {
            console.log(`Warning: Destination not found for "${locationName}", using default`);
            tourData.destination_id = defaultDestinationId;
          }
        } else {
          // Use default destination if none specified
          tourData.destination_id = defaultDestinationId;
        }
      }
      
      // Handle image fields - use image from Airtable or default
      const imageUrl = fields.image?.src || DEFAULT_IMAGE_URL;
      
      // Add required image field with default
      if (validColumns.includes('image_0_src')) {
        tourData.image_0_src = imageUrl;
      }
      
      // Add image_1_src through image_6_src if they exist in the fields data
      for (let i = 1; i <= 6; i++) {
        if (validColumns.includes(`image_${i}_src`) && fields[`images/${i-1}/src`]) {
          tourData[`image_${i}_src`] = fields[`images/${i-1}/src`];
        }
      }
      
      // Only add optional fields if they exist in the valid columns list
      if (validColumns.includes('featured')) {
        tourData.featured = fields.isHighlighted || false;
      }
      
      if (validColumns.includes('featured_order')) {
        tourData.featured_order = fields.displayOrder || 999;
      }
      
      if (validColumns.includes('duration_days')) {
        tourData.duration_days = fields.displayDuration?.duration?.days || 0;
      }
      
      if (validColumns.includes('duration_hours')) {
        tourData.duration_hours = fields.displayDuration?.duration?.hours || 0;
      }
      
      if (validColumns.includes('duration_minutes')) {
        tourData.duration_minutes = fields.displayDuration?.duration?.minutes || 0;
      }
      
      if (validColumns.includes('is_flexible_duration')) {
        tourData.is_flexible_duration = fields.displayDuration?.isFlexible || false;
      }
      
      if (validColumns.includes('free_cancellation')) {
        tourData.free_cancellation = fields.behaviours?.hasFreeCancellation || false;
      }
      
      if (validColumns.includes('unlimited_reschedule')) {
        tourData.unlimited_reschedule = fields.behaviours?.hasUnlimitedReschedule || false;
      }
      
      if (validColumns.includes('rating')) {
        tourData.rating = fields.rating?.exactScore || 0;
      }
      
      if (validColumns.includes('review_count')) {
        tourData.review_count = fields.rating?.reviewCount || 0;
      }
      
      if (validColumns.includes('latitude') && fields.geolocation) {
        tourData.latitude = fields.geolocation.latitude || null;
      }
      
      if (validColumns.includes('longitude') && fields.geolocation) {
        tourData.longitude = fields.geolocation.longitude || null;
      }
      
      if (validColumns.includes('currency_code') && fields.price && fields.price.retailPrice) {
        tourData.currency_code = fields.price.retailPrice.currencyCode || 'USD';
      }
      
      if (validColumns.includes('currency_symbol') && fields.price && fields.price.retailPrice) {
        tourData.currency_symbol = fields.price.retailPrice.currencySymbol || '$';
      }
      
      // Add airtable_id if the column exists
      if (hasAirtableIdColumn) {
        tourData.airtable_id = airtableId;
      }
      
      // Check if this tour already exists
      let existingId = null;
      
      if (hasAirtableIdColumn && existingAirtableIds.has(airtableId)) {
        // Match by airtable_id if available
        existingId = existingAirtableIds.get(airtableId);
        tourData.id = existingId;
        toUpdate.push(tourData);
      } else if (existingTitles.has(title.toLowerCase())) {
        // Fall back to title matching
        existingId = existingTitles.get(title.toLowerCase());
        tourData.id = existingId;
        toUpdate.push(tourData);
      } else {
        // New tour
        toInsert.push(tourData);
      }
    }
    
    // Perform batch updates
    if (toUpdate.length > 0) {
      console.log(`Updating ${toUpdate.length} existing tours...`);
      
      // Update in batches of 50
      for (let i = 0; i < toUpdate.length; i += 50) {
        const batch = toUpdate.slice(i, i + 50);
        const { error } = await supabase.from('tours').upsert(batch);
        
        if (error) {
          console.error('Error updating tours (batch starting at index ' + i + '):', error);
        }
      }
    }
    
    // Perform batch inserts
    if (toInsert.length > 0) {
      console.log(`Inserting ${toInsert.length} new tours...`);
      
      // Insert in batches of 50
      for (let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i + 50);
        const { error } = await supabase.from('tours').insert(batch);
        
        if (error) {
          console.error('Error inserting tours (batch starting at index ' + i + '):', error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing tours:', error);
    return false;
  }
}

// Sync tour features, tags, etc.
async function syncTourRelationships() {
  console.log('Syncing tour relationships...');
  
  try {
    // Get existing relationships
    const { data: existingFeatures, error: featuresError } = await supabase.from('tour_features').select('tour_id, label');
    const { data: existingTags, error: tagsError } = await supabase.from('tour_tags').select('tour_id, tag_id');
    
    if (featuresError) {
      console.error('Error fetching existing features:', featuresError);
    }
    
    if (tagsError) {
      console.error('Error fetching existing tags:', tagsError);
    }
    
    // Create sets for quick lookup of existing relationships
    const existingFeatureKeys = new Set();
    if (existingFeatures) {
      existingFeatures.forEach(feature => {
        existingFeatureKeys.add(`${feature.tour_id}-${feature.label}`);
      });
    }
    
    const existingTagKeys = new Set();
    if (existingTags) {
      existingTags.forEach(tag => {
        existingTagKeys.add(`${tag.tour_id}-${tag.tag_id}`);
      });
    }
    
    // Get tours from Supabase to get their UUIDs
    const { data: tourData, error: tourError } = await supabase.from('tours').select('id, slug, title');
    
    if (tourError) {
      console.error('Error fetching tours:', tourError);
      return false;
    }
    
    if (!tourData || tourData.length === 0) {
      console.log('No tours found in Supabase to sync relationships');
      return false;
    }
    
    // Create tour lookup map
    const tourMap = new Map();
    const tourTitleMap = new Map();
    
    tourData.forEach(tour => {
      // We might not have airtable_id, so use title and slug as alternative keys
      tourMap.set(tour.id, tour.id); // Self-mapping for direct ID use
      tourTitleMap.set(tour.title.toLowerCase(), tour.id);
    });
    
    // Get tags from Supabase
    const { data: tagData, error: tagDataError } = await supabase.from('tags').select('id, name, slug');
    
    if (tagDataError) {
      console.error('Error fetching tags:', tagDataError);
    }
    
    // Create tag lookup map
    const tagMap = new Map();
    if (tagData) {
      tagData.forEach(tag => {
        tagMap.set(tag.name.toLowerCase(), tag.id);
        tagMap.set(tag.slug.toLowerCase(), tag.id);
      });
    } else {
      console.log('No tags found in Supabase');
    }
    
    try {
      // Fetch tour features from Airtable
      try {
        console.log('Fetching features from Airtable table: Tour_Features');
        const featureRecords = await airtable('Tour_Features').select().all();
        console.log(`Found ${featureRecords.length} feature records in Airtable`);
        
        // Transform features for Supabase, filtering out existing ones
        const features = [];
        
        featureRecords.forEach(record => {
          const tourTitle = record.fields.tour;
          const label = record.fields.label;
          
          if (!tourTitle || !label) {
            console.log('Skipping feature record with missing tour or label:', record.id);
            return;
          }
          
          // Find the tour ID
          let tourId = null;
          
          if (tourTitleMap.has(String(tourTitle).toLowerCase())) {
            tourId = tourTitleMap.get(String(tourTitle).toLowerCase());
          }
          
          if (!tourId) {
            // Try to find by partial match
            for (const [title, id] of tourTitleMap.entries()) {
              if (String(tourTitle).toLowerCase().includes(title) || title.includes(String(tourTitle).toLowerCase())) {
                tourId = id;
                break;
              }
            }
          }
          
          if (!tourId) {
            console.log(`Could not find matching tour for feature: "${tourTitle}"`);
            return;
          }
          
          // Check if this relationship already exists
          const key = `${tourId}-${label}`;
          if (!existingFeatureKeys.has(key)) {
            features.push({
              tour_id: tourId,
              label: label,
              icon: record.fields.icon || 'info',
              description: record.fields.description || ''
            });
          }
        });
        
        // Insert new features
        if (features.length > 0) {
          const { error: insertError } = await supabase.from('tour_features').insert(features);
          
          if (insertError) {
            console.error('Error inserting tour features:', insertError);
          } else {
            console.log(`Inserted ${features.length} tour features`);
          }
        } else {
          console.log('No new tour features to insert');
        }
      } catch (airtableError) {
        console.error('Error accessing Tour_Features table:', airtableError);
        if (airtableError.statusCode === 403) {
          console.log('Warning: No access to Tour_Features table in Airtable - skipping feature sync');
        } else {
          throw airtableError;
        }
      }
    } catch (featureError) {
      console.error('Error processing tour features:', featureError);
    }
    
    try {
      // Fetch tour tags from Airtable
      try {
        console.log('Fetching tags from Airtable table: Tour_Tags');
        const tagRecords = await airtable('Tour_Tags').select().all();
        console.log(`Found ${tagRecords.length} tag records in Airtable`);
        
        // Transform tags for Supabase
        const tourTags = [];
        
        tagRecords.forEach(record => {
          const tourTitle = record.fields.tour;
          const tagName = record.fields.tag;
          
          if (!tourTitle || !tagName) {
            console.log('Skipping tag record with missing tour or tag:', record.id);
            return;
          }
          
          // Find the tour ID
          let tourId = null;
          
          if (tourTitleMap.has(String(tourTitle).toLowerCase())) {
            tourId = tourTitleMap.get(String(tourTitle).toLowerCase());
          }
          
          if (!tourId) {
            // Try to find by partial match
            for (const [title, id] of tourTitleMap.entries()) {
              if (String(tourTitle).toLowerCase().includes(title) || title.includes(String(tourTitle).toLowerCase())) {
                tourId = id;
                break;
              }
            }
          }
          
          if (!tourId) {
            console.log(`Could not find matching tour for tag: "${tourTitle}"`);
            return;
          }
          
          // Find the tag ID
          const tagId = tagMap.get(String(tagName).toLowerCase());
          if (!tagId) {
            console.log(`Tag not found: "${tagName}"`);
            return;
          }
          
          // Check if this relationship already exists
          const key = `${tourId}-${tagId}`;
          if (!existingTagKeys.has(key)) {
            tourTags.push({
              tour_id: tourId,
              tag_id: tagId
            });
          }
        });
        
        // Insert new tour tags
        if (tourTags.length > 0) {
          const { error: insertError } = await supabase.from('tour_tags').insert(tourTags);
          
          if (insertError) {
            console.error('Error inserting tour tags:', insertError);
          } else {
            console.log(`Inserted ${tourTags.length} tour tags`);
          }
        } else {
          console.log('No new tour tags to insert');
        }
      } catch (airtableError) {
        console.error('Error accessing Tour_Tags table:', airtableError);
        if (airtableError.statusCode === 403) {
          console.log('Warning: No access to Tour_Tags table in Airtable - skipping tag sync');
        } else {
          throw airtableError;
        }
      }
    } catch (tagError) {
      console.error('Error processing tour tags:', tagError);
    }
    
    return true;
  } catch (error) {
    console.error('Error syncing tour relationships:', error);
    console.log('Continuing with sync process despite relationship sync error...');
    return false;
  }
}

// New function to mark featured tours
async function markFeaturedTours() {
  console.log('Marking featured tours...');
  
  try {
    // Fetch highlighted tours from Airtable
    const records = await airtable('tourz').select({
      fields: ['title', 'isHighlighted'],
      filterByFormula: "{isHighlighted} = TRUE()"
    }).all();
    
    console.log(`Found ${records.length} highlighted tours in Airtable`);
    
    if (records.length === 0) {
      console.log('No highlighted tours to mark as featured');
      return;
    }
    
    // Get existing tours from Supabase
    const { data: existingTours, error: fetchError } = await supabase
      .from("tours")
      .select('id, title, featured');
    
    if (fetchError) {
      console.error('Error fetching tours:', fetchError);
      return;
    }
    
    // Create a case-insensitive map of tour titles to IDs
    const tourMap = new Map();
    existingTours.forEach(tour => {
      tourMap.set(tour.title.toLowerCase(), tour.id);
    });
    
    // Prepare updates
    const updates = [];
    let featuredOrder = 10;
    
    for (const record of records) {
      const title = record.fields.title;
      
      if (!title) continue;
      
      // Find the matching tour
      const tourId = tourMap.get(title.toLowerCase());
      
      if (tourId) {
        updates.push({
          id: tourId,
          featured: true,
          featured_order: featuredOrder
        });
        featuredOrder += 10;
      } else {
        console.log(`Warning: Could not find matching tour for "${title}"`);
      }
    }
    
    if (updates.length === 0) {
      console.log('No tours to update');
      return;
    }
    
    // Update tours in batch
    const { error: updateError } = await supabase
      .from("tours")
      .upsert(updates);
    
    if (updateError) {
      console.error('Error updating featured tours:', updateError);
    } else {
      console.log(`Successfully marked ${updates.length} tours as featured`);
    }
  } catch (error) {
    console.error('Error marking featured tours:', error);
  }
}

// Process CSV data and populate Airtable tourz table
async function importCSVToAirtable(csvFilePath) {
  console.log('Starting CSV to Airtable import...');
  
  const csv = require('csv-parser');
  const fs = require('fs');
  const path = require('path');
  
  // First, create categories, destinations, and tags based on CSV data
  const categories = new Set();
  const destinations = new Set();
  const tags = new Set();
  const records = [];
  
  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        records.push(data);
        
        // Collect categories and destinations
        if (data.category) categories.add(data.category);
        
        // Extract location for destinations (format: "Hurghada,Red Sea")
        if (data.location) {
          const locations = data.location.split(',');
          if (locations.length > 0) {
            destinations.add(locations[0].trim());
            
            // Add the region as a tag if it exists
            if (locations.length > 1) {
              tags.add(locations[1].trim());
            }
          }
        }
        
        // Add special tags based on badges and behaviors
        if (data['badges/0'] === 'SPECIAL_OFFER') tags.add('Special Offer');
        if (data['behaviours/hasFreeCancellation'] === 'checked') tags.add('Free Cancellation');
        if (data['behaviours/hasUnlimitedReschedule'] === 'checked') tags.add('Unlimited Reschedule');
        
        // Add languages as tags
        if (data['languages/0'] && data['languages/0'] !== '') {
          tags.add(`Language: ${data['languages/0']}`);
        }
      })
      .on('end', async () => {
        try {
          // Insert categories
          for (const category of categories) {
            await airtable('Categories').create({
              Name: category,
              Slug: createSlug(category),
              Description: `Tours related to ${category}`
            });
          }
          console.log(`Created ${categories.size} categories in Airtable`);
          
          // Insert destinations
          for (const destination of destinations) {
            await airtable('Destinations').create({
              Name: destination,
              Slug: createSlug(destination),
              Description: `Tours in the beautiful ${destination} area`
            });
          }
          console.log(`Created ${destinations.size} destinations in Airtable`);
          
          // Create tags
          for (const tag of tags) {
            await airtable('Tags').create({
              Name: tag,
              Slug: createSlug(tag),
              Description: `Tours tagged as ${tag}`
            });
          }
          console.log(`Created ${tags.size} tags in Airtable`);
          
          // Add common adventure tags if not already present
          const additionalTags = ['Adventure', 'Family-friendly', 'Cultural', 'Beach', 'Wildlife'];
          for (const tag of additionalTags) {
            if (!tags.has(tag)) {
              await airtable('Tags').create({
                Name: tag,
                Slug: createSlug(tag),
                Description: `Tours tagged as ${tag}`
              });
            }
          }
          
          // Process tours (limit to avoid rate limiting)
          const processLimit = Math.min(records.length, 30);
          for (let i = 0; i < processLimit; i++) {
            const item = records[i];
            
            // Skip if missing critical data
            if (!item.title || !item.description || !item.category) {
              console.log(`Skipping item ${i} due to missing critical data`);
              continue;
            }
            
            // Create tourz record with all available fields
            const tourzRecord = {
              title: item.title,
              description: item.description,
              category: item.category,
              location: item.location || '',
              code: item.code || '',
              'displayDuration/duration/days': parseInt(item['displayDuration/duration/days']) || 0,
              'displayDuration/duration/hours': parseInt(item['displayDuration/duration/hours']) || 0,
              'displayDuration/duration/minutes': parseInt(item['displayDuration/duration/minutes']) || 0,
              'displayDuration/isFlexible': item['displayDuration/isFlexible'] || 'false',
              'displayDuration/isFullyFlexible': item['displayDuration/isFullyFlexible'] || 'false',
              'displayDuration/isSingleTimeUnit': item['displayDuration/isSingleTimeUnit'] || 'false',
              'behaviours/hasFreeCancellation': item['behaviours/hasFreeCancellation'] === 'checked',
              'behaviours/hasUnlimitedReschedule': item['behaviours/hasUnlimitedReschedule'] === 'checked',
              'behaviours/shouldHideFromCrawlers': item['behaviours/shouldHideFromCrawlers'] || 'false',
              'badges/0': item['badges/0'] || '',
              'geolocation/latitude': parseFloat(item['geolocation/latitude']) || null,
              'geolocation/longitude': parseFloat(item['geolocation/longitude']) || null,
              'image/src': item['image/src'] || item['images/0/src'] || '',
              'image/alt': item['image/alt'] || item.title || '',
              'image/elementType': item['image/elementType'] || 'img',
              'image/isEnhanced': item['image/isEnhanced'] === 'checked',
              'image/sizes': item['image/sizes'] || '',
              'image/srcSet': item['image/srcSet'] || '',
              'isHighlighted': item.isHighlighted || 'false',
              'languages/0': item['languages/0'] || '',
              'maxTravelersAllowed': parseInt(item.maxTravelersAllowed) || 0,
              'maxTravelersPerUnit': parseInt(item.maxTravelersPerUnit) || 0,
              'price/retailPrice/amount': parseFloat(item['price/retailPrice/amount']) || 0,
              'price/retailPrice/currencyCode': item['price/retailPrice/currencyCode'] || 'USD',
              'price/retailPrice/currencySymbol': item['price/retailPrice/currencySymbol'] || '$',
              'price/isDiscounted': item['price/isDiscounted'] === 'checked',
              'price/hasTieredPricing': item['price/hasTieredPricing'] === 'checked'
            };
            
            // Add discounted price fields if available
            if (item['price/isDiscounted'] === 'checked') {
              tourzRecord['price/discountedPrice/amount'] = parseFloat(item['price/discountedPrice/amount']) || 0;
              tourzRecord['price/discountedPrice/currencyCode'] = item['price/discountedPrice/currencyCode'] || 'USD';
              tourzRecord['price/discountedPrice/currencySymbol'] = item['price/discountedPrice/currencySymbol'] || '$';
              tourzRecord['price/discountAmount/amount'] = parseFloat(item['price/discountAmount/amount']) || 0;
              tourzRecord['price/discountAmount/currencyCode'] = item['price/discountAmount/currencyCode'] || 'USD';
              tourzRecord['price/discountAmount/currencySymbol'] = item['price/discountAmount/currencySymbol'] || '$';
            }
            
            // Add image fields for all 6 images
            for (let imgIdx = 0; imgIdx <= 5; imgIdx++) {
              if (item[`images/${imgIdx}/src`]) {
                tourzRecord[`images/${imgIdx}/src`] = item[`images/${imgIdx}/src`];
                tourzRecord[`images/${imgIdx}/alt`] = item[`images/${imgIdx}/alt`] || item.title;
                tourzRecord[`images/${imgIdx}/elementType`] = item[`images/${imgIdx}/elementType`] || 'img';
                tourzRecord[`images/${imgIdx}/isEnhanced`] = item[`images/${imgIdx}/isEnhanced`] === 'checked';
                tourzRecord[`images/${imgIdx}/sizes`] = item[`images/${imgIdx}/sizes`] || '';
                tourzRecord[`images/${imgIdx}/srcSet`] = item[`images/${imgIdx}/srcSet`] || '';
              }
            }
            
            // Add rating fields
            tourzRecord['rating/exactScore'] = parseFloat(item['rating/exactScore']) || 4.5;
            tourzRecord['rating/reviewCount'] = parseInt(item['rating/reviewCount']) || 0;
            tourzRecord['rating/score'] = parseFloat(item['rating/score']) || 5.0;
            
            // Add quality badges
            tourzRecord['qualityBadges/isBestConversion'] = item['qualityBadges/isBestConversion'] || 'false';
            tourzRecord['qualityBadges/isExcellent'] = item['qualityBadges/isExcellent'] || 'false';
            
            // Add primaryLabel and URL
            tourzRecord['primaryLabel'] = item.primaryLabel || 'Other Experience';
            tourzRecord['url'] = item.url || '';
            tourzRecord['videoCount'] = parseInt(item.videoCount) || 0;
            
            // Create the record in Airtable
            const record = await airtable('tourz').create(tourzRecord);
            
            console.log(`Created tour: ${item.title}`);
            
            // Create tour features
            await createTourFeatures(record.id, tourzRecord);
            
            // Create tour tags
            await createTourTags(record.id, item, tags);
          }
          
          console.log(`Successfully imported ${processLimit} tours to Airtable`);
          resolve(true);
        } catch (error) {
          console.error('Error importing CSV to Airtable:', error);
          reject(error);
        }
      });
  });
}

// Helper function to create tour features
async function createTourFeatures(tourId, tourData) {
  // Duration feature
  const durationDays = tourData['displayDuration/duration/days'];
  const durationHours = tourData['displayDuration/duration/hours'];
  const durationMinutes = tourData['displayDuration/duration/minutes'];
  
  if (durationDays || durationHours || durationMinutes) {
    await airtable('Tour_Features').create({
      Tour: [tourId],
      Icon: 'clock',
      Label: 'Duration',
      Description: `${durationDays ? durationDays + ' days ' : ''}${durationHours ? durationHours + ' hours ' : ''}${durationMinutes ? durationMinutes + ' minutes' : ''}`
    });
  }
  
  // Price feature
  const retailPrice = tourData['price/retailPrice/amount'];
  const isDiscounted = tourData['price/isDiscounted'];
  const discountedPrice = tourData['price/discountedPrice/amount'];
  const currencySymbol = tourData['price/retailPrice/currencySymbol'];
  
  await airtable('Tour_Features').create({
    Tour: [tourId],
    Icon: 'tag',
    Label: 'Price',
    Description: `${currencySymbol}${isDiscounted ? discountedPrice : retailPrice}`
  });
  
  // Free cancellation
  if (tourData['behaviours/hasFreeCancellation']) {
    await airtable('Tour_Features').create({
      Tour: [tourId],
      Icon: 'rotate-ccw',
      Label: 'Free Cancellation',
      Description: 'Cancel anytime for a full refund'
    });
  }
  
  // Unlimited reschedule
  if (tourData['behaviours/hasUnlimitedReschedule']) {
    await airtable('Tour_Features').create({
      Tour: [tourId],
      Icon: 'calendar',
      Label: 'Unlimited Reschedule',
      Description: 'Reschedule your tour as needed'
    });
  }
  
  // Group size
  if (tourData.maxTravelersAllowed) {
    await airtable('Tour_Features').create({
      Tour: [tourId],
      Icon: 'users',
      Label: 'Group Size',
      Description: `Maximum ${tourData.maxTravelersAllowed} travelers`
    });
  }
  
  // Languages
  if (tourData['languages/0']) {
    await airtable('Tour_Features').create({
      Tour: [tourId],
      Icon: 'message-square',
      Label: 'Language',
      Description: `Tour available in ${tourData['languages/0']}`
    });
  }
}

// Helper function to create tour tags
async function createTourTags(tourId, item, existingTags) {
  const tagArray = [];
  
  // Basic category tag
  tagArray.push(item.category);
  
  // Region tag if available
  if (item.location && item.location.includes(',')) {
    tagArray.push(item.location.split(',')[1].trim());
  }
  
  // Special offer and behaviors tags
  if (item['badges/0'] === 'SPECIAL_OFFER') tagArray.push('Special Offer');
  if (item['behaviours/hasFreeCancellation'] === 'checked') tagArray.push('Free Cancellation');
  if (item['behaviours/hasUnlimitedReschedule'] === 'checked') tagArray.push('Unlimited Reschedule');
  
  // Add language tag
  if (item['languages/0'] && item['languages/0'] !== '') {
    tagArray.push(`Language: ${item['languages/0']}`);
  }
  
  // Add content-based tags
  const combinedText = `${item.title} ${item.description}`.toLowerCase();
  const contentTagMap = [
    { name: 'Beach', keywords: ['beach', 'island', 'seaside', 'coast', 'shore', 'bay', 'snorkel'] },
    { name: 'Adventure', keywords: ['adventure', 'exciting', 'thrill', 'explore', 'action', 'dive', 'safari'] },
    { name: 'Wildlife', keywords: ['wildlife', 'animals', 'marine', 'fish', 'dolphin', 'coral'] },
    { name: 'Cultural', keywords: ['cultural', 'history', 'heritage', 'ancient', 'museum', 'temple', 'pyramid'] },
    { name: 'Family-friendly', keywords: ['family', 'kids', 'children', 'beginner', 'friendly'] }
  ];
  
  for (const tagInfo of contentTagMap) {
    if (tagInfo.keywords.some(keyword => combinedText.includes(keyword))) {
      tagArray.push(tagInfo.name);
    }
  }
  
  // Create tour tags
  for (const tagName of tagArray) {
    await airtable('Tour_Tags').create({
      Tour: [tourId],
      Tag: tagName
    });
  }
}

// Helper function to create slugs
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Helper function to create slugs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Export functions for use in other scripts
module.exports = {
  syncAirtableToSupabase,
  importCSVToAirtable,
  syncCategories,
  syncDestinations,
  syncTags,
  syncTours,
  syncTourRelationships,
  markFeaturedTours,
  createTourFeatures,
  createTourTags
};

// Run the script if invoked directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  const csvPath = args[1] || './tourz.csv';
  
  if (command === 'import-csv') {
    importCSVToAirtable(csvPath);
  } else if (command === 'sync') {
    syncAirtableToSupabase();
  } else {
    console.error('Unknown command. Valid commands are:');
    console.error('  - import-csv [csvPath]: Import CSV data to Airtable');
    console.error('  - sync: Sync data from Airtable to Supabase');
  }
} 