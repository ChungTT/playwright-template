const L = require('../locators/pages/todo.locators');

class TodoPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) { this.page = page; }

  // baseURL sẽ là https://demo.playwright.dev → dùng path '/todomvc'
  async open(path = '/todomvc') {
    await this.page.goto(path);
  }

  async add(text) {
    await L.input(this.page).fill(text);
    await L.input(this.page).press('Enter');
  }

  async toggleFirst() {
    await L.toggleAt(this.page, 0).check();
  }

  async filter(name /* 'All' | 'Active' | 'Completed' */) {
    await L.filter(this.page, name).click();
  }

  items() { return L.items(this.page); }
}

module.exports = { TodoPage };
