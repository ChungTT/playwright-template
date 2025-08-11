const { test, expect } = require('@playwright/test');
const { HomePage } = require('../../pages/home.page');

test('home loads', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.assertLoaded();
});
