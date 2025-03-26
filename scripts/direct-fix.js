const fs = require('fs');
const path = require('path');

// Direct approach to fix the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Replace problematic patterns
const fixedContent = sqlContent
  // Fix contractions like You'll, I'll, etc.
  .replace(/([A-Za-z]+)'ll/g, "$1''ll")
  .replace(/([A-Za-z]+)'re/g, "$1''re")
  .replace(/([A-Za-z]+)'ve/g, "$1''ve")
  .replace(/([A-Za-z]+)'s/g, "$1''s")
  .replace(/([A-Za-z]+)'t/g, "$1''t")
  .replace(/([A-Za-z]+)'d/g, "$1''d")
  .replace(/([A-Za-z]+)'m/g, "$1''m")
  // Fix possessive form like users' data
  .replace(/([A-Za-z]+)'/g, "$1''")
  // Fix specific cases causing issues
  .replace(/world's/g, "world''s")
  .replace(/region's/g, "region''s")
  .replace(/don't/g, "don''t");

// Look for potential edge cases
const lines = fixedContent.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("'") && !lines[i].startsWith('--') && !lines[i].includes("''")) {
    console.log(`Potential unhandled apostrophe at line ${i + 1}: ${lines[i]}`);
  }
}

// Write the fixed output
const outputPath = path.join(__dirname, 'sql', 'fixed-direct-setup.sql');
fs.writeFileSync(outputPath, fixedContent);

console.log(`Fixed SQL file written to: ${outputPath}`);

// Try to find and print problematic line
const targetLines = lines.filter(line => line.includes("You'll") || line.includes("You''ll") || line.toLowerCase().includes("orange bay"));
if (targetLines.length > 0) {
  console.log("\nLines containing the problematic text:");
  targetLines.forEach((line, idx) => {
    console.log(`Line ${idx + 1}: ${line}`);
  });
} 