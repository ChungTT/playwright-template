const { test, expect } = require('../fixtures/base.fixture');
const { DashboardPage } = require('../pages/dashboard.page');

test('@smoke dashboard loads & shows table', async ({ pageAuth }) => {
  const dash = new DashboardPage(pageAuth);
  await dash.open('/dashboard'); // or: await dash.open();
  await dash.waitLoaded();
  await expect(dash.table()).toBeVisible(); // if dashboard has table
});
