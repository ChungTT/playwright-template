// global/global-setup.js
// Creates storage/<ENV>.auth.json before the test run.
// If defaultCredentials are provided, performs a real login and saves the auth state.

const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

// ENV wiring
const env = process.env.ENV || 'local';
const cfg = require(`../config/env.${env}.js`);

// Tunables
const LOGIN_PATH = process.env.LOGIN_PATH || '/login';           // change if your login path differs
const AUTH_TIMEOUT = Number(process.env.AUTH_TIMEOUT || 30000);  // ms
const STORAGE_DIR = path.resolve('storage');
const STORAGE_FILE = path.join(STORAGE_DIR, `${env}.auth.json`);

module.exports = async () => {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });

  // Allow skipping login (e.g., API-only projects or public app)
  if (process.env.SKIP_AUTH === '1') {
    ensureEmptyStorage(STORAGE_FILE);
    console.log(`[global-setup] SKIP_AUTH=1 → wrote empty storage: ${STORAGE_FILE}`);
    return;
  }

  // If no credentials defined, write empty storage and exit
  if (!cfg.defaultCredentials?.user || !cfg.defaultCredentials?.pass) {
    ensureEmptyStorage(STORAGE_FILE);
    console.warn('[global-setup] defaultCredentials missing → wrote empty storage (no login performed).');
    return;
  }

  const baseURL = process.env.BASE_URL || cfg.baseURL;
  const loginUrl = new URL(LOGIN_PATH, baseURL).toString();

  const browser = await chromium.launch();
  const context = await browser.newContext(); // no storage yet
  const page = await context.newPage();

  try {
    console.log(`[global-setup] Logging in at: ${loginUrl}`);
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: AUTH_TIMEOUT });

    // Reuse centralized locators
    const L = require('../tests/locators/pages/auth.locators.js');
    await L.email(page).fill(cfg.defaultCredentials.user);
    await L.password(page).fill(cfg.defaultCredentials.pass);
    await L.submit(page).click();

    // Heuristic: not on /login anymore and network is idle
    await page.waitForLoadState('networkidle', { timeout: AUTH_TIMEOUT });
    if (page.url().includes('/login')) throw new Error('Still on /login after submit');

    await context.storageState({ path: STORAGE_FILE });
    console.log(`[global-setup] Auth state saved: ${STORAGE_FILE}`);
  } catch (err) {
    ensureEmptyStorage(STORAGE_FILE);
    console.error('[global-setup] Login failed → wrote empty storage. Reason:', err.message);
  } finally {
    await context.close();
    await browser.close();
  }
};

function ensureEmptyStorage(filePath) {
  fs.writeFileSync(filePath, JSON.stringify({ cookies: [], origins: [] }));
}
