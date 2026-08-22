/**
 * Production entrypoint for Grind deployment
 */
const path = require('path');
const fs = require('fs');

// Check if server build exists
const serverDistPath = path.join(__dirname, 'apps', 'server', 'dist', 'index.js');

if (fs.existsSync(serverDistPath)) {
  console.log('[Grind] Starting built server from:', serverDistPath);
  require(serverDistPath);
} else {
  // If not prebuilt (or during direct node execution), start with ts-node
  console.log('[Grind] Starting server using ts-node...');
  try {
    require('ts-node/register');
    require('./apps/server/src/index.ts');
  } catch (err) {
    console.error('[Grind] Failed to launch server:', err);
    process.exit(1);
  }
}
