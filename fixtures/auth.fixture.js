const base = require('@playwright/test');

const test = base.test.extend({
  authStorageState: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('/login'); // TODO: điền flow thật
    // await page.fill(...); await page.click(...);
    await ctx.storageState({ path: 'storage/auth.json' });
    await ctx.close();
    await use('storage/auth.json');
  }
});
const expect = test.expect;

module.exports = { test, expect };
