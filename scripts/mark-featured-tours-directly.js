// Script to mark some tours as featured directly in Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uapeongczwcjbfvhozyw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcGVvbmdjendjamJmdmhvenl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTY0NzI2NSwiZXhwIjoyMDU3MjIzMjY1fQ.45iZyKLi3nLTw9BAYQDxAha6aMAA-8wrMR06Cb5lAVs';

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function markFeaturedTours() {
  console.log('Marking featured tours directly in Supabase...');
  
  try {
    // Get tours with complete data to mark as featured
    const { data: allTours, error: fetchError } = await supabase
      .from('tours')
      .select('id, title, description, slug, rating_exact_score, review_count')
      .not('title', 'is', null)
      .not('description', 'is', null)
      .not('slug', 'is', null)
      .order('rating_exact_score', { ascending: false })
      .limit(50);
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${allTours.length} tours with complete data`);
    
    // Filter to ensure we only have valid tours with no null values
    const validTours = allTours.filter(tour => 
      tour.title && tour.description && tour.slug && 
      tour.id && typeof tour.id === 'string' && tour.id.length > 0
    );
    
    const toursToMark = validTours.slice(0, 10); // Take up to 10 tours
    console.log(`Selected ${toursToMark.length} tours to mark as featured`);
    
    if (toursToMark.length === 0) {
      console.log('No valid tours found to mark as featured');
      return;
    }
    
    // Prepare updates
    const updates = toursToMark.map((tour, index) => ({
      id: tour.id,
      featured: true,
      featured_order: (index + 1) * 10
    }));
    
    // Log before update
    console.log('About to update these tours:');
    updates.forEach(update => {
      const tour = toursToMark.find(t => t.id === update.id);
      console.log(`- ${update.id} (${tour.title}) - Order: ${update.featured_order}`);
    });
    
    // Update tours in batch
    const { error: updateError } = await supabase
      .from('tours')
      .upsert(updates);
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Successfully marked ${updates.length} tours as featured`);
    
    // Now verify the changes
    const { data: featuredTours, error: verifyError } = await supabase
      .from('tours')
      .select('id, title, featured, featured_order')
      .eq('featured', true)
      .order('featured_order', { ascending: true });
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`\nVerified featured tours (${featuredTours.length}):`);
    featuredTours.forEach(tour => {
      console.log(`- ${tour?.id}: ${tour?.title || 'No title'} (Order: ${tour?.featured_order || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('Error marking featured tours:', error);
  }
}

// Run the function if invoked directly
if (require.main === module) {
  markFeaturedTours()
    .then(() => {
      console.log('Script completed successfully.');
    })
    .catch(error => {
      console.error('Error running script:', error);
      process.exit(1);
    });
} 