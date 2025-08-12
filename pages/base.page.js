const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) { this.page = page; }
  async goto(path = '/') { await this.page.goto(path); }
  async idle() { await this.page.waitForLoadState('networkidle'); }
  byTestId(id) { return this.page.getByTestId(id); }
  async clickByTestId(id) { await this.byTestId(id).click(); }
  async fillByTestId(id, v) { await this.byTestId(id).fill(String(v)); }
  async expectVisibleByTestId(id) { await expect(this.byTestId(id)).toBeVisible(); }
}
module.exports = { BasePage };      // <-- named export
