const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Very direct approach to fix all string literals
function fixAllStringLiterals(content) {
  // Identify all SQL string literals
  const result = [];
  let i = 0;
  let inString = false;
  let currentString = '';
  
  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1] || '';
    
    if (char === "'" && nextChar === "'") {
      // Handle already escaped quotes
      if (inString) {
        currentString += "''";
      } else {
        result.push("''");
      }
      i += 2;  // Skip both quotes
    } else if (char === "'") {
      if (!inString) {
        // Start of a string
        inString = true;
        result.push("'");
        currentString = '';
      } else {
        // End of a string - fix any single quotes inside it
        inString = false;
        
        // Replace all single quotes with double quotes for SQL
        currentString = currentString.replace(/'/g, "''");
        
        result.push(currentString);
        result.push("'");
      }
      i++;
    } else {
      if (inString) {
        currentString += char;
      } else {
        result.push(char);
      }
      i++;
    }
  }
  
  return result.join('');
}

// Apply the thorough fix
const simpleFixedContent = fixAllStringLiterals(sqlContent);

// Write the fixed content
const outputPath = path.join(__dirname, 'sql', 'completely-fixed-setup.sql');
fs.writeFileSync(outputPath, simpleFixedContent);

console.log(`SQL file with all quotes fixed written to: ${outputPath}`);

// Check the specific problem area (line 1235)
const lines = simpleFixedContent.split('\n');
if (lines.length >= 1235) {
  console.log('\nChecking problem line (around 1235):');
  for (let i = 1233; i <= 1236; i++) {
    if (lines[i - 1]) {
      console.log(`Line ${i}: ${lines[i - 1].substring(0, 100)}...`);
    }
  }
} 