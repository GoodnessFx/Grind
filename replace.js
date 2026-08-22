const fs = require('fs');

const path = 'apps/web/src/app/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add DiscoveryFeed import and remove LiveStream if needed (wait, keep it just in case)
content = content.replace(
  'import { LiveStream } from "./components/LiveStream";',
  'import { LiveStream } from "./components/LiveStream";\nimport { DiscoveryFeed } from "./components/DiscoveryFeed";'
);

// 2. Update Tab type
content = content.replace(
  'export type Tab = "home" | "gigs" | "live" | "wallet" | "profile";',
  'export type Tab = "home" | "gigs" | "discovery" | "wallet" | "profile";'
);

// 3. Swap live component for discovery
content = content.replace(
  '{tab === "live" && (\n          <LiveStream user={user} onUpdateUser={updateUser} />\n        )}',
  '{tab === "discovery" && (\n          <DiscoveryFeed user={user} onNavigate={navigate} />\n        )}'
);

fs.writeFileSync(path, content);
console.log('App.tsx updated successfully.');
