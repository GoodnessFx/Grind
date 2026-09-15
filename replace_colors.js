const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'apps/web/src/pages/Home.tsx',
  'apps/web/src/pages/Login.tsx',
  'apps/web/src/pages/Marketplace.tsx',
  'apps/web/src/pages/Signup.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/#ff6b00/g, '#2563eb');
    content = content.replace(/#e66000/g, '#1d4ed8');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
