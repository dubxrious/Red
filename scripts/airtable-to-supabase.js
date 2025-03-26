// Airtable to Supabase Sync Script
const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');
require('dotenv').config();

// Configuration - Replace these with your actual credentials
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_airtable_api_key';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_airtable_base_id';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rihqmooghbklkdchzzgm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w';

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Table mapping between Airtable and Supabase
const tableMapping = {
  'tourx': 'tours',
  'Categories': 'categories',
  'Destinations': 'destinations',
  'Tags': 'tags',
  'Tour Tags': 'tour_tags',
  'Tour Features': 'tour_features',
  'Tour Availability': 'tour_availability',
  'Bookings': 'bookings',
  'Reviews': 'reviews'
};

// Field mapping for main tourx table
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
    
    console.log('Sync completed successfully!');
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

// Sync categories
async function syncCategories() {
  console.log('Syncing categories...');
  
  try {
    // Clear existing categories (optional - remove if you want to keep existing data)
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Get unique categories from tourx table
    const records = await airtable('tourx').select({
      fields: ['category']
    }).all();
    
    // Extract unique categories
    const uniqueCategories = [...new Set(records.map(record => record.fields.category).filter(Boolean))];
    
    // Transform for Supabase
    const categories = uniqueCategories.map(categoryName => ({
      name: categoryName,
      slug: createSlug(categoryName),
      description: `Tours related to ${categoryName}`,
      image: 'https://via.placeholder.com/800x600'
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('categories').insert(categories);
    
    if (error) throw error;
    console.log(`Synced ${categories.length} categories`);
    
    return data;
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
}

// Sync destinations
async function syncDestinations() {
  console.log('Syncing destinations...');
  
  try {
    // Clear existing destinations
    await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Get unique locations from tourx table
    const records = await airtable('tourx').select({
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
    
    // Transform for Supabase
    const destinations = [...uniqueDestinations].map(destinationName => ({
      name: destinationName,
      slug: createSlug(destinationName),
      description: `Tours in the beautiful ${destinationName} area`,
      image: 'https://via.placeholder.com/800x600'
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('destinations').insert(destinations);
    
    if (error) throw error;
    console.log(`Synced ${destinations.length} destinations`);
    
    return data;
  } catch (error) {
    console.error('Error syncing destinations:', error);
    throw error;
  }
}

// Sync tags
async function syncTags() {
  console.log('Syncing tags...');
  
  try {
    // Clear existing tags
    await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Fetch from Airtable
    const records = await airtable('Tags').select().all();
    
    // Transform for Supabase
    const tags = records.map(record => ({
      name: record.fields.Name,
      slug: record.fields.Slug || createSlug(record.fields.Name),
      description: record.fields.Description || `Tours tagged with ${record.fields.Name}`
    }));
    
    // Insert into Supabase
    const { data, error } = await supabase.from('tags').insert(tags);
    
    if (error) throw error;
    console.log(`Synced ${tags.length} tags`);
    
    return data;
  } catch (error) {
    console.error('Error syncing tags:', error);
    throw error;
  }
}

// Sync tours from tourx
async function syncTours() {
  console.log('Syncing tours from tourx table...');
  
  try {
    // Clear existing tours
    await supabase.from('tours').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Get category and destination mappings (for id lookup)
    const { data: categories } = await supabase.from('categories').select('id, name, slug');
    const { data: destinations } = await supabase.from('destinations').select('id, name, slug');
    
    // Create lookup maps
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    });
    
    const destinationMap = new Map();
    destinations.forEach(dest => {
      destinationMap.set(dest.name.toLowerCase(), dest.id);
      destinationMap.set(dest.slug.toLowerCase(), dest.id);
    });
    
    // Fetch from Airtable
    const records = await airtable('tourx').select().all();
    
    // Transform for Supabase
    const tours = records.map(record => {
      // Look up category_id
      let categoryId = null;
      if (record.fields.category) {
        const categoryName = record.fields.category.toLowerCase();
        categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
          console.warn(`Category not found: ${record.fields.category}`);
        }
      }
      
      // Look up destination_id
      let destinationId = null;
      if (record.fields.location) {
        let locationParts = [];
        const locations = Array.isArray(record.fields.location) 
          ? record.fields.location 
          : [record.fields.location];
          
        if (locations.length > 0 && locations[0].includes(',')) {
          locationParts = locations[0].split(',');
        } else if (locations.length > 0) {
          locationParts = [locations[0]];
        }
        
        if (locationParts.length > 0) {
          const destinationName = locationParts[0].trim().toLowerCase();
          destinationId = destinationMap.get(destinationName);
          
          if (!destinationId) {
            console.warn(`Destination not found: ${locationParts[0].trim()}`);
          }
        }
      }

      // Handle pricing
      let retailPrice = record.fields['price/retailPrice/amount'] || 0;
      let discountedPrice = record.fields['price/isDiscounted'] 
        ? record.fields['price/discountedPrice/amount'] 
        : null;
      const currencyCode = record.fields['price/retailPrice/currencyCode'] || 'USD';
      const currencySymbol = record.fields['price/retailPrice/currencySymbol'] || '$';

      // Handle images - collect all image sources
      const images = [];
      // Main image
      if (record.fields['image/src']) {
        images.push(record.fields['image/src']);
      }
      
      // Additional images
      for (let i = 0; i <= 5; i++) {
        const imgField = `images/${i}/src`;
        if (record.fields[imgField]) {
          images.push(record.fields[imgField]);
        }
      }
      
      // Filter out duplicates and null/undefined values
      const uniqueImages = [...new Set(images)].filter(Boolean);
      
      // Get the main image (first one or placeholder)
      const mainImage = uniqueImages.length > 0 
        ? uniqueImages[0] 
        : 'https://via.placeholder.com/800x600';

      // Create slug if not present
      const slug = createSlug(record.fields.title) + '-' + record.id.substring(0, 8);

      return {
        title: record.fields.title,
        slug: slug,
        description: record.fields.description,
        category_id: categoryId,
        destination_id: destinationId,
        duration_days: record.fields['displayDuration/duration/days'] || 0,
        duration_hours: record.fields['displayDuration/duration/hours'] || 0,
        duration_minutes: record.fields['displayDuration/duration/minutes'] || 0,
        is_flexible_duration: record.fields['displayDuration/isFlexible'] === 'true',
        retail_price: retailPrice,
        discounted_price: discountedPrice,
        currency_code: currencyCode,
        currency_symbol: currencySymbol,
        rating: record.fields['rating/exactScore'] || 4.5,
        review_count: record.fields['rating/reviewCount'] || 0,
        image_url: mainImage,
        images: uniqueImages,
        status: 'active',
        pickup_available: record.fields['behaviours/hasFreeCancellation'] === 'checked',
        featured: record.fields['isHighlighted'] === 'true',
        code: record.fields['code'] || '',
        max_travelers: record.fields['maxTravelersAllowed'] || 0,
        languages: record.fields['languages/0'] || '',
        latitude: record.fields['geolocation/latitude'] || null,
        longitude: record.fields['geolocation/longitude'] || null,
        external_url: record.fields['url'] || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        airtable_id: record.id, // Store Airtable ID for reference
        badges: record.fields['badges/0'] || null,
        free_cancellation: record.fields['behaviours/hasFreeCancellation'] === 'checked',
        unlimited_reschedule: record.fields['behaviours/hasUnlimitedReschedule'] === 'checked'
      };
    });
    
    // Insert into Supabase
    const { data, error } = await supabase.from('tours').insert(tours);
    
    if (error) throw error;
    console.log(`Synced ${tours.length} tours`);
    
    return data;
  } catch (error) {
    console.error('Error syncing tours:', error);
    throw error;
  }
}

// Sync tour features, tags, etc.
async function syncTourRelationships() {
  console.log('Syncing tour relationships...');
  
  try {
    // Clear existing relationships
    await supabase.from('tour_features').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tour_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Get tours from Supabase to get their UUIDs
    const { data: tourData } = await supabase.from('tours').select('id, slug, airtable_id');
    const tourMap = new Map();
    tourData.forEach(tour => {
      tourMap.set(tour.airtable_id, tour.id);
    });
    
    // Get tags from Supabase
    const { data: tagData } = await supabase.from('tags').select('id, name, slug');
    const tagMap = new Map();
    tagData.forEach(tag => {
      tagMap.set(tag.name.toLowerCase(), tag.id);
      tagMap.set(tag.slug.toLowerCase(), tag.id);
    });
    
    // Fetch tour features from Airtable
    const featureRecords = await airtable('Tour Features').select().all();
    
    // Transform features for Supabase
    const features = [];
    for (const record of featureRecords) {
      if (record.fields.Tour && record.fields.Label) {
        // Find associated tour
        const tourId = record.fields.Tour.map(id => tourMap.get(id)).filter(Boolean)[0];
        
        if (tourId) {
          features.push({
            tour_id: tourId,
            icon: record.fields.Icon || 'info',
            label: record.fields.Label,
            description: record.fields.Description || ''
          });
        }
      }
    }
    
    // Insert features
    if (features.length > 0) {
      const { error: featuresError } = await supabase.from('tour_features').insert(features);
      if (featuresError) throw featuresError;
      console.log(`Synced ${features.length} tour features`);
    }
    
    // Fetch tour tags from Airtable
    const tagRecords = await airtable('Tour Tags').select().all();
    
    // Transform tags for Supabase
    const tourTags = [];
    for (const record of tagRecords) {
      if (record.fields.Tour && record.fields.Tag) {
        // Find associated tour and tag
        const tourId = record.fields.Tour.map(id => tourMap.get(id)).filter(Boolean)[0];
        const tagName = record.fields.Tag.toLowerCase();
        const tagId = tagMap.get(tagName);
        
        if (tourId && tagId) {
          tourTags.push({
            tour_id: tourId,
            tag_id: tagId
          });
        }
      }
    }
    
    // Insert tour tags
    if (tourTags.length > 0) {
      const { error: tagsError } = await supabase.from('tour_tags').insert(tourTags);
      if (tagsError) throw tagsError;
      console.log(`Synced ${tourTags.length} tour tags`);
    }
    
    return { features, tourTags };
  } catch (error) {
    console.error('Error syncing tour relationships:', error);
    throw error;
  }
}

// Process CSV data and populate Airtable tourx table
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
            
            // Create tourx record with all available fields
            const tourxRecord = {
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
              tourxRecord['price/discountedPrice/amount'] = parseFloat(item['price/discountedPrice/amount']) || 0;
              tourxRecord['price/discountedPrice/currencyCode'] = item['price/discountedPrice/currencyCode'] || 'USD';
              tourxRecord['price/discountedPrice/currencySymbol'] = item['price/discountedPrice/currencySymbol'] || '$';
              tourxRecord['price/discountAmount/amount'] = parseFloat(item['price/discountAmount/amount']) || 0;
              tourxRecord['price/discountAmount/currencyCode'] = item['price/discountAmount/currencyCode'] || 'USD';
              tourxRecord['price/discountAmount/currencySymbol'] = item['price/discountAmount/currencySymbol'] || '$';
            }
            
            // Add image fields for all 6 images
            for (let imgIdx = 0; imgIdx <= 5; imgIdx++) {
              if (item[`images/${imgIdx}/src`]) {
                tourxRecord[`images/${imgIdx}/src`] = item[`images/${imgIdx}/src`];
                tourxRecord[`images/${imgIdx}/alt`] = item[`images/${imgIdx}/alt`] || item.title;
                tourxRecord[`images/${imgIdx}/elementType`] = item[`images/${imgIdx}/elementType`] || 'img';
                tourxRecord[`images/${imgIdx}/isEnhanced`] = item[`images/${imgIdx}/isEnhanced`] === 'checked';
                tourxRecord[`images/${imgIdx}/sizes`] = item[`images/${imgIdx}/sizes`] || '';
                tourxRecord[`images/${imgIdx}/srcSet`] = item[`images/${imgIdx}/srcSet`] || '';
              }
            }
            
            // Add rating fields
            tourxRecord['rating/exactScore'] = parseFloat(item['rating/exactScore']) || 4.5;
            tourxRecord['rating/reviewCount'] = parseInt(item['rating/reviewCount']) || 0;
            tourxRecord['rating/score'] = parseFloat(item['rating/score']) || 5.0;
            
            // Add quality badges
            tourxRecord['qualityBadges/isBestConversion'] = item['qualityBadges/isBestConversion'] || 'false';
            tourxRecord['qualityBadges/isExcellent'] = item['qualityBadges/isExcellent'] || 'false';
            
            // Add primaryLabel and URL
            tourxRecord['primaryLabel'] = item.primaryLabel || 'Other Experience';
            tourxRecord['url'] = item.url || '';
            tourxRecord['videoCount'] = parseInt(item.videoCount) || 0;
            
            // Create the record in Airtable
            const record = await airtable('tourx').create(tourxRecord);
            
            console.log(`Created tour: ${item.title}`);
            
            // Create tour features
            await createTourFeatures(record.id, tourxRecord);
            
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
    await airtable('Tour Features').create({
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
  
  await airtable('Tour Features').create({
    Tour: [tourId],
    Icon: 'tag',
    Label: 'Price',
    Description: `${currencySymbol}${isDiscounted ? discountedPrice : retailPrice}`
  });
  
  // Free cancellation
  if (tourData['behaviours/hasFreeCancellation']) {
    await airtable('Tour Features').create({
      Tour: [tourId],
      Icon: 'rotate-ccw',
      Label: 'Free Cancellation',
      Description: 'Cancel anytime for a full refund'
    });
  }
  
  // Unlimited reschedule
  if (tourData['behaviours/hasUnlimitedReschedule']) {
    await airtable('Tour Features').create({
      Tour: [tourId],
      Icon: 'calendar',
      Label: 'Unlimited Reschedule',
      Description: 'Reschedule your tour as needed'
    });
  }
  
  // Group size
  if (tourData.maxTravelersAllowed) {
    await airtable('Tour Features').create({
      Tour: [tourId],
      Icon: 'users',
      Label: 'Group Size',
      Description: `Maximum ${tourData.maxTravelersAllowed} travelers`
    });
  }
  
  // Languages
  if (tourData['languages/0']) {
    await airtable('Tour Features').create({
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
    await airtable('Tour Tags').create({
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

// Run the script based on command-line arguments
const args = process.argv.slice(2);
if (args[0] === 'import-csv') {
  // Run CSV import to Airtable
  const csvPath = args[1] || path.join(__dirname, '..', 'dataset_viator.csv');
  importCSVToAirtable(csvPath)
    .then(() => {
      console.log('CSV import completed. Now run "node airtable-to-supabase.js sync" to sync to Supabase');
    })
    .catch(err => {
      console.error('CSV import failed:', err);
      process.exit(1);
    });
} else if (args[0] === 'sync') {
  // Run Airtable to Supabase sync
  syncAirtableToSupabase()
    .then(() => {
      console.log('Sync completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('Sync failed:', err);
      process.exit(1);
    });
} else {
  console.log(`
Airtable to Supabase Sync Tool

Usage:
  node airtable-to-supabase.js import-csv [csv-path]  - Import CSV data to Airtable
  node airtable-to-supabase.js sync                   - Sync data from Airtable to Supabase

Instructions:
1. Create an .env file with your credentials:
   AIRTABLE_API_KEY=your_api_key
   AIRTABLE_BASE_ID=your_base_id
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key

2. Create the following tables in your Airtable base:
   - Categories
   - Destinations
   - Tags
   - Tours
   - Tour Features
   - Tour Tags

3. Run the import-csv command to populate Airtable
4. Run the sync command to sync from Airtable to Supabase
  `);
} 