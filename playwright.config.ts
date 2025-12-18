import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: true, baseURL: 'http://localhost:3000' },
  webServer: {
    // Ensure the DB file exists (Node script) before starting the Bun dev server so SQL.js can load it
    command: 'node scripts/init-db.node.js && bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
