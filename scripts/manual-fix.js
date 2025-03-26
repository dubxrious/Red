const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Find and replace specific problematic lines
const replacements = [
  [
    "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You'll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.',",
    "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.',"
  ],
  [
    "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You'll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board, but national park admission fees are at your own expense.',",
    "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board, but national park admission fees are at your own expense.',"
  ],
  [
    "  'Sail down one of the world's most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you'll disembark for guided visits to the region's most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple.',",
    "  'Sail down one of the world''s most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you''ll disembark for guided visits to the region''s most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple.',"
  ],
  [
    "  'Sail down one of the world's most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you'll disembark for guided visits to the region's most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple. Tasty onboard meals are included, plus a personalized pickup from the airport, train station, or your Aswan hotel.',",
    "  'Sail down one of the world''s most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you''ll disembark for guided visits to the region''s most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple. Tasty onboard meals are included, plus a personalized pickup from the airport, train station, or your Aswan hotel.',"
  ],
  [
    "  'Snorkel the spectacular coral reefs of Giftun Island, including Orange Bay, on this door-to-door day trip to the Giftun Island National Park. Spend your day swimming and snorkeling in the tropical waters, keeping an eye out for dolphins along the way, and have time to sunbathe and relax on the beach. Your day includes a delicious buffet lunch on board the boat, guide assistance, a breakfast sandwich, and free-flow soft drinks and water.',",
    "  'Snorkel the spectacular coral reefs of Giftun Island, including Orange Bay, on this door-to-door day trip to the Giftun Island National Park. Spend your day swimming and snorkeling in the tropical waters, keeping an eye out for dolphins along the way, and have time to sunbathe and relax on the beach. Your day includes a delicious buffet lunch on board the boat, guide assistance, a breakfast sandwich, and free-flow soft drinks and water.',"
  ],
  [
    "  'While in Hurghada, make the most of your proximity to one of the world's top snorkeling and diving sites. Head out onto the Red Sea and cruise to Dolphin House where you can explore the underwater world by snorkel. As you continue, there will be more opportunities to jump off board and snorkel and explore. Includes lunch served on board.',",
    "  'While in Hurghada, make the most of your proximity to one of the world''s top snorkeling and diving sites. Head out onto the Red Sea and cruise to Dolphin House where you can explore the underwater world by snorkel. As you continue, there will be more opportunities to jump off board and snorkel and explore. Includes lunch served on board.',"
  ],
  [
    "  'Ras Mohammed National Park offers some of the Red Sea's most vibrant coral reef. Experience it on this Sharm el Sheikh snorkeling cruise featuring professional guides to help with your gear and point out marine life. As well as lunch on board, enjoy time at the beautiful White Island sandbar. Please note that your package excludes park entrance fees, while snorkeling equipment is available as an upgrade.',",
    "  'Ras Mohammed National Park offers some of the Red Sea''s most vibrant coral reef. Experience it on this Sharm el Sheikh snorkeling cruise featuring professional guides to help with your gear and point out marine life. As well as lunch on board, enjoy time at the beautiful White Island sandbar. Please note that your package excludes park entrance fees, while snorkeling equipment is available as an upgrade.',"
  ],
  [
    "  'The Red Sea coastline around Hurghada is home to an impressive haul of dive spots, but knowing where to dive or how to do it isn't easy without local knowledge. Find the safest and scenic sites on a dive tour that's led by a local PADI guide and tailored to suit beginners. Two dives are included, along with an onboard buffet lunch and time to snorkel, swim, or even ride a banana boat.',",
    "  'The Red Sea coastline around Hurghada is home to an impressive haul of dive spots, but knowing where to dive or how to do it isn''t easy without local knowledge. Find the safest and scenic sites on a dive tour that''s led by a local PADI guide and tailored to suit beginners. Two dives are included, along with an onboard buffet lunch and time to snorkel, swim, or even ride a banana boat.',"
  ],
  [
    "  'Marvel at the Red Sea's underwater life without getting wet on this Hurghada semi-submarine trip, complete with optional snorkel stop. Prebook to secure a place for your preferred time and date; and take a seat by the underwater windows to spy on everything from exotic fish to sea turtles. Finally, opt to join a snorkel session to immerse yourself fully in the reef life. Includes Hurghada hotel transfers, with other, select transfers at extra charge.',",
    "  'Marvel at the Red Sea''s underwater life without getting wet on this Hurghada semi-submarine trip, complete with optional snorkel stop. Prebook to secure a place for your preferred time and date; and take a seat by the underwater windows to spy on everything from exotic fish to sea turtles. Finally, opt to join a snorkel session to immerse yourself fully in the reef life. Includes Hurghada hotel transfers, with other, select transfers at extra charge.',"
  ]
];

// Apply replacements
let fixedContent = sqlContent;
for (const [search, replace] of replacements) {
  fixedContent = fixedContent.replace(search, replace);
}

// Additional general replacements
fixedContent = fixedContent
  .replace(/You'll/g, "You''ll")
  .replace(/you'll/g, "you''ll")
  .replace(/world's/g, "world''s")
  .replace(/region's/g, "region''s")
  .replace(/that's/g, "that''s")
  .replace(/isn't/g, "isn''t")
  .replace(/don't/g, "don''t")
  .replace(/Sea's/g, "Sea''s");

// Write fixed content to a new file
const outputPath = path.join(__dirname, 'sql', 'final-fixed-setup.sql');
fs.writeFileSync(outputPath, fixedContent);

console.log(`Fixed SQL file written to: ${outputPath}`); 