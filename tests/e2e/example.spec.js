const { test } = require('@playwright/test');

// robust import: hỗ trợ cả module.exports = { HomePage } hoặc module.exports = HomePage
const HomeMod = require('../../pages/home.page');
const HomePage = HomeMod.HomePage || HomeMod;

test('home loads', async ({ page }) => {
  const home = new HomePage(page);
  await home.goto();
  await home.assertLoaded();
});
