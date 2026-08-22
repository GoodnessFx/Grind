const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'build') return;
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filepath));
        } else {
            results.push(filepath);
        }
    });
    return results;
}

const root = path.join(__dirname);
const files = walk(root);

files.forEach(file => {
    // Only process text files
    if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.sol') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.css') || file.endsWith('.txt')) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('Grind') || content.includes('grind')) {
            content = content.replace(/Grind/g, 'Grind').replace(/grind/g, 'grind');
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
        }
    }
    
    // Rename file if it contains 'Grind'
    const basename = path.basename(file);
    if (basename.includes('Grind')) {
        const newBasename = basename.replace(/Grind/g, 'Grind');
        const newPath = path.join(path.dirname(file), newBasename);
        fs.renameSync(file, newPath);
        console.log(`Renamed ${file} to ${newPath}`);
    }
});
