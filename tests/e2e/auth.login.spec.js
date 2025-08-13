const { test, expect } = require('../fixtures/base.fixture');
const { AuthPage } = require('../pages/auth.page');

test('@smoke login works', async ({ page }) => {
  const screen = new AuthPage(page);
  await screen.open(); // '/login'
  await screen.login({ email: 'user@example.com', password: 'password' });
  await expect(page).not.toHaveURL(/\/login/i);
});
