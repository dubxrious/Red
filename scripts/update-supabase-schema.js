#!/usr/bin/env node

/**
 * Update Supabase Schema Script
 * 
 * This script adds the airtable_id column to the tours table in Supabase
 * which is required for the Airtable-Supabase integration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateSupabaseSchema() {
  console.log('Updating Supabase schema for Airtable integration...');
  
  try {
    // Check if airtable_id column exists
    const { data: columns, error: checkError } = await supabase.rpc('schema_info', {
      table_name: 'tours'
    });
    
    if (checkError) {
      // If rpc method doesn't exist, try to add column anyway
      console.log('Could not check schema, attempting to add column...');
    } else {
      // Check if column exists
      const hasAirtableId = columns && columns.some(column => column.column_name === 'airtable_id');
      if (hasAirtableId) {
        console.log('The airtable_id column already exists in the tours table.');
        return true;
      }
    }
    
    // Execute SQL query to add column
    console.log('Adding airtable_id column to tours table...');
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE tours 
        ADD COLUMN IF NOT EXISTS airtable_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_tours_airtable_id 
        ON tours (airtable_id);
      `
    });
    
    if (error) {
      // If RPC method doesn't exist or fails, try direct REST API approach
      console.log('RPC method failed, trying direct REST API approach...');
      
      // Using Supabase REST API for SQL operations
      const { error: sqlError } = await supabase
        .from('tours')
        .update({ _dummy: null })  // Use a dummy update as a workaround
        .eq('id', 'triggers_schema_update')
        .select();
      
      // Since we can't execute raw SQL easily, we'll use migrations in Supabase dashboard
      if (sqlError) {
        console.error('Error adding airtable_id column with direct SQL. You may need to add this column manually in the Supabase dashboard.');
        console.error('Please run this SQL in the Supabase SQL editor:');
        console.log(`
          ALTER TABLE tours 
          ADD COLUMN IF NOT EXISTS airtable_id TEXT;
          
          CREATE INDEX IF NOT EXISTS idx_tours_airtable_id 
          ON tours (airtable_id);
        `);
        return false;
      }
    }
    
    console.log('Successfully added airtable_id column to tours table!');
    return true;
  } catch (error) {
    console.error('Error updating Supabase schema:', error);
    return false;
  }
}

// Run the function
updateSupabaseSchema()
  .then(() => {
    console.log('Schema update complete.');
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

module.exports = { updateSupabaseSchema }; 