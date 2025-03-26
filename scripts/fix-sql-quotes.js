const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Function to properly escape single quotes in SQL strings
function fixSqlQuotes(sqlContent) {
  // Split the content by SQL statements to handle each statement separately
  const statements = sqlContent.split(';');
  
  return statements.map(statement => {
    // Skip empty statements or statements without string literals
    if (!statement.trim() || !statement.includes("'")) {
      return statement;
    }
    
    // Find all strings between single quotes in the SQL statement
    let inString = false;
    let currentString = '';
    let fixedStatement = '';
    
    for (let i = 0; i < statement.length; i++) {
      const char = statement[i];
      const nextChar = statement[i + 1] || '';
      
      if (char === "'" && (!inString || nextChar !== "'")) {
        // Toggle string mode when we encounter a non-escaped quote
        inString = !inString;
        
        if (!inString) {
          // We're exiting a string - replace all apostrophes with double quotes
          const escapedString = currentString.replace(/'/g, "''");
          fixedStatement += "'" + escapedString + "'";
          currentString = '';
        } else {
          // We're entering a string
          fixedStatement += "'";
        }
      } else if (char === "'" && nextChar === "'") {
        // Handle already escaped quotes
        if (inString) {
          currentString += "''";
        } else {
          fixedStatement += "''";
        }
        i++; // Skip the next quote as we've handled the pair
      } else {
        // Normal character
        if (inString) {
          currentString += char;
        } else {
          fixedStatement += char;
        }
      }
    }
    
    return fixedStatement;
  }).join(';');
}

// Fix the quotes in the SQL content
const fixedSqlContent = fixSqlQuotes(sqlContent);

// Write the fixed SQL back to a new file
const outputPath = path.join(__dirname, 'sql', 'fixed-direct-setup.sql');
fs.writeFileSync(outputPath, fixedSqlContent);

console.log(`SQL file with fixed quotes written to: ${outputPath}`);

// For debugging, extract a sample of the problematic part
// Look for specific line with "You'll" to verify fix
const lines = fixedSqlContent.split('\n');
let problematicLineIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("You'll") || lines[i].includes("You''ll")) {
    problematicLineIndex = i;
    break;
  }
}

if (problematicLineIndex >= 0) {
  console.log('\nVerifying fix for problematic line:');
  console.log('Line', problematicLineIndex + 1, ':', lines[problematicLineIndex]);
  
  // Also show the surrounding context
  if (problematicLineIndex > 0) {
    console.log('Previous line:', lines[problematicLineIndex - 1]);
  }
  if (problematicLineIndex < lines.length - 1) {
    console.log('Next line:', lines[problematicLineIndex + 1]);
  }
} 