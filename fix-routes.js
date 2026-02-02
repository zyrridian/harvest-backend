const fs = require('fs');
const path = require('path');

// Function to recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next' && file !== 'generated') {
        findRouteFiles(filePath, fileList);
      }
    } else if (file === 'route.ts' && filePath.includes('\\[') || filePath.includes('/[')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern 1: Fix params type declaration
  const typePattern = /\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*id:\s*string\s*\}\s*\}/g;
  if (typePattern.test(content)) {
    content = content.replace(typePattern, '{ params }: { params: Promise<{ id: string }> }');
    modified = true;
  }
  
  // Pattern 2: Add await params at the start of function
  const functionPattern = /(export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\s*\([^)]+\)\s*\{[\s\n]*(?:\/\/[^\n]*\n)*[\s\n]*try\s*\{[\s\n]*)/;
  if (functionPattern.test(content) && !content.includes('await params')) {
    content = content.replace(functionPattern, '$1    // Await params in Next.js 15+\n    const { id } = await params;\n\n');
    modified = true;
  }
  
  // Pattern 3: Replace params.id with just id
  if (content.includes('params.id')) {
    content = content.replace(/params\.id/g, 'id');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('Finding route files with dynamic parameters...\n');
const apiDir = path.join(__dirname, 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files to check\n`);

let fixedCount = 0;
routeFiles.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log('Done!');
