const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'sql', 'direct-setup.sql');
let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Process the SQL to fix quotes more thoroughly
function fixAllSqlQuotes(content) {
  // First, transform the file line by line
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip comment lines
    if (line.trim().startsWith('--')) {
      fixedLines.push(line);
      continue;
    }
    
    // Handle SQL string literals
    if (line.includes("'") && !line.includes("''")) {
      // This looks like a line that might contain a SQL string literal with apostrophes
      let inString = false;
      let fixedLine = '';
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        const nextChar = line[j + 1] || '';
        
        if (char === "'") {
          if (!inString) {
            // Entering a string
            inString = true;
            fixedLine += "'";
          } else if (nextChar === "'") {
            // Already escaped quote
            fixedLine += "''";
            j++; // Skip the next quote as we've handled it
          } else {
            // Exiting a string
            inString = false;
            fixedLine += "'";
          }
        } else if (inString && char === "'") {
          // Apostrophe inside a string - escape it
          fixedLine += "''";
        } else {
          fixedLine += char;
        }
      }
      
      // Second pass to catch any missed apostrophes
      fixedLine = fixedLine.replace(/'([^']*?)'([^']*?)'/g, function(match, p1, p2) {
        // Replace any remaining apostrophes inside string literals with double apostrophes
        return "'" + p1 + "'" + p2.replace(/'/g, "''") + "'";
      });
      
      fixedLines.push(fixedLine);
    } else {
      fixedLines.push(line);
    }
  }
  
  // After line-by-line processing, do a global pass to catch specific patterns
  let result = fixedLines.join('\n');
  
  // Common contractions and possessives
  const patterns = [
    /\bYou'll\b/g, "You''ll",
    /\byou'll\b/g, "you''ll",
    /\bI'll\b/g, "I''ll",
    /\bi'll\b/g, "i''ll",
    /\bHe'll\b/g, "He''ll",
    /\bhe'll\b/g, "he''ll",
    /\bShe'll\b/g, "She''ll",
    /\bshe'll\b/g, "she''ll",
    /\bWe'll\b/g, "We''ll",
    /\bwe'll\b/g, "we''ll",
    /\bThey'll\b/g, "They''ll",
    /\bthey'll\b/g, "they''ll",
    /\bwon't\b/g, "won''t",
    /\bcan't\b/g, "can''t",
    /\bdon't\b/g, "don''t",
    /\bisn't\b/g, "isn''t",
    /\bthat's\b/g, "that''s",
    /\bwhat's\b/g, "what''s",
    /\bit's\b/g, "it''s",
    /\bworld's\b/g, "world''s",
    /\bSea's\b/g, "Sea''s",
    /\bsea's\b/g, "sea''s",
    /\bsite's\b/g, "site''s",
    /\bLuxor's\b/g, "Luxor''s",
    /\bregion's\b/g, "region''s",
    /\bhotel's\b/g, "hotel''s",
    /\byou're\b/g, "you''re",
    /\bwe're\b/g, "we''re",
    /\bthey're\b/g, "they''re",
    /\bI've\b/g, "I''ve",
    /\byou've\b/g, "you''ve",
    /\bwe've\b/g, "we''ve",
    /\bthey've\b/g, "they''ve"
  ];
  
  // Apply all patterns
  for (let i = 0; i < patterns.length; i += 2) {
    result = result.replace(patterns[i], patterns[i + 1]);
  }
  
  // Find and fix remaining apostrophes in string literals
  const stringLiteralRegex = /'((?:[^']|'')*?)'/g;
  result = result.replace(stringLiteralRegex, function(match, capturedContent) {
    // Replace any apostrophes that haven't already been escaped
    return "'" + capturedContent.replace(/([^'])'/g, "$1''").replace(/'([^'])/g, "''$1") + "'";
  });
  
  return result;
}

// Apply the thorough fix
const thoroughlyFixedContent = fixAllSqlQuotes(sqlContent);

// Write the fixed content
const outputPath = path.join(__dirname, 'sql', 'thoroughly-fixed-setup.sql');
fs.writeFileSync(outputPath, thoroughlyFixedContent);

console.log(`SQL file with thoroughly fixed quotes written to: ${outputPath}`);

// Extract and check problem line (line 1235)
const lines = thoroughlyFixedContent.split('\n');
if (lines.length >= 1235) {
  console.log('\nChecking line 1235:');
  console.log(lines[1234]); // Line 1235 (0-indexed is 1234)
} 