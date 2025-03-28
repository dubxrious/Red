#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * 
 * This script tests the direct connection to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to Supabase with:');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`Key: ${SUPABASE_KEY.substring(0, 10)}...${SUPABASE_KEY.substring(SUPABASE_KEY.length - 5)}`);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabase() {
  try {
    console.log('\nTesting categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(3);
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log(`✅ Successfully fetched ${categories.length} categories`);
      console.log(categories.map(c => c.name));
    }
    
    console.log('\nTesting tours table...');
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select('*')
      .limit(3);
    
    if (toursError) {
      console.error('Error fetching tours:', toursError);
    } else {
      console.log(`✅ Successfully fetched ${tours.length} tours`);
      console.log(tours.map(t => t.title));
      
      // Check if featured column exists
      if (tours[0]) {
        console.log('\nColumn check:');
        console.log(`- featured column exists: ${tours[0].hasOwnProperty('featured')}`);
        console.log(`- featured_order column exists: ${tours[0].hasOwnProperty('featured_order')}`);
        console.log('\nSample tour data:');
        console.log(JSON.stringify(tours[0], null, 2).substring(0, 500) + '...');
      }
    }
    
    console.log('\nTesting featured tours query...');
    const { data: featuredTours, error: featuredError } = await supabase
      .from('tours')
      .select('*')
      .eq('featured', true)
      .limit(3);
    
    if (featuredError) {
      console.error('Error fetching featured tours:', featuredError);
      
      if (featuredError.message.includes('does not exist')) {
        console.log('\nTrying alternate query with rating...');
        const { data: ratingTours, error: ratingError } = await supabase
          .from('tours')
          .select('*')
          .order('rating_exact_score', { ascending: false })
          .limit(3);
        
        if (ratingError) {
          console.error('Error with rating query:', ratingError);
        } else {
          console.log(`✅ Successfully fetched ${ratingTours.length} tours by rating`);
        }
      }
    } else {
      console.log(`✅ Successfully fetched ${featuredTours ? featuredTours.length : 0} featured tours`);
    }
    
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

// Run the test
testSupabase()
  .then(() => {
    console.log('\nTests completed. Check the results above.');
  })
  .catch(error => {
    console.error('\nTest failed with error:', error);
    process.exit(1);
  }); 