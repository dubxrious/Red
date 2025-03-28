// Script to insert multiple featured tours
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uapeongczwcjbfvhozyw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhcGVvbmdjendjamJmdmhvenl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTY0NzI2NSwiZXhwIjoyMDU3MjIzMjY1fQ.45iZyKLi3nLTw9BAYQDxAha6aMAA-8wrMR06Cb5lAVs';

// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function insertFeaturedTours() {
  console.log('Inserting featured tours...');
  
  try {
    // First get categories and destinations
    const { data: categories } = await supabase.from('categories').select('id, name');
    const { data: destinations } = await supabase.from('destinations').select('id, name');
    
    if (!categories || categories.length === 0 || !destinations || destinations.length === 0) {
      console.error('No categories or destinations found');
      return;
    }
    
    // Find appropriate categories and destinations
    const divingCategory = categories.find(c => c.name.toLowerCase().includes('day')) || categories[0];
    const cruiseCategory = categories.find(c => c.name.toLowerCase().includes('cruise')) || categories[0];
    const multiDayCategory = categories.find(c => c.name.toLowerCase().includes('multi')) || categories[0];
    
    const hurghada = destinations.find(d => d.name.toLowerCase().includes('hurgh')) || destinations[0];
    const sharm = destinations.find(d => d.name.toLowerCase().includes('sharm')) || destinations[0];
    const other = destinations.find(d => d.name.toLowerCase().includes('other')) || destinations[0];
    
    // Sample featured tours
    const featuredTours = [
      {
        title: "Premium Sunset Yacht Cruise with Dinner",
        slug: "premium-sunset-yacht-cruise-with-dinner",
        description: "Enjoy a luxurious sunset cruise on a private yacht with a gourmet dinner. Perfect for couples and special occasions.",
        status: "active",
        retail_price: 199.99,
        discounted_price: 179.99,
        category_id: cruiseCategory.id,
        destination_id: hurghada.id,
        duration_days: 0,
        duration_hours: 3,
        duration_minutes: 0,
        rating_exact_score: 4.8,
        review_count: 36,
        image_0_src: "https://images.unsplash.com/photo-1565440707934-c9bacbad2146?q=80&w=2069&auto=format&fit=crop",
        featured: true,
        featured_order: 2
      },
      {
        title: "Dolphin Watching and Snorkeling Adventure",
        slug: "dolphin-watching-and-snorkeling-adventure",
        description: "Swim with dolphins in their natural habitat and explore colorful coral reefs on this unforgettable adventure.",
        status: "active",
        retail_price: 89.99,
        discounted_price: 79.99,
        category_id: divingCategory.id,
        destination_id: sharm.id,
        duration_days: 0,
        duration_hours: 5,
        duration_minutes: 0,
        rating_exact_score: 4.7,
        review_count: 52,
        image_0_src: "https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?q=80&w=2069&auto=format&fit=crop",
        featured: true,
        featured_order: 3
      },
      {
        title: "3-Day Red Sea Island Hopping Expedition",
        slug: "3-day-red-sea-island-hopping-expedition",
        description: "Explore multiple pristine islands on this 3-day expedition, with accommodation on a luxury catamaran.",
        status: "active",
        retail_price: 499.99,
        discounted_price: 449.99,
        category_id: multiDayCategory.id,
        destination_id: other.id,
        duration_days: 3,
        duration_hours: 0,
        duration_minutes: 0,
        rating_exact_score: 4.9,
        review_count: 28,
        image_0_src: "https://images.unsplash.com/photo-1682686580224-cd32b6005d31?q=80&w=2070&auto=format&fit=crop",
        featured: true,
        featured_order: 4
      }
    ];
    
    // Insert the tours
    const { data, error } = await supabase.from('tours').insert(featuredTours).select();
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully inserted ${data.length} featured tours:`);
    data.forEach(tour => {
      console.log(`- ${tour.title} (Order: ${tour.featured_order})`);
    });
    
    // Now verify all featured tours
    const { data: allFeaturedTours, error: verifyError } = await supabase
      .from('tours')
      .select('id, title, featured, featured_order')
      .eq('featured', true)
      .order('featured_order', { ascending: true });
    
    if (verifyError) {
      throw verifyError;
    }
    
    console.log(`\nVerified all featured tours (${allFeaturedTours.length}):`);
    allFeaturedTours.forEach(tour => {
      console.log(`- ${tour.title} (Order: ${tour.featured_order})`);
    });
    
  } catch (error) {
    console.error('Error inserting featured tours:', error);
  }
}

// Run the function if invoked directly
if (require.main === module) {
  insertFeaturedTours()
    .then(() => {
      console.log('Script completed successfully.');
    })
    .catch(error => {
      console.error('Error running script:', error);
      process.exit(1);
    });
} 