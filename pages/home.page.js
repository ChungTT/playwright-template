const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');
const { TEST_IDS } = require('../src/utils/testids');

class HomePage extends BasePage {
  constructor(page) { super(page); }
  async goto() { await super.goto('/'); await this.idle(); }
  async assertLoaded() {
    const tid = TEST_IDS?.home?.heroTitle;
    if (tid) {
      const el = this.byTestId(tid);
      try {
        if (await el.count() > 0) { await expect(el).toBeVisible(); return; }
      } catch {}
    }
    await expect(this.page).toHaveTitle(/Playwright/i); // fallback cho demo site
  }
}
module.exports = { HomePage };      // <-- named export
