const { expect } = require('@playwright/test');
const { BasePage } = require('./base.page');
const { TEST_IDS } = require('../src/utils/testids');

class LoginPage extends BasePage {
  constructor(page) { super(page); }

  async goto() {
    // mặc định đường dẫn /login; đổi nếu app của bạn khác
    await super.goto('/login');
    // nếu có testid cho nút submit thì chờ nó
    const tid = TEST_IDS?.login?.submit;
    if (tid) {
      try { await this.expectVisibleByTestId(tid); } catch {}
    }
  }

  async fillCredentials(email, password) {
    const ids = TEST_IDS?.login ?? {};

    // Ưu tiên testid
    try {
      if (ids.email && ids.password) {
        await this.fillByTestId(ids.email, email);
        await this.fillByTestId(ids.password, password);
        return;
      }
    } catch { /* fallback dưới */ }

    // Fallback theo label (nếu chưa gắn testid)
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByLabel(/password/i).fill(password);
  }

  async submit() {
    const submitId = TEST_IDS?.login?.submit;
    try {
      if (submitId) {
        await this.clickByTestId(submitId);
        return;
      }
    } catch { /* fallback dưới */ }

    // Fallback theo role/name
    await this.page.getByRole('button', { name: /sign in|log in/i }).click();
  }

  async login(email, password) {
    await this.fillCredentials(email, password);
    await this.submit();
    await this.idle();
  }

  async assertLoggedIn() {
    // Nếu app có header user menu, check theo testid
    const userMenu = TEST_IDS?.header?.userMenu;
    if (userMenu) {
      try {
        await this.expectVisibleByTestId(userMenu);
        return;
      } catch { /* fallback */ }
    }
    // Fallback nhẹ (không còn ở /login)
    await expect(this.page).not.toHaveURL(/\/login(?:$|[?#])/);
  }

  async assertError(messageRegex = /invalid|error|failed/i) {
    const errId = TEST_IDS?.login?.error;
    if (errId) {
      await expect(this.byTestId(errId)).toBeVisible();
      await expect(this.byTestId(errId)).toHaveText
