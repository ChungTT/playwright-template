// tests/fixtures/base.fixture.js
// Extends Playwright's test with handy fixtures:
// - api:      request context bound to config/apiURL
// - pageAuth: Page in a context that loads storage/<ENV>.auth.json

/// <reference types="@playwright/test" />

const { test: base, expect, request } = require('@playwright/test');

const env = process.env.ENV || 'local';
/** @type {{ apiURL?: string }} */
const cfg = require(`../../config/env.${env}.js`);

const test = base.extend({
  /**
   * API client bound to config/apiURL.
   * Usage: const res = await api.get('/health');
   */
  api: async ({}, use) => {
    if (!cfg.apiURL) {
      throw new Error(
        `[fixtures] Missing apiURL in config/env.${env}.js — add it or don't use the "api" fixture.`,
      );
    }
    const ctx = await request.newContext({ baseURL: cfg.apiURL });
    try {
      await use(ctx);
    } finally {
      await ctx.dispose();
    }
  },

  /**
   * Authenticated page using storage/<ENV>.auth.json
   * (the file is prepared in global/global-setup.js).
   * Use when a logged-in session is required.
   */
  pageAuth: async ({ browser }, use) => {
    const storageState = `storage/${env}.auth.json`;
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();
    try {
      await use(page);
    } finally {
      await context.close();
    }
  },
});

module.exports = { test, expect };
