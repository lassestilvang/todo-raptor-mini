import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { headless: true, baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    // Ensure the DB file exists (Node script) before starting the Next dev server using Node
    // Using Node directly avoids Next.js Node version checks when bun may report older Node versions
    // Start a production server to avoid Dev overlays that can intercept clicks in CI.
    // The CI job runs `bun run build` before `npx playwright test`, so the `next start` command
    // will serve the built app.
    command: 'node scripts/init-db.node.js && node ./node_modules/next/dist/bin/next start',
    url: 'http://localhost:3000',
    reuseExistingServer: false, // always start a fresh server in CI to ensure deterministic state
    timeout: 180000,
  },
});
