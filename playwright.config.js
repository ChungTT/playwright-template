// @ts-check

// Read ENV to load the matching config (default: local)
const env = process.env.ENV || 'local';
/** @type {{ baseURL: string, apiURL?: string, defaultCredentials?: any }} */
const cfg = require(`./config/env.${env}.js`);

// Allow overriding baseURL via environment variable (e.g., GitHub Secrets)
const baseURL = process.env.BASE_URL || cfg.baseURL;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',

  // Per-test timeout
  timeout: 30_000,

  // expect() timeout
  expect: { timeout: 5_000 },

  // Reporters: list in CI logs + HTML report in playwright-report/
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    // Optional: JUnit/JSON reporters if needed
    // ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // Default context/page settings
  use: {
    baseURL,                              // prefers BASE_URL env if provided
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Do NOT set global storageState here if you use a pageAuth fixture
  },

  // Run on all three engines
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox' },
    { name: 'webkit' },
  ],

  // Prepare storage/, light seeding, etc.
  globalSetup: './global/global-setup.js',

  // Where Playwright writes artifacts (trace/video/screenshot)
  outputDir: `test-results/${env}`,

  // CI-friendly defaults
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Optional: start a local dev server before tests
  // webServer: env === 'local' ? {
  //   command: 'npm run dev',
  //   url: baseURL,
  //   timeout: 120_000,
  //   reuseExistingServer: !process.env.CI,
  // } : undefined,
};

module.exports = config;
