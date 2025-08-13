// Page Object for Dashboard: screen behavior only (no raw selectors here).

const L = require('../locators/pages/dashboard.locators');

class DashboardPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to the dashboard route (adjust if your app differs) */
  async open(path = '/dashboard') {
    await this.page.goto(path);
  }

  /** Wait until the screen is ready (heading visible) */
  async waitLoaded() {
    await L.heading(this.page).waitFor();
  }

  /** Switch to a tab by visible name */
  async goToTab(name) {
    await L.tab(this.page, name).click();
  }

  /** Click/open a KPI/stat card by its accessible name */
  async openCard(name) {
    await L.card(this.page, name).first().click();
  }

  /** Return the locator for a table row that contains text (assert in spec) */
  row(text) {
    return L.rowByText(this.page, text);
  }

  /** Return the dashboard table locator (for further assertions) */
  table() {
    return L.table(this.page);
  }

  /** Trigger a quick action by button name */
  async runAction(name) {
    await L.action(this.page, name).click();
  }
}

module.exports = { DashboardPage };
