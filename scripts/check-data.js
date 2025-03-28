#!/usr/bin/env node

/**
 * Supabase Data Check Script
 * 
 * This script checks the data in Supabase to verify that the sync worked
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
  console.log('Checking Supabase data...');
  
  // Check tours
  const { data: tours, error: toursError } = await supabase
    .from('tours')
    .select('count', { count: 'exact' });
  
  if (toursError) {
    console.error('Error checking tours:', toursError);
  } else {
    console.log(`Total tours in database: ${tours[0].count}`);
  }
  
  // Check categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('count', { count: 'exact' });
  
  if (catError) {
    console.error('Error checking categories:', catError);
  } else {
    console.log(`Total categories in database: ${categories[0].count}`);
  }
  
  // Check destinations
  const { data: destinations, error: destError } = await supabase
    .from('destinations')
    .select('count', { count: 'exact' });
  
  if (destError) {
    console.error('Error checking destinations:', destError);
  } else {
    console.log(`Total destinations in database: ${destinations[0].count}`);
  }
  
  // Check tags
  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('count', { count: 'exact' });
  
  if (tagsError) {
    console.error('Error checking tags:', tagsError);
  } else {
    console.log(`Total tags in database: ${tags[0].count}`);
  }
  
  // Get a few sample tours to verify data quality
  const { data: sampleTours, error: sampleError } = await supabase
    .from('tours')
    .select('title, slug, description, retail_price, category_id, destination_id')
    .limit(5);
  
  if (sampleError) {
    console.error('Error fetching sample tours:', sampleError);
  } else {
    console.log('\nSample Tours:');
    sampleTours.forEach(tour => {
      console.log(`- ${tour.title} (${tour.slug})`);
      console.log(`  Price: $${tour.retail_price}`);
      console.log(`  Category ID: ${tour.category_id || 'None'}`);
      console.log(`  Destination ID: ${tour.destination_id || 'None'}`);
      console.log('');
    });
  }
}

// Run the check
checkData()
  .then(() => {
    console.log('Data check complete!');
  })
  .catch(error => {
    console.error('Error during data check:', error);
    process.exit(1);
  }); 