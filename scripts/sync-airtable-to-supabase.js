#!/usr/bin/env node

/**
 * Airtable to Supabase Sync Script
 * 
 * This script automates the process of synchronizing data from Airtable to Supabase
 */

const airtableToSupabase = require('./airtable-to-supabase');
require('dotenv').config();

// Check for required environment variables
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

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'sync';
const csvPath = args[1] || './tourz.csv';

async function runSync() {
  console.log('======================================');
  console.log('Airtable to Supabase Synchronization');
  console.log('======================================\n');
  
  try {
    if (command === 'import-csv') {
      console.log(`Importing CSV data from ${csvPath} to Airtable...\n`);
      await airtableToSupabase.importCSVToAirtable(csvPath);
      console.log('\n✅ CSV data successfully imported to Airtable!');
      console.log('\nNext step: Run "node scripts/sync-airtable-to-supabase.js sync" to sync data to Supabase');
    } else if (command === 'sync') {
      console.log('Syncing data from Airtable to Supabase...\n');
      await airtableToSupabase.syncAirtableToSupabase();
      console.log('\n✅ Data successfully synced from Airtable to Supabase!');
    } else if (command === 'test') {
      console.log('Testing connections...\n');
      // Import the test script and run it
      const testScript = require('./test-airtable-sync');
      const skipCsvCheck = command === 'sync' || args.includes('--skip-csv');
      await testScript.runTest(true); // Skip CSV check for direct Airtable to Supabase sync
    } else {
      console.error('❌ Unknown command. Valid commands are:');
      console.error('   - import-csv [csvPath]: Import CSV data to Airtable');
      console.error('   - sync: Sync data from Airtable to Supabase');
      console.error('   - test: Test connections to Airtable and Supabase');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during process:');
    console.error(error);
    process.exit(1);
  }
}

// Run the sync process
runSync(); 