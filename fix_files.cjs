const fs = require('fs');

function fixObituariesPage() {
  let content = fs.readFileSync('src/pages/ObituariesPage.tsx', 'utf8');
  
  const strayStart = content.indexOf('<<<<<<< SEARCH');
  const strayEnd = content.indexOf('>>>>>>> REPLACE') + '>>>>>>> REPLACE'.length;
  
  if (strayStart !== -1 && strayEnd !== -1) {
    const strayBlock = content.substring(strayStart, strayEnd);
    const replacePartStart = strayBlock.indexOf('=======') + '======='.length;
    const replacePartEnd = strayBlock.indexOf('>>>>>>> REPLACE');
    const replacePart = strayBlock.substring(replacePartStart, replacePartEnd).trim();
    
    // Remove the stray block
    content = content.substring(0, strayStart) + content.substring(strayEnd);
    
    // Find the actual code to replace
    const actualCodeStart = content.indexOf('                  ) : (\n                    <div className={`bg-slate-900/80 border border-amber-500/20 p-1.5 relative flex ${viewMode === \'grid\' ? \'flex-col h-full\' : \'flex-col sm:flex-row\'} hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] backdrop-blur-sm`}>');
    
    if (actualCodeStart !== -1) {
      const actualCodeEnd = content.indexOf('                </Link>', actualCodeStart);
      if (actualCodeEnd !== -1) {
        content = content.substring(0, actualCodeStart) + replacePart + '\n' + content.substring(actualCodeEnd);
      }
    }
  }
  
  content = content.replace(/<CandleIcon/g, '<RealisticCandle');
  fs.writeFileSync('src/pages/ObituariesPage.tsx', content);
}

function fixObituaryPage() {
  let content = fs.readFileSync('src/pages/ObituaryPage.tsx', 'utf8');
  
  const strayStart = content.indexOf('<<<<<<< SEARCH');
  const strayEnd = content.indexOf('>>>>>>> REPLACE') + '>>>>>>> REPLACE'.length;
  
  if (strayStart !== -1 && strayEnd !== -1) {
    const strayBlock = content.substring(strayStart, strayEnd);
    const replacePartStart = strayBlock.indexOf('=======') + '======='.length;
    const replacePartEnd = strayBlock.indexOf('>>>>>>> REPLACE');
    const replacePart = strayBlock.substring(replacePartStart, replacePartEnd).trim();
    
    // Remove the stray block
    content = content.substring(0, strayStart) + content.substring(strayEnd);
    
    // Find the actual code to replace
    const actualCodeStart = content.indexOf('  const renderWspomnienie = () => (\n    <div className="max-w-4xl mx-auto bg-slate-900/80 text-slate-200 p-1.5 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-amber-500/20 backdrop-blur-sm">');
    
    if (actualCodeStart !== -1) {
      const actualCodeEnd = content.indexOf('  return (', actualCodeStart);
      if (actualCodeEnd !== -1) {
        content = content.substring(0, actualCodeStart) + replacePart + '\n\n' + content.substring(actualCodeEnd);
      }
    }
  }
  
  content = content.replace(/<CandleIcon/g, '<RealisticCandle');
  fs.writeFileSync('src/pages/ObituaryPage.tsx', content);
}

fixObituariesPage();
fixObituaryPage();

console.log('Done fixing files');
