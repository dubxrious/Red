#!/usr/bin/env node

/**
 * Test script for Airtable to Supabase integration
 * 
 * This script tests the connection to both Airtable and Supabase
 * and validates that the sync can run properly
 */

const { createClient } = require('@supabase/supabase-js');
const Airtable = require('airtable');
require('dotenv').config();

// Check if environment variables are set
console.log('Checking environment variables...');

const requiredEnvVars = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease add these to your .env file and try again.');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');

// Initialize clients
console.log('\nInitializing API clients...');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('\nTesting Supabase connection...');
  
  try {
    const { data, error } = await supabase.from('tours').select('count', { count: 'exact' });
    
    if (error) throw error;
    
    console.log(`✅ Successfully connected to Supabase! (Current tour count: ${data[0].count})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Test Airtable connection
async function testAirtableConnection() {
  console.log('\nTesting Airtable connection...');
  
  try {
    // Attempt to list records from tourz table (instead of getting schema)
    const records = await airtable('tourz').select({
      maxRecords: 1
    }).firstPage();
    
    console.log(`✅ Successfully connected to Airtable! (Found ${records.length} records in tourz table)`);
    
    // Check if all required tables exist by trying to select from each
    const requiredTables = ['tourz', 'Categories', 'Destinations', 'Tags', 'Tour Features', 'Tour Tags'];
    const missingTables = [];
    
    for (const tableName of requiredTables) {
      try {
        await airtable(tableName).select({ maxRecords: 1 }).firstPage();
      } catch (error) {
        if (error.message.includes('could not be found') || error.message.includes('does not exist')) {
          missingTables.push(tableName);
        }
      }
    }
    
    if (missingTables.length > 0) {
      console.warn('⚠️ Some required Airtable tables are missing:');
      missingTables.forEach(table => {
        console.warn(`   - ${table}`);
      });
      console.warn('\nPlease create these tables in your Airtable base.');
      return false;
    }
    
    console.log('✅ All required Airtable tables are present.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Airtable:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      console.error('\n   Check that your AIRTABLE_API_KEY is correct.');
    } else if (error.message.includes('not found') || error.message.includes('doesn\'t exist')) {
      console.error('\n   Check that your AIRTABLE_BASE_ID is correct.');
    } else if (error.message.includes('could not be found') || error.message.includes('does not exist')) {
      console.error('\n   Check that you have created the required tables in your Airtable base.');
      console.error('   Required tables: tourz, Categories, Destinations, Tags, Tour Features, Tour Tags');
    }
    
    return false;
  }
}

// Test CSV file
async function testCsvFile(csvPath) {
  console.log(`\nTesting CSV file at ${csvPath}...`);
  
  const fs = require('fs');
  
  try {
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV file not found at ${csvPath}`);
      return false;
    }
    
    // Read first few lines to validate format
    const readStream = fs.createReadStream(csvPath, { encoding: 'utf8' });
    let buffer = '';
    let lineCount = 0;
    const headerFields = [];
    
    for await (const chunk of readStream) {
      buffer += chunk;
      const lines = buffer.split('\n');
      
      // Process all complete lines
      for (let i = 0; i < lines.length - 1; i++) {
        if (lineCount === 0) {
          // Process header to check for required fields
          headerFields.push(...lines[i].split(','));
        }
        
        lineCount++;
        if (lineCount >= 5) break; // Only need the first few lines
      }
      
      // Keep the last incomplete line in the buffer
      buffer = lines[lines.length - 1];
      
      if (lineCount >= 5) break;
    }
    
    readStream.destroy();
    
    // Check for required fields
    const requiredFields = ['title', 'description', 'category', 'location'];
    const missingFields = requiredFields.filter(field => !headerFields.includes(field));
    
    if (missingFields.length > 0) {
      console.error('❌ CSV file is missing required fields:');
      missingFields.forEach(field => {
        console.error(`   - ${field}`);
      });
      return false;
    }
    
    console.log(`✅ CSV file is valid! (${lineCount} lines read, ${headerFields.length} fields found)`);
    return true;
  } catch (error) {
    console.error('❌ Error reading CSV file:');
    console.error(`   ${error.message}`);
    return false;
  }
}

// Main function
async function runTest(skipCsvCheck = false) {
  console.log('=======================================');
  console.log('Airtable to Supabase Integration Test');
  console.log('=======================================\n');
  
  // Test connections
  const supabaseConnected = await testSupabaseConnection();
  const airtableConnected = await testAirtableConnection();
  
  // Test CSV file if specified and not skipped
  let csvValid = true; // Default to true if skipping
  if (!skipCsvCheck) {
    const csvPath = process.argv[2] || './tourz.csv';
    csvValid = await testCsvFile(csvPath);
  } else {
    console.log('\nSkipping CSV validation (not needed for direct Airtable sync)');
  }
  
  console.log('\n---------------------------------------');
  console.log('Test Results:');
  console.log('---------------------------------------');
  console.log(`Supabase Connection: ${supabaseConnected ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Airtable Connection: ${airtableConnected ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!skipCsvCheck) {
    console.log(`CSV File Validation: ${csvValid ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  const allPassed = supabaseConnected && airtableConnected && (skipCsvCheck || csvValid);
  
  console.log('\n---------------------------------------');
  console.log(`Overall Test: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Your setup is ready for the Airtable to Supabase integration!');
    console.log('\nNext steps:');
    if (!skipCsvCheck) {
      console.log('1. Run "node scripts/airtable-to-supabase.js import-csv tourz.csv" to import data to Airtable');
    }
    console.log(`${skipCsvCheck ? '1' : '2'}. Run "node scripts/sync-airtable-to-supabase.js sync" to sync from Airtable to Supabase`);
  } else {
    console.log('\n⚠️ Please fix the issues above before running the integration.');
  }
  
  return allPassed;
}

// Export the runTest function
module.exports = { runTest };

// Run the test if this script is run directly
if (require.main === module) {
  runTest().then(passed => {
    process.exit(passed ? 0 : 1);
  });
} 