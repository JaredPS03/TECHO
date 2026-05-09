// Hostinger Phusion Passenger Entry Point
// This file serves as the bridge between Hostinger's Node.js environment and Next.js standalone server.

// Import the Next.js standalone server
// Make sure to run `pnpm run build` before deploying, which generates the .next/standalone folder.
require('./.next/standalone/server.js');
