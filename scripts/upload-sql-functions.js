const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://rihqmooghbklkdchzzgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadSQLFunctions() {
  try {
    console.log('Starting SQL functions upload...');

    // Read SQL functions from file
    const sqlFilePath = path.join(__dirname, 'sql', 'setup-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split by function and execute each one
    const functionSections = sqlContent.split('CREATE OR REPLACE FUNCTION');

    // Skip the first empty section
    for (let i = 1; i < functionSections.length; i++) {
      const section = 'CREATE OR REPLACE FUNCTION' + functionSections[i];
      const functionName = section.match(/CREATE OR REPLACE FUNCTION\s+(\w+)/)[1];
      
      console.log(`Uploading function: ${functionName}`);
      
      try {
        // Execute the SQL query using Supabase's rpc method
        const { data, error } = await supabase.rpc('run_sql', { sql: section });
        
        if (error) {
          console.error(`Error uploading function ${functionName}:`, error);
        } else {
          console.log(`Function ${functionName} uploaded successfully`);
        }
      } catch (execError) {
        console.error(`Error executing function ${functionName}:`, execError);
      }
    }

    console.log('SQL functions upload completed');
  } catch (error) {
    console.error('Error uploading SQL functions:', error);
  }
}

// Create run_sql function if it doesn't exist
async function createRunSQLFunction() {
  try {
    console.log('Creating run_sql function...');
    
    const runSqlFunction = `
    CREATE OR REPLACE FUNCTION run_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Use a direct SQL query to create the function
    const { data, error } = await supabase.from('_sql').select('*').execute(runSqlFunction);
    
    if (error) {
      console.error('Error creating run_sql function:', error);
    } else {
      console.log('run_sql function created successfully');
    }
  } catch (error) {
    console.error('Error creating run_sql function:', error);
  }
}

// Run the upload
async function main() {
  await createRunSQLFunction();
  await uploadSQLFunctions();
}

main(); 