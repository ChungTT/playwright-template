const { test, expect } = require('../fixtures/base.fixture');
const { TodoPage } = require('../pages/todo.page');

test('@smoke todomvc add/toggle/filter', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.open('/todomvc');

  await todo.add('buy milk');
  await todo.add('learn playwright');
  await expect(todo.items()).toHaveCount(2);

  await todo.toggleFirst();
  await todo.filter('Completed');
  await expect(todo.items()).toHaveCount(1);

  await todo.filter('Active');
  await expect(todo.items()).toHaveCount(1);
});
