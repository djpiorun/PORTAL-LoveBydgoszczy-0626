const fs = require('fs');

// Fix ObituariesPage.tsx
let obituariesPage = fs.readFileSync('src/pages/ObituariesPage.tsx', 'utf8');

// Remove the stray conflict block
const strayStart = obituariesPage.indexOf('<<<<<<< SEARCH');
const strayEnd = obituariesPage.indexOf('>>>>>>> REPLACE') + '>>>>>>> REPLACE'.length;
if (strayStart !== -1 && strayEnd !== -1) {
  const strayBlock = obituariesPage.substring(strayStart, strayEnd);
  // Extract the REPLACE part to use it later
  const replacePartStart = strayBlock.indexOf('=======') + '======='.length;
  const replacePartEnd = strayBlock.indexOf('>>>>>>> REPLACE');
  const replacePart = strayBlock.substring(replacePartStart, replacePartEnd).trim();
  
  // Remove the stray block
  obituariesPage = obituariesPage.substring(0, strayStart) + obituariesPage.substring(strayEnd);
  
  // Now find the actual code to replace
  const actualCodeStart = obituariesPage.indexOf('                  ) : (\n                    <div className={`bg-slate-900/80 border border-amber-500/20 p-1.5 relative flex ${viewMode === \'grid\' ? \'flex-col h-full\' : \'flex-col sm:flex-row\'} hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-sm`}>');
  
  if (actualCodeStart !== -1) {
    // Find the end of this block. It ends right before `                </Link>`
    const actualCodeEnd = obituariesPage.indexOf('                </Link>', actualCodeStart);
    if (actualCodeEnd !== -1) {
      obituariesPage = obituariesPage.substring(0, actualCodeStart) + replacePart + '\n' + obituariesPage.substring(actualCodeEnd);
    }
  }
}

// Also fix the CandleIcon issue in ObituariesPage.tsx
obituariesPage = obituariesPage.replace(/<CandleIcon/g, '<RealisticCandle');

fs.writeFileSync('src/pages/ObituariesPage.tsx', obituariesPage);

// Fix ObituaryPage.tsx
let obituaryPage = fs.readFileSync('src/pages/ObituaryPage.tsx', 'utf8');

// Remove the stray conflict block
const strayStart2 = obituaryPage.indexOf('<<<<<<< SEARCH');
const strayEnd2 = obituaryPage.indexOf('>>>>>>> REPLACE') + '>>>>>>> REPLACE'.length;
if (strayStart2 !== -1 && strayEnd2 !== -1) {
  const strayBlock2 = obituaryPage.substring(strayStart2, strayEnd2);
  // Extract the REPLACE part
  const replacePartStart2 = strayBlock2.indexOf('=======') + '======='.length;
  const replacePartEnd2 = strayBlock2.indexOf('>>>>>>> REPLACE');
  const replacePart2 = strayBlock2.substring(replacePartStart2, replacePartEnd2).trim();
  
  // Remove the stray block
  obituaryPage = obituaryPage.substring(0, strayStart2) + obituaryPage.substring(strayEnd2);
  
  // Now find the actual code to replace
  const actualCodeStart2 = obituaryPage.indexOf('  const renderWspomnienie = () => (\n    <div className="max-w-4xl mx-auto bg-slate-900/80 text-slate-200 p-1.5 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-amber-500/20 backdrop-blur-sm">');
  
  if (actualCodeStart2 !== -1) {
    // Find the end of this block. It ends right before `  return (`
    const actualCodeEnd2 = obituaryPage.indexOf('  return (', actualCodeStart2);
    if (actualCodeEnd2 !== -1) {
      obituaryPage = obituaryPage.substring(0, actualCodeStart2) + replacePart2 + '\n\n' + obituaryPage.substring(actualCodeEnd2);
    }
  }
}

// Also fix the CandleIcon issue in ObituaryPage.tsx
obituaryPage = obituaryPage.replace(/<CandleIcon/g, '<RealisticCandle');

fs.writeFileSync('src/pages/ObituaryPage.tsx', obituaryPage);

console.log('Done fixing files');
