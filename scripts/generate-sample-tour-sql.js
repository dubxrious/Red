const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to generate SQL inserts from CSV data
async function generateSampleTourSQL() {
  try {
    console.log('Starting SQL generation from CSV data...');
    const csvFilePath = path.join(__dirname, '..', 'dataset_viator.csv');
    const outputFilePath = path.join(__dirname, 'sql', 'sample-tour-data.sql');
    
    // Create categories and destinations maps
    const categories = new Map();
    const destinations = new Map();
    
    // Define existing categories and destinations from our setup
    const existingCategories = [
      { name: 'Sailing', slug: 'sailing' },
      { name: 'Diving', slug: 'diving' },
      { name: 'Snorkeling', slug: 'snorkeling' },
      { name: 'Day Trips', slug: 'day-trips' },
      { name: 'Multi-day Tours', slug: 'multi-day-tours' }
    ];
    
    const existingDestinations = [
      { name: 'Hurghada', slug: 'hurghada' },
      { name: 'Sharm El Sheikh', slug: 'sharm-el-sheikh' },
      { name: 'Aswan', slug: 'aswan' },
      { name: 'Luxor', slug: 'luxor' }
    ];
    
    existingCategories.forEach(cat => categories.set(cat.name, cat.slug));
    existingDestinations.forEach(dest => destinations.set(dest.name, dest.slug));
    
    // Store tags
    const existingTags = ['Beach', 'Adventure', 'Wildlife', 'Cultural', 'Family-friendly'];
    
    // Process CSV file
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Read ${results.length} records from CSV`);
        
        // Process up to 20 tours for the SQL file
        const processLimit = Math.min(results.length, 20);
        
        // Start SQL output
        let sqlOutput = '-- Sample tour data generated from CSV\n\n';
        
        // Track new categories and destinations for insertion
        const newCategories = new Map();
        const newDestinations = new Map();
        
        // Process each tour
        for (let i = 0; i < processLimit; i++) {
          const item = results[i];
          
          // Skip if missing critical data
          if (!item.title || !item.description || !item.category || !item.location) {
            console.log(`Skipping item ${i} due to missing critical data`);
            continue;
          }
          
          // Handle category
          const categoryName = item.category;
          let categorySlug = categories.get(categoryName);
          
          if (!categorySlug) {
            categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
            categories.set(categoryName, categorySlug);
            
            if (!newCategories.has(categoryName)) {
              newCategories.set(categoryName, {
                name: categoryName,
                slug: categorySlug,
                description: `Tours related to ${categoryName}`,
                image: item['image/src'] || 'https://via.placeholder.com/800x600'
              });
            }
          }
          
          // Handle destination
          const locationName = item.location.split(',')[0].trim();
          let destinationSlug = destinations.get(locationName);
          
          if (!destinationSlug) {
            destinationSlug = locationName.toLowerCase().replace(/\s+/g, '-');
            destinations.set(locationName, destinationSlug);
            
            if (!newDestinations.has(locationName)) {
              newDestinations.set(locationName, {
                name: locationName,
                slug: destinationSlug,
                description: `Tours in the beautiful ${locationName} area`,
                image: item['image/src'] || 'https://via.placeholder.com/800x600'
              });
            }
          }
          
          // Generate a unique slug
          const baseSlug = item.title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          
          const slug = `${baseSlug}-${i}`;
          
          // Generate tour SQL
          sqlOutput += `-- Tour ${i + 1}: ${item.title}\n`;
          
          // Make sure we escape single quotes in the description and title
          const escapedTitle = item.title.replace(/'/g, "''");
          const escapedDescription = item.description.replace(/'/g, "''");
          
          // Create tour insert
          sqlOutput += `INSERT INTO tours (
  title, 
  slug, 
  description, 
  category_id, 
  destination_id, 
  duration_days, 
  duration_hours, 
  duration_minutes, 
  retail_price, 
  discounted_price,
  rating_exact_score,
  review_count,
  image_0_src,
  status,
  pickup_available,
  featured
)
VALUES (
  '${escapedTitle}', 
  '${slug}', 
  '${escapedDescription}', 
  (SELECT id FROM categories WHERE slug = '${categorySlug}'), 
  (SELECT id FROM destinations WHERE slug = '${destinationSlug}'), 
  ${parseInt(item['displayDuration/duration/days']) || 'NULL'}, 
  ${parseInt(item['displayDuration/duration/hours']) || 'NULL'}, 
  ${parseInt(item['displayDuration/duration/minutes']) || 'NULL'}, 
  ${parseFloat(item['price/retailPrice/amount']) || 0}, 
  ${item['price/isDiscounted'] === 'true' ? parseFloat(item['price/discountedPrice/amount']) || 'NULL' : 'NULL'},
  ${parseFloat(item['rating/exactScore']) || 4.5},
  ${parseInt(item['rating/reviewCount']) || 0},
  '${item['images/0/src'] || item['image/src'] || 'https://via.placeholder.com/800x600'}',
  'active',
  ${item['behaviours/hasFreeCancellation'] === 'true' ? 'true' : 'false'},
  ${i < 5 ? 'true' : 'false'}
);\n\n`;
          
          // Add tour features
          sqlOutput += `-- Features for tour ${i + 1}\n`;
          sqlOutput += `INSERT INTO tour_features (
  tour_id,
  icon,
  label,
  description
)
VALUES 
-- Duration feature
(
  (SELECT id FROM tours WHERE slug = '${slug}'),
  'clock',
  'Duration',
  '${item['displayDuration/duration/days'] ? parseInt(item['displayDuration/duration/days']) + ' days ' : ''}${item['displayDuration/duration/hours'] ? parseInt(item['displayDuration/duration/hours']) + ' hours ' : ''}${item['displayDuration/duration/minutes'] ? parseInt(item['displayDuration/duration/minutes']) + ' minutes' : ''}'
),
-- Price feature
(
  (SELECT id FROM tours WHERE slug = '${slug}'),
  'tag',
  'Price',
  '$${item['price/isDiscounted'] === 'true' ? parseFloat(item['price/discountedPrice/amount']) || parseFloat(item['price/retailPrice/amount']) || 0 : parseFloat(item['price/retailPrice/amount']) || 0}'
)`;
          
          // Add cancellation feature if applicable
          if (item['behaviours/hasFreeCancellation'] === 'true') {
            sqlOutput += `,
-- Cancellation feature
(
  (SELECT id FROM tours WHERE slug = '${slug}'),
  'rotate-ccw',
  'Free Cancellation',
  'Cancel anytime for a full refund'
)`;
          }
          
          sqlOutput += `;\n\n`;
          
          // Add tour tags based on content
          sqlOutput += `-- Tags for tour ${i + 1}\n`;
          sqlOutput += `INSERT INTO tour_tags (
  tour_id,
  tag_id
)
VALUES\n`;
          
          // Determine which tags to assign
          const possibleTags = [
            { name: 'Beach', keywords: ['beach', 'island', 'seaside', 'coast', 'shore', 'bay'] },
            { name: 'Adventure', keywords: ['adventure', 'exciting', 'thrill', 'explore', 'action', 'dive'] },
            { name: 'Wildlife', keywords: ['wildlife', 'animals', 'marine', 'fish', 'dolphin', 'snorkel'] },
            { name: 'Cultural', keywords: ['cultural', 'history', 'heritage', 'ancient', 'museum', 'temple', 'pyramid'] },
            { name: 'Family-friendly', keywords: ['family', 'kids', 'children', 'beginner'] }
          ];
          
          const combinedText = `${item.title} ${item.description}`.toLowerCase();
          const matchedTags = [];
          
          for (const tag of possibleTags) {
            if (tag.keywords.some(keyword => combinedText.includes(keyword))) {
              matchedTags.push(tag.name);
            }
          }
          
          // Ensure at least one tag
          if (matchedTags.length === 0) {
            matchedTags.push('Adventure');
          }
          
          // Generate tag SQL
          matchedTags.forEach((tagName, idx) => {
            sqlOutput += `(
  (SELECT id FROM tours WHERE slug = '${slug}'),
  (SELECT id FROM tags WHERE name = '${tagName}')
)${idx < matchedTags.length - 1 ? ',' : ';'}\n`;
          });
          
          sqlOutput += '\n\n';
        }
        
        // Insert new categories and destinations if any
        let additionalSQL = '';
        
        if (newCategories.size > 0) {
          additionalSQL += '-- Additional categories\n';
          newCategories.forEach(cat => {
            additionalSQL += `INSERT INTO categories (name, slug, description, image) 
VALUES ('${cat.name.replace(/'/g, "''")}', '${cat.slug}', '${cat.description.replace(/'/g, "''")}', '${cat.image}');\n`;
          });
          additionalSQL += '\n';
        }
        
        if (newDestinations.size > 0) {
          additionalSQL += '-- Additional destinations\n';
          newDestinations.forEach(dest => {
            additionalSQL += `INSERT INTO destinations (name, slug, description, image) 
VALUES ('${dest.name.replace(/'/g, "''")}', '${dest.slug}', '${dest.description.replace(/'/g, "''")}', '${dest.image}');\n`;
          });
          additionalSQL += '\n';
        }
        
        // Prepend additional entities to the SQL output
        sqlOutput = additionalSQL + sqlOutput;
        
        // Write SQL to file
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        fs.writeFileSync(outputFilePath, sqlOutput);
        
        console.log(`Successfully generated SQL for ${processLimit} tours at ${outputFilePath}`);
      });
  } catch (error) {
    console.error('Error generating SQL:', error);
  }
}

// Start the SQL generation
generateSampleTourSQL(); 