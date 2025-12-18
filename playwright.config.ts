import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: true, baseURL: 'http://localhost:3000' },
  webServer: {
    // Ensure the DB file exists (Node script) before starting the Next dev server using Node
    // Using Node directly avoids Next.js Node version checks when bun may report older Node versions
    command: 'node scripts/init-db.node.js && node ./node_modules/next/dist/bin/next dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
