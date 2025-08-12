const { test, expect, request } = require('@playwright/test');

const HEALTH_PATH = process.env.HEALTH_PATH ?? '/';
const EXPECT = Number(process.env.HEALTH_EXPECT ?? 200);

test('health/OK', async ({ baseURL }) => {
  const ctx = await request.newContext({ baseURL });
  const res = await ctx.get(HEALTH_PATH);
  expect(res.status()).toBe(EXPECT);
});
