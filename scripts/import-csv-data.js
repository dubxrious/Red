const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Supabase credentials
const supabaseUrl = 'https://rihqmooghbklkdchzzgm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaHFtb29naGJrbGtkY2h6emdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MzA0NTEsImV4cCI6MjA1ODQwNjQ1MX0.a_N1MbCkhVh-I9R-ZKjLNNdRfs7jJV7I_iNK58hd90w';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Process CSV data and import into Supabase
async function importCSVData() {
  try {
    console.log('Starting CSV data import...');
    const csvFilePath = path.join(__dirname, '..', 'dataset_viator.csv');
    
    // Fetch existing categories, destinations, and tags
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
    
    const { data: tagsData, error: tagsError } = await supabase.from('tags').select('id, name');
    if (tagsError) {
      console.error('Error fetching tags:', tagsError);
      return;
    }
    
    // Create maps for faster lookups
    const categoryMap = new Map(categoriesData.map(cat => [cat.name, cat.id]));
    const destinationMap = new Map(destinationsData.map(dest => [dest.name, dest.id]));
    const tagMap = new Map(tagsData.map(tag => [tag.name, tag.id]));
    
    // Process CSV file
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Read ${results.length} records from CSV`);
        
        // Process up to 25 tours to avoid overwhelming the database
        const processLimit = Math.min(results.length, 25);
        let successCount = 0;
        
        for (let i = 0; i < processLimit; i++) {
          const item = results[i];
          
          // Skip if missing critical data
          if (!item.title || !item.description || !item.category || !item.location) {
            console.log(`Skipping item ${i} due to missing critical data`);
            continue;
          }
          
          try {
            // Handle category
            const categoryName = item.category;
            let categoryId = categoryMap.get(categoryName);
            
            if (!categoryId) {
              console.log(`Creating new category: ${categoryName}`);
              const { data: newCategory, error: catInsertError } = await supabase
                .from('categories')
                .insert([{
                  name: categoryName,
                  slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                  description: `Tours related to ${categoryName}`,
                  image: item['image/src'] || 'https://via.placeholder.com/800x600'
                }])
                .select('id')
                .single();
                
              if (catInsertError) {
                console.error(`Error creating category ${categoryName}:`, catInsertError);
                continue;
              }
              
              categoryId = newCategory.id;
              categoryMap.set(categoryName, categoryId);
            }
            
            // Handle destination
            const location = item.location.split(',')[0];
            let destinationId = destinationMap.get(location);
            
            if (!destinationId) {
              console.log(`Creating new destination: ${location}`);
              const { data: newDestination, error: destInsertError } = await supabase
                .from('destinations')
                .insert([{
                  name: location,
                  slug: location.toLowerCase().replace(/\s+/g, '-'),
                  description: `Tours in the beautiful ${location} area`,
                  image: item['image/src'] || 'https://via.placeholder.com/800x600'
                }])
                .select('id')
                .single();
                
              if (destInsertError) {
                console.error(`Error creating destination ${location}:`, destInsertError);
                continue;
              }
              
              destinationId = newDestination.id;
              destinationMap.set(location, destinationId);
            }
            
            // Generate a unique slug
            const baseSlug = item.title.toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-');
            
            const slug = `${baseSlug}-${Date.now().toString().substring(8)}`;
            
            // Create tour
            const tour = {
              title: item.title,
              slug,
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
              featured: i < 5 // Make the first 5 tours featured
            };
            
            const { data: tourData, error: tourError } = await supabase
              .from('tours')
              .insert([tour])
              .select('id')
              .single();
              
            if (tourError) {
              console.error(`Error inserting tour ${tour.title}:`, tourError);
              continue;
            }
            
            const tourId = tourData.id;
            console.log(`Added tour (${i + 1}/${processLimit}): ${tour.title}`);
            successCount++;
            
            // Add tour features
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
            
            // Add tour tags based on title/description content
            const tagAssignments = [];
            const possibleTags = [
              { name: 'Beach', keywords: ['beach', 'island', 'seaside', 'coast', 'shore', 'bay'] },
              { name: 'Adventure', keywords: ['adventure', 'exciting', 'thrill', 'explore', 'action', 'dive'] },
              { name: 'Wildlife', keywords: ['wildlife', 'animals', 'marine', 'fish', 'dolphin', 'snorkel'] },
              { name: 'Cultural', keywords: ['cultural', 'history', 'heritage', 'ancient', 'museum', 'temple', 'pyramid'] },
              { name: 'Family-friendly', keywords: ['family', 'kids', 'children', 'beginner'] }
            ];
            
            const combinedText = `${tour.title} ${tour.description}`.toLowerCase();
            
            for (const tag of possibleTags) {
              if (tag.keywords.some(keyword => combinedText.includes(keyword))) {
                const tagId = tagMap.get(tag.name);
                if (tagId) {
                  tagAssignments.push({
                    tour_id: tourId,
                    tag_id: tagId
                  });
                }
              }
            }
            
            // Ensure at least one tag, add Adventure if none matched
            if (tagAssignments.length === 0) {
              const defaultTagId = tagMap.get('Adventure');
              if (defaultTagId) {
                tagAssignments.push({
                  tour_id: tourId,
                  tag_id: defaultTagId
                });
              }
            }
            
            // Insert tags
            if (tagAssignments.length > 0) {
              const { error: tagsInsertError } = await supabase.from('tour_tags').insert(tagAssignments);
              if (tagsInsertError) {
                console.error(`Error adding tags for tour ${tour.title}:`, tagsInsertError);
              }
            }
          } catch (itemError) {
            console.error(`Error processing item ${i}:`, itemError);
          }
        }
        
        console.log(`Successfully imported ${successCount} tours from CSV!`);
      });
  } catch (error) {
    console.error('Error importing CSV data:', error);
  }
}

// Start the import
importCSVData(); 