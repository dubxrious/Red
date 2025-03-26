const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let content = fs.readFileSync(sqlFilePath, 'utf8');

// Split into lines for direct editing
const lines = content.split('\n');

// Known problematic lines (same as in direct-line-fix.js)
const problematicLines = [
  322, 477, 561, 647, 731, 819, 903, 995, 1079, 1155, 
  1235, 1315, 1399, 1480, 1568, 1652, 1732, 1816, 1900, 1988, 2076
];

// Function to remove apostrophes from a line
function removeApostrophes(line) {
  // Check if it's a SQL string
  if (!line.includes("'")) return line;
  
  // Find the SQL string part (between single quotes)
  const parts = [];
  let inString = false;
  let currentPart = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === "'" && (i === 0 || line[i-1] !== "'")) {
      if (!inString) {
        // Start of a string
        inString = true;
        parts.push(currentPart);
        currentPart = "'";
      } else {
        // End of a string
        inString = false;
        currentPart += "'";
        parts.push(currentPart);
        currentPart = '';
      }
    } else {
      currentPart += char;
    }
  }
  
  if (currentPart) parts.push(currentPart);
  
  // Process each part - only remove apostrophes from the string parts
  return parts.map((part, i) => {
    if (part.startsWith("'") && part.endsWith("'")) {
      // This is a string part, remove all apostrophes
      const contentPart = part.substring(1, part.length - 1);
      const cleanContent = contentPart.replace(/'/g, "");
      return "'" + cleanContent + "'";
    }
    return part;
  }).join('');
}

// Apply the fix
let fixedCount = 0;
for (const lineNum of problematicLines) {
  const index = lineNum - 1; // Convert to 0-indexed
  if (index >= 0 && index < lines.length) {
    lines[index] = removeApostrophes(lines[index]);
    fixedCount++;
  }
}

// Write the fixed content
const fixedContent = lines.join('\n');
const outputPath = path.join(__dirname, 'sql', 'apostrophes-removed-setup.sql');
fs.writeFileSync(outputPath, fixedContent);

console.log(`Removed apostrophes from ${fixedCount} problematic lines in the SQL file.`);
console.log(`Saved to: ${outputPath}`);

// Display examples of fixed lines
console.log('\nExamples of fixes:');
console.log(`Line 322: ${lines[321].substring(0, 100)}...`);
console.log(`Line 1235: ${lines[1234].substring(0, 100)}...`); 