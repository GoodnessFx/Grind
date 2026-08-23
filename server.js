'use strict';

const path = require('path');
const fs = require('fs');

const serverDistPath = path.join(__dirname, 'apps', 'server', 'dist', 'index.js');

if (!fs.existsSync(serverDistPath)) {
  console.error(
    '[Grind] FATAL: Built server not found at', serverDistPath,
    '\nRun "pnpm build" before starting in production.'
  );
  process.exit(1);
}

console.log('[Grind] Starting server from:', serverDistPath);
require(serverDistPath);
