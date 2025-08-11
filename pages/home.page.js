const { expect } = require('@playwright/test');

class HomePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }
  async goto() { await this.page.goto('/'); }
  async assertLoaded() {
    await expect(this.page).toHaveTitle(/Playwright/i);
  }
}
module.exports = { HomePage };
