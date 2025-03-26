const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Supabase credentials - replace with env vars in production
const supabaseUrl = 'https://rihqmooghbklkdchzzgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Starting database setup...');

    // Drop existing tables if they exist (in reverse order of dependencies)
    console.log('Dropping existing tables...');
    
    try {
      await supabase.rpc('drop_all_tables');
      console.log('Tables dropped successfully');
    } catch (dropError) {
      console.error('Error dropping tables:', dropError);
    }
    
    // Create tables
    console.log('Creating tables...');

    try {
      // Users table
      await supabase.rpc('create_users_table');
      console.log('Users table created');
      
      // Categories table
      await supabase.rpc('create_categories_table');
      console.log('Categories table created');
      
      // Destinations table
      await supabase.rpc('create_destinations_table');
      console.log('Destinations table created');
      
      // Vendors table
      await supabase.rpc('create_vendors_table');
      console.log('Vendors table created');
      
      // Tours table
      await supabase.rpc('create_tours_table');
      console.log('Tours table created');
      
      // Tags table
      await supabase.rpc('create_tags_table');
      console.log('Tags table created');
      
      // Tour_tags table
      await supabase.rpc('create_tour_tags_table');
      console.log('Tour tags table created');
      
      // Tour_features table
      await supabase.rpc('create_tour_features_table');
      console.log('Tour features table created');
      
      // Tour_availability table
      await supabase.rpc('create_tour_availability_table');
      console.log('Tour availability table created');
      
      // Bookings table
      await supabase.rpc('create_bookings_table');
      console.log('Bookings table created');
      
      // Reviews table
      await supabase.rpc('create_reviews_table');
      console.log('Reviews table created');
      
      // Create get_vendor_stats function
      await supabase.rpc('create_get_vendor_stats_function');
      console.log('Vendor stats function created');
    } catch (createError) {
      console.error('Error creating tables:', createError);
    }
    
    // Add initial data
    await addInitialData();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function addInitialData() {
  try {
    console.log('Adding initial data...');
    
    // Add default admin user
    const adminUser = {
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'admin',
    };
    
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .insert([adminUser]);
      
    if (adminError) throw adminError;
    console.log('Admin user created');
    
    // Add categories
    const categories = [
      { name: 'Sailing', slug: 'sailing', description: 'Explore the waters with our sailing tours', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg' },
      { name: 'Diving', slug: 'diving', description: 'Discover underwater beauty with our diving experiences', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0c/03/68/e7.jpg' },
      { name: 'Snorkeling', slug: 'snorkeling', description: 'Experience the marine life with our snorkeling trips', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/09/a9/0f/45.jpg' },
      { name: 'Day Trips', slug: 'day-trips', description: 'Enjoy a full day of adventure with our day trips', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg' },
      { name: 'Multi-day Tours', slug: 'multi-day-tours', description: 'Embark on a journey lasting multiple days', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg' },
    ];
    
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories);
      
    if (categoriesError) throw categoriesError;
    console.log('Categories created');
    
    // Add destinations
    const destinations = [
      { name: 'Hurghada', slug: 'hurghada', description: 'A beautiful beach resort town along Egypt\'s Red Sea coast', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg' },
      { name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh', description: 'An Egyptian resort town between the desert of the Sinai Peninsula and the Red Sea', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg' },
      { name: 'Aswan', slug: 'aswan', description: 'A city in the south of Egypt, located on the east bank of the Nile', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg' },
      { name: 'Luxor', slug: 'luxor', description: 'A city on the east bank of the Nile River in southern Egypt', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/08/52/4b/37.jpg' },
    ];
    
    const { data: destinationsData, error: destinationsError } = await supabase
      .from('destinations')
      .insert(destinations);
      
    if (destinationsError) throw destinationsError;
    console.log('Destinations created');
    
    // Add tags
    const tags = [
      { name: 'Beach', slug: 'beach', description: 'Tours that involve beach activities' },
      { name: 'Adventure', slug: 'adventure', description: 'Tours focused on thrilling experiences' },
      { name: 'Wildlife', slug: 'wildlife', description: 'Tours showcasing local wildlife' },
      { name: 'Cultural', slug: 'cultural', description: 'Tours highlighting local culture and heritage' },
      { name: 'Family-friendly', slug: 'family-friendly', description: 'Tours suitable for all family members' },
    ];
    
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .insert(tags);
      
    if (tagsError) throw tagsError;
    console.log('Tags created');
    
    // Process and add tour data from CSV
    await processCSVData();
  } catch (error) {
    console.error('Error adding initial data:', error.message);
  }
}

async function processCSVData() {
  try {
    console.log('Processing CSV data...');
    const csvFilePath = path.join(__dirname, '..', 'dataset_viator.csv');
    
    const tours = [];
    const existingCategories = new Set();
    const existingDestinations = new Set();
    
    // Get existing categories and destinations
    const { data: categoriesData } = await supabase.from('categories').select('name');
    categoriesData.forEach(cat => existingCategories.add(cat.name));
    
    const { data: destinationsData } = await supabase.from('destinations').select('name');
    destinationsData.forEach(dest => existingDestinations.add(dest.name));
    
    // Read and process CSV file
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Processed ${results.length} records from CSV`);
        
        // Process the first 30 tours (to avoid overwhelming the database)
        const processLimit = Math.min(results.length, 30);
        
        for (let i = 0; i < processLimit; i++) {
          const item = results[i];
          
          // Check if category exists, create if not
          if (!existingCategories.has(item.category)) {
            const { data, error } = await supabase.from('categories').insert([{
              name: item.category,
              slug: item.category.toLowerCase().replace(/\s+/g, '-'),
              description: `Tours related to ${item.category}`,
              image: item['image/src'] || 'https://via.placeholder.com/800x600'
            }]);
            
            if (!error) existingCategories.add(item.category);
          }
          
          // Check if destination exists, create if not
          const location = item.location.split(',')[0];
          if (!existingDestinations.has(location)) {
            const { data, error } = await supabase.from('destinations').insert([{
              name: location,
              slug: location.toLowerCase().replace(/\s+/g, '-'),
              description: `Tours in the beautiful ${location} area`,
              image: item['image/src'] || 'https://via.placeholder.com/800x600'
            }]);
            
            if (!error) existingDestinations.add(location);
          }
          
          // Get category and destination IDs
          const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', item.category)
            .single();
          
          const { data: destinationData } = await supabase
            .from('destinations')
            .select('id')
            .eq('name', location)
            .single();
          
          if (categoryData && destinationData) {
            // Create tour
            const tour = {
              title: item.title,
              slug: item.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
              description: item.description,
              category_id: categoryData.id,
              destination_id: destinationData.id,
              duration_days: parseInt(item['displayDuration/duration/days']) || null,
              duration_hours: parseInt(item['displayDuration/duration/hours']) || null,
              duration_minutes: parseInt(item['displayDuration/duration/minutes']) || null,
              retail_price: parseFloat(item['price/retailPrice/amount']) || 0,
              discounted_price: item['price/isDiscounted'] === 'true' ? parseFloat(item['price/discountedPrice/amount']) : null,
              rating_exact_score: parseFloat(item['rating/exactScore']) || 4.5,
              review_count: parseInt(item['rating/reviewCount']) || 0,
              image_0_src: item['images/0/src'] || item['image/src'] || 'https://via.placeholder.com/800x600',
              image_1_src: item['images/1/src'] || null,
              image_2_src: item['images/2/src'] || null,
              image_3_src: item['images/3/src'] || null,
              image_4_src: item['images/4/src'] || null,
              status: 'active',
              pickup_available: item['behaviours/hasFreeCancellation'] === 'true',
            };
            
            const { data: tourData, error: tourError } = await supabase
              .from('tours')
              .insert([tour]);
              
            if (tourError) {
              console.error(`Error inserting tour ${tour.title}:`, tourError.message);
            } else {
              console.log(`Added tour: ${tour.title}`);
              
              // Add tour features
              if (tourData) {
                const tourId = tourData[0].id;
                
                // Add some sample features
                const features = [
                  {
                    tour_id: tourId,
                    icon: 'clock',
                    label: 'Duration',
                    description: `${tour.duration_days ? tour.duration_days + ' days ' : ''}${tour.duration_hours ? tour.duration_hours + ' hours ' : ''}${tour.duration_minutes ? tour.duration_minutes + ' minutes' : ''}`
                  },
                  {
                    tour_id: tourId,
                    icon: 'tag',
                    label: 'Price',
                    description: `$${tour.discounted_price || tour.retail_price}`
                  }
                ];
                
                if (item['behaviours/hasFreeCancellation'] === 'true') {
                  features.push({
                    tour_id: tourId,
                    icon: 'rotate-ccw',
                    label: 'Free Cancellation',
                    description: 'Cancel anytime for a full refund'
                  });
                }
                
                await supabase.from('tour_features').insert(features);
                
                // Add tour tags
                const tagTypes = ['Adventure', 'Beach', 'Wildlife'];
                // Randomly assign 1-2 tags
                const randomTagCount = Math.floor(Math.random() * 2) + 1;
                
                for (let j = 0; j < randomTagCount; j++) {
                  const randomTag = tagTypes[Math.floor(Math.random() * tagTypes.length)];
                  
                  const { data: tagData } = await supabase
                    .from('tags')
                    .select('id')
                    .eq('name', randomTag)
                    .single();
                  
                  if (tagData) {
                    await supabase.from('tour_tags').insert([{
                      tour_id: tourId,
                      tag_id: tagData.id
                    }]);
                  }
                }
              }
            }
          }
        }
        
        console.log('Tour data processing completed');
      });
  } catch (error) {
    console.error('Error processing CSV data:', error.message);
  }
}

setupDatabase(); 