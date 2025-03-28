// Script to insert a sample featured tour
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uapeongczwcjbfvhozyw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcGVvbmdjendjamJmdmhvenl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTY0NzI2NSwiZXhwIjoyMDU3MjIzMjY1fQ.45iZyKLi3nLTw9BAYQDxAha6aMAA-8wrMR06Cb5lAVs';

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function insertSampleTour() {
  console.log('Inserting sample featured tour...');
  
  try {
    // First get categories and destinations
    const { data: categories } = await supabase.from('categories').select('id').limit(1);
    const { data: destinations } = await supabase.from('destinations').select('id').limit(1);
    
    if (!categories || categories.length === 0 || !destinations || destinations.length === 0) {
      console.error('No categories or destinations found');
      return;
    }
    
    const categoryId = categories[0].id;
    const destinationId = destinations[0].id;
    
    // Create sample tour
    const sampleTour = {
      title: "Featured Red Sea Diving Experience",
      slug: "featured-red-sea-diving-experience",
      description: "Experience the vibrant marine life of the Red Sea with our expert guides. This premium diving tour is perfect for all skill levels.",
      status: "active",
      retail_price: 149.99,
      discounted_price: 129.99,
      category_id: categoryId,
      destination_id: destinationId,
      duration_days: 0,
      duration_hours: 6,
      duration_minutes: 0,
      rating_exact_score: 4.9,
      review_count: 48,
      image_0_src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop",
      featured: true,
      featured_order: 1
    };
    
    // Insert the sample tour
    const { data, error } = await supabase.from('tours').insert([sampleTour]).select();
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully inserted sample tour:');
    console.log(data[0]);
    
    // Now verify featured tours
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
      console.log(`- ${tour.id}: ${tour.title} (Order: ${tour.featured_order})`);
    });
    
  } catch (error) {
    console.error('Error inserting sample tour:', error);
  }
}

// Run the function if invoked directly
if (require.main === module) {
  insertSampleTour()
    .then(() => {
      console.log('Script completed successfully.');
    })
    .catch(error => {
      console.error('Error running script:', error);
      process.exit(1);
    });
} 