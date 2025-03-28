#!/usr/bin/env node

/**
 * Clear Supabase Data Script
 * 
 * This script clears existing data from Supabase tables before syncing fresh data from Airtable
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Define tables to clear (in order of dependency)
const tablesToClear = [
  'tour_tags',
  'tour_features',
  'tour_availability',
  'bookings',
  'reviews',
  'tours',
  'tags',
  'categories',
  'destinations'
];

async function clearSupabaseData() {
  console.log('Starting Supabase data clearing process...');
  
  try {
    // Clear each table in order
    for (const table of tablesToClear) {
      try {
        console.log(`Clearing data from ${table}...`);
        
        // First check if table exists by trying to get a single row
        const { data: checkData, error: checkError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (checkError) {
          console.log(`Table ${table} might not exist: ${checkError.message}`);
          continue;
        }
        
        // If data exists, try to count records
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.log(`Could not count records in ${table}: ${countError.message}`);
          continue;
        }
        
        console.log(`Found ${count} records in ${table}`);
        
        // If there are records, delete them in batches
        if (count > 0) {
          let deleted = 0;
          
          // Get all IDs first
          const { data: allIds, error: idsError } = await supabase
            .from(table)
            .select('id');
            
          if (idsError) {
            console.error(`Could not get IDs from ${table}: ${idsError.message}`);
            continue;
          }
          
          // Delete each record individually
          for (const record of allIds) {
            const { error: deleteError } = await supabase
              .from(table)
              .delete()
              .eq('id', record.id);
              
            if (deleteError) {
              console.error(`Error deleting record ${record.id} from ${table}: ${deleteError.message}`);
            } else {
              deleted++;
            }
          }
          
          console.log(`✅ Deleted ${deleted}/${count} records from ${table}`);
        } else {
          console.log(`✅ Table ${table} is already empty`);
        }
      } catch (tableError) {
        console.log(`Error with ${table}: ${tableError.message}`);
      }
    }
    
    console.log('\nData clearing complete!');
    return true;
  } catch (error) {
    console.error('Unexpected error during data clearing:', error);
    return false;
  }
}

// Run the process
clearSupabaseData()
  .then(success => {
    if (success) {
      console.log('\nAll Supabase tables have been cleared. Ready for fresh sync!');
    } else {
      console.log('\nData clearing process encountered errors. Check the logs above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\nUnhandled error:', error);
    process.exit(1);
  }); 