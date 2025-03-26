const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Supabase credentials
const supabaseUrl = 'https://rihqmooghbklkdchzzgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  try {
    console.log('Starting database direct setup...');

    // Create tables directly
    console.log('Creating tables...');

    // Users table
    const { error: usersError } = await supabase.from('users').insert([
      { 
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin'
      }
    ]);
    if (usersError) {
      console.log('Users table possibly exists already or there was an error:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    // Categories table
    const categories = [
      { name: 'Sailing', slug: 'sailing', description: 'Explore the waters with our sailing tours', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg' },
      { name: 'Diving', slug: 'diving', description: 'Discover underwater beauty with our diving experiences', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0c/03/68/e7.jpg' },
      { name: 'Snorkeling', slug: 'snorkeling', description: 'Experience the marine life with our snorkeling trips', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/09/a9/0f/45.jpg' },
      { name: 'Day Trips', slug: 'day-trips', description: 'Enjoy a full day of adventure with our day trips', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg' },
      { name: 'Multi-day Tours', slug: 'multi-day-tours', description: 'Embark on a journey lasting multiple days', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg' },
    ];
    
    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categories);
    
    if (categoriesError) {
      console.log('Categories table possibly exists already or there was an error:', categoriesError);
    } else {
      console.log('Categories table created successfully');
    }

    // Destinations table
    const destinations = [
      { name: 'Hurghada', slug: 'hurghada', description: 'A beautiful beach resort town along Egypt\'s Red Sea coast', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/12/57/e0/f6.jpg' },
      { name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh', description: 'An Egyptian resort town between the desert of the Sinai Peninsula and the Red Sea', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/13/47/8b/4d.jpg' },
      { name: 'Aswan', slug: 'aswan', description: 'A city in the south of Egypt, located on the east bank of the Nile', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/0b/9b/c9/c9.jpg' },
      { name: 'Luxor', slug: 'luxor', description: 'A city on the east bank of the Nile River in southern Egypt', image: 'https://media.tacdn.com/media/attractions-splice-spp-360x240/08/52/4b/37.jpg' },
    ];
    
    const { error: destinationsError } = await supabase
      .from('destinations')
      .insert(destinations);
    
    if (destinationsError) {
      console.log('Destinations table possibly exists already or there was an error:', destinationsError);
    } else {
      console.log('Destinations table created successfully');
    }

    // Tags table
    const tags = [
      { name: 'Beach', slug: 'beach', description: 'Tours that involve beach activities' },
      { name: 'Adventure', slug: 'adventure', description: 'Tours focused on thrilling experiences' },
      { name: 'Wildlife', slug: 'wildlife', description: 'Tours showcasing local wildlife' },
      { name: 'Cultural', slug: 'cultural', description: 'Tours highlighting local culture and heritage' },
      { name: 'Family-friendly', slug: 'family-friendly', description: 'Tours suitable for all family members' },
    ];
    
    const { error: tagsError } = await supabase
      .from('tags')
      .insert(tags);
    
    if (tagsError) {
      console.log('Tags table possibly exists already or there was an error:', tagsError);
    } else {
      console.log('Tags table created successfully');
    }

    // Process and add tour data from CSV
    await processCSVData();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function processCSVData() {
  try {
    console.log('Processing CSV data...');
    const csvFilePath = path.join(__dirname, '..', 'dataset_viator.csv');
    
    // Get existing categories and destinations
    const { data: categoriesData, error: catError } = await supabase.from('categories').select('id, name');
    if (catError) {
      console.error('Error fetching categories:', catError);
      return;
    }
    
    const { data: destinationsData, error: destError } = await supabase.from('destinations').select('id, name');
    if (destError) {
      console.error('Error fetching destinations:', destError);
      return;
    }
    
    // Create lookup maps for faster access
    const categoryMap = new Map();
    categoriesData.forEach(cat => categoryMap.set(cat.name, cat.id));
    
    const destinationMap = new Map();
    destinationsData.forEach(dest => destinationMap.set(dest.name, dest.id));
    
    // Read and process CSV file
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Processed ${results.length} records from CSV`);
        
        // Process the first 10 tours (to avoid overwhelming the database)
        const processLimit = Math.min(results.length, 10);
        
        for (let i = 0; i < processLimit; i++) {
          const item = results[i];
          
          // Check if category exists, create if not
          const categoryName = item.category;
          let categoryId = categoryMap.get(categoryName);
          
          if (!categoryId) {
            const { data: newCategory, error: catError } = await supabase
              .from('categories')
              .insert([{
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                description: `Tours related to ${categoryName}`,
                image: item['image/src'] || 'https://via.placeholder.com/800x600'
              }])
              .select('id')
              .single();
            
            if (catError) {
              console.error(`Error creating category ${categoryName}:`, catError);
              continue;
            }
            
            categoryId = newCategory.id;
            categoryMap.set(categoryName, categoryId);
          }
          
          // Check if destination exists, create if not
          const location = item.location.split(',')[0];
          let destinationId = destinationMap.get(location);
          
          if (!destinationId) {
            const { data: newDestination, error: destError } = await supabase
              .from('destinations')
              .insert([{
                name: location,
                slug: location.toLowerCase().replace(/\s+/g, '-'),
                description: `Tours in the beautiful ${location} area`,
                image: item['image/src'] || 'https://via.placeholder.com/800x600'
              }])
              .select('id')
              .single();
            
            if (destError) {
              console.error(`Error creating destination ${location}:`, destError);
              continue;
            }
            
            destinationId = newDestination.id;
            destinationMap.set(location, destinationId);
          }
          
          // Create tour
          const tour = {
            title: item.title,
            slug: item.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
            description: item.description,
            category_id: categoryId,
            destination_id: destinationId,
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
            .insert([tour])
            .select('id');
            
          if (tourError) {
            console.error(`Error inserting tour ${tour.title}:`, tourError);
          } else {
            console.log(`Added tour: ${tour.title}`);
            
            // Add tour features
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
            
            const { error: featuresError } = await supabase.from('tour_features').insert(features);
            if (featuresError) {
              console.error(`Error adding features for tour ${tour.title}:`, featuresError);
            }
            
            // Add tour tags
            const { data: tagsData, error: tagsQueryError } = await supabase.from('tags').select('id, name');
            if (tagsQueryError) {
              console.error('Error fetching tags:', tagsQueryError);
              continue;
            }
            
            // Randomly assign 1-2 tags
            const randomTagCount = Math.floor(Math.random() * 2) + 1;
            const tagIds = tagsData.map(tag => tag.id);
            
            for (let j = 0; j < randomTagCount && j < tagIds.length; j++) {
              const randomTagId = tagIds[Math.floor(Math.random() * tagIds.length)];
              
              const { error: tagLinkError } = await supabase.from('tour_tags').insert([{
                tour_id: tourId,
                tag_id: randomTagId
              }]);
              
              if (tagLinkError) {
                console.error(`Error linking tag to tour ${tour.title}:`, tagLinkError);
              }
            }
          }
        }
        
        console.log('Tour data processing completed');
      });
  } catch (error) {
    console.error('Error processing CSV data:', error);
  }
}

setupTables(); 