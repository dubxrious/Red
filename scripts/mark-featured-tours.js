// Script to mark featured tours
const { markFeaturedTours } = require('./airtable-to-supabase');

// Run the function if invoked directly
if (require.main === module) {
  console.log('Running script to mark featured tours...');
  markFeaturedTours()
    .then(() => {
      console.log('Script completed.');
    })
    .catch(error => {
      console.error('Error running script:', error);
      process.exit(1);
    });
} 