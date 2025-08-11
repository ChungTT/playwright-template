const { test, expect, request } = require('@playwright/test');

test('GET /health returns 200', async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const res = await ctx.get('/health');
  expect(res.status()).toBe(200);
});
