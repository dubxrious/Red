const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let content = fs.readFileSync(sqlFilePath, 'utf8');

// Split into lines for direct editing
const lines = content.split('\n');

// Known problematic lines and their fixed versions
const fixMap = {
  322: "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board.',",
  477: "  'Head out to the waters of the Red Sea on a full-day snorkeling tour from your Hurghada hotel. You''ll travel by boat to Orange Bay Island, enjoying two separate stops to snorkel with marine life (guide and equipment included) plus rides on a banana boat and a tow tube. Lunch is provided on board, but national park admission fees are at your own expense.',",
  561: "  'Sail down one of the world''s most famous waterways as you discover top attractions in southern Egypt. During this multi-day cruise from Aswan to Luxor, you''ll disembark for guided visits to the region''s most iconic sites, including Kom Ombo, the Valley of Kings, and Philae Temple. Tasty onboard meals are included, plus a personalized pickup from the airport, train station, or your Aswan hotel.',",
  647: "  'Snorkel the spectacular coral reefs of Giftun Island, including Orange Bay, on this door-to-door day trip to the Giftun Island National Park. Spend your day swimming and snorkeling in the tropical waters, keeping an eye out for dolphins along the way, and have time to sunbathe and relax on the beach. Your day includes a delicious buffet lunch on board the boat, guide assistance, a breakfast sandwich, and free-flow soft drinks and water.',",
  731: "  'While in Hurghada, make the most of your proximity to one of the world''s top snorkeling and diving sites. Head out onto the Red Sea and cruise to Dolphin House where you can explore the underwater world by snorkel. As you continue, there will be more opportunities to jump off board and snorkel and explore. Includes lunch served on board.',",
  819: "  'Ras Mohammed National Park offers some of the Red Sea''s most vibrant coral reef. Experience it on this Sharm el Sheikh snorkeling cruise featuring professional guides to help with your gear and point out marine life. As well as lunch on board, enjoy time at the beautiful White Island sandbar. Please note that your package excludes park entrance fees, while snorkeling equipment is available as an upgrade.',",
  903: "  'The Red Sea coastline around Hurghada is home to an impressive haul of dive spots, but knowing where to dive or how to do it isn''t easy without local knowledge. Find the safest and scenic sites on a dive tour that''s led by a local PADI guide and tailored to suit beginners. Two dives are included, along with an onboard buffet lunch and time to snorkel, swim, or even ride a banana boat.',",
  995: "  'Marvel at the Red Sea''s underwater life without getting wet on this Hurghada semi-submarine trip, complete with optional snorkel stop. Prebook to secure a place for your preferred time and date; and take a seat by the underwater windows to spy on everything from exotic fish to sea turtles. Finally, opt to join a snorkel session to immerse yourself fully in the reef life. Includes Hurghada hotel transfers, with other, select transfers at extra charge.',",
  1079: "  'Experience the breathtakingly beautiful coral reefs of the Red Sea in Sharm El Sheikh boarding on the glass bottom boat',",
  1155: "  'Plan an exciting adventure while visiting Egypt and explore the area from the sky during this Hurghada Parasailing Experience. This fun adventure takes you up to 164 feet (50 meters) into the sky as you fly from a speedboat below. Plus, to make your adventure a smooth one, hotel pickup from the Hurghada area is also included.',",
  1235: "  'Cruise along the Nile River, from Aswan to Luxor, on this 4-day experience. Glide by ancient riverbanks, with stops to visit sites such as the temples at Kom Ombo and Edfu, and Luxor''s celebrated temple complexes of Luxor and Karnak, all with a tour guide by your side to explain local history to you. Your package includes a sunrise hot-air balloon ride, but entrance fees are at your own expense.',",
  1315: "  'Discover royal tombs and regal temples on this 4-day Nile cruise, with an overland visit to the Abu Simbel Temples and a sunrise balloon trip over Luxor. Exploring with an Egyptologist guide, see Philae Temple, Kom Ombo, the Temple of Horus, the Valley of the Kings, and so much more. Your package includes transfers, guiding, the hot air balloon, a carriage ride and nine meals: entrance fees are at your expense.',",
  1399: "  'The Red Sea coral around Sharm el Sheikh teems with color and life. But snorkeling is not for everyone. Get up close to the underwater world without getting your face and hair wet on this semisubmersible adventure that''s suitable for all ages and fitness levels. You''ll sit by a panoramic window in an observation deck 10 feet (3 meters) below the surface, with 2-way transfers direct from your hotel.',",
  1480: "gallery to observe the reefs, rainbow-hued fish, and more through the windows. If you wish, finish with a snorkel in the surrounding waters. Ideal for non-swimmers and young children. Transfers from other, select resorts are available for an extra cost.',",
  1568: "  'Venture away from the resort town of Hurghada and head into the Sahara Desert for a day of fun activities. Start off with a thrilling quad bike tour through the desert sands followed by a dune buggy ride. Then, head to a Bedouin village to learn about the local desert culture and take a camel ride. Your day concludes with a traditional barbecue and folklore show.',",
  1652: "  'Go beyond Sharm el Sheik to visit the White Island, part of the Ras Mohammed National Park at the tip of the Sinai Peninsula. With your logistics taken care of, you''ll have more time to focus on the tide-exposed island and its underwater delights. A boat ride with stops to snorkel and an onboard lunch are part of the experience; just note that snorkel gear and park entry fees are not included.',",
  1732: "  'Check out the underwater life in the Red Sea on this full-day scuba diving experience from Sharm El Sheikh. Your guide and captain will take care of the details, like life-jackets for safety and all of your snorkel gear, to keep you safe and comfortable. Beginners are welcome. Make about three stops for diving with different kinds of fish and corals, plus enjoy an included lunch made on the boat.',",
  1816: "  'This full-day diving trip from Hurghada is ideal for novices and experts traveling together. You''ll head out onto the Red Sea and explore shallow dive sites suitable for beginners, as well as deeper areas and walls for those with more experience. Includes lunch and hotel transfers.',",
  1900: "  'Experience the beauty of Giftun Island without worrying about transportation on this hassle-free excursion. Begin with hotel pickup, then continue to the port in a comfortable minibus. The boat trip takes you straight to Giftun Island where you can see the stunning beaches and snorkel if you wish. After some free time to explore the island, satisfy your hunger with a delicious lunch on the boat before heading back to port.',",
  1988: "  'Go beyond Hurghada for a day of adventure: snorkeling, parasailing, and riding a semi-submarine and an all-terrain vehicle (ATV). Filling the best part of a day with activities in the Red Sea and the desert, this trip is perfect for those who want something more than basking on a beach. An extra perk is a stop at a Bedouin village where you can learn about traditional bread making and have the chance to ride a camel, if you wish.',",
  2076: "  'Experience a fun parasailing adventure over the red sea. Be adventure ready when the tour guide picks you up from your hotel to the Marina, where the parasailing boat will be waiting for you. Feel the air kiss your face as you parasail over the red sea and have the experience of a lifetime. Ascend to up to 164 feet above the water for about seven minutes of flight time.'"
};

// Apply the fixes
let fixedCount = 0;
for (const [lineNum, fixedLine] of Object.entries(fixMap)) {
  const index = parseInt(lineNum) - 1; // Convert to 0-indexed
  if (index >= 0 && index < lines.length) {
    lines[index] = fixedLine;
    fixedCount++;
  }
}

// Write the fixed content
const fixedContent = lines.join('\n');
const outputPath = path.join(__dirname, 'sql', 'manually-fixed-setup.sql');
fs.writeFileSync(outputPath, fixedContent);

console.log(`Fixed ${fixedCount} problematic lines in the SQL file.`);
console.log(`Saved to: ${outputPath}`);

// Create small SQL file with just problematic entries for testing
const testOutputPath = path.join(__dirname, 'sql', 'test-entries.sql');
const testContent = Object.values(fixMap).join('\n\n');
fs.writeFileSync(testOutputPath, testContent);
console.log(`Created test file with only fixed entries: ${testOutputPath}`);

// Let's check some specific examples to verify our fixes
console.log('\nExamples of fixes:');
console.log(`Line 322: ${lines[321].substring(0, 100)}...`);
console.log(`Line 1235: ${lines[1234].substring(0, 100)}...`); 