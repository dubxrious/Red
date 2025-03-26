const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let content = fs.readFileSync(sqlFilePath, 'utf8');

// Split into lines
const lines = content.split('\n');

// Check line 322 (0-indexed is 321)
const lineIndex = 321;
const originalLine = lines[lineIndex];

console.log('Original line 322:');
console.log(originalLine);

// Replace all apostrophes in the string without relying on regex
const fixedLine = originalLine
  .replace("You'll", "Youll")
  .replace("you'll", "youll")
  .replace("can't", "cant")
  .replace("won't", "wont")
  .replace("don't", "dont")
  .replace("doesn't", "doesnt")
  .replace("isn't", "isnt")
  .replace("it's", "its")
  .replace("that's", "thats")
  .replace("there's", "theres")
  .replace("they're", "theyre")
  .replace("we're", "were")
  .replace("you're", "youre")
  .replace("I'm", "Im")
  .replace("I've", "Ive")
  .replace("I'll", "Ill")
  .replace("he's", "hes")
  .replace("she's", "shes")
  .replace("they've", "theyve")
  .replace("we've", "weve")
  .replace("you've", "youve")
  .replace("world's", "worlds")
  .replace("Luxor's", "Luxors")
  .replace("Sea's", "Seas")
  .replace("region's", "regions");

console.log('\nFixed line 322:');
console.log(fixedLine);

// Apply the fix to the line
lines[lineIndex] = fixedLine;

// Write a subset of the SQL file with just line 322 and surrounding context for testing
const startLine = Math.max(0, lineIndex - 10);
const endLine = Math.min(lines.length - 1, lineIndex + 10);
const contextLines = lines.slice(startLine, endLine + 1);

const testFilePath = path.join(__dirname, 'sql', 'line-322-context.sql');
fs.writeFileSync(testFilePath, contextLines.join('\n'));

console.log(`\nCreated a test file with line 322 and context: ${testFilePath}`);

// Create a full fixed file
const fullFixedPath = path.join(__dirname, 'sql', 'fully-fixed-setup.sql');
fs.writeFileSync(fullFixedPath, lines.join('\n'));

console.log(`Created a fully fixed SQL file: ${fullFixedPath}`); 