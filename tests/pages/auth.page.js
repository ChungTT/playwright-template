// tests/pages/auth.page.js
// Page Object for the Login screen: only behavior (no raw selectors).

const L = require('../locators/pages/auth.locators');

class AuthPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async open(path = '/login') {
    await this.page.goto(path);
  }

  /**
   * Perform a login with given credentials.
   * @param {{ email: string, password: string }} creds
   */
  async login({ email, password }) {
    await L.email(this.page).fill(email);
    await L.password(this.page).fill(password);
    await L.submit(this.page).click();
  }

  /** Wait until an error alert containing the given text is visible. */
  async expectError(text) {
    await L.error(this.page).filter({ hasText: text }).waitFor();
  }
}

module.exports = { AuthPage };
