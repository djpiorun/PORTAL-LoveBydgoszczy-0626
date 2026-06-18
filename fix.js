const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all conflict blocks
  const regex = /<<<<<<< SEARCH\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> REPLACE\n/g;
  
  content = content.replace(regex, '$2');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed ' + filePath);
}

fixFile('src/pages/ObituariesPage.tsx');
fixFile('src/pages/ObituaryPage.tsx');
