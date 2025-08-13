// Centralized locators for TodoMVC demo (https://demo.playwright.dev/todomvc)

module.exports = {
  input:    (page) => page.getByPlaceholder('What needs to be done?'),
  items:    (page) => page.locator('.todo-list li'),
  toggleAt: (page, index) => page.locator('.todo-list li .toggle').nth(index),
  filter:   (page, name) => page.getByRole('link', { name, exact: true }), // 'All' | 'Active' | 'Completed'
  clearCompleted: (page) => page.getByRole('button', { name: /Clear completed/i }),
};
