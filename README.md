# Playwright Project Template (JS) — Hướng dẫn chi tiết

> Mục tiêu: cung cấp một khung dự án Playwright **chuẩn, dễ mở rộng, ít flaky**, bám theo cách tổ chức mà tài liệu Playwright (Microsoft) thường dùng: test để trong `tests/`, POM/fixtures là test-code, login 1 lần ở `global-setup`, output tách riêng.

---

## 1) Yêu cầu & cài đặt

* **Node.js**: 18+ (khuyến nghị 20 LTS)
* **Playwright Test**: cài qua npm

```bash
npm i -D @playwright/test
npx playwright install --with-deps
```

Scripts gợi ý (trong `package.json`):

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "PWDEBUG=1 playwright test",
    "test:staging": "ENV=staging playwright test",
    "report": "playwright show-report"
  }
}
```

---

## 2) Cấu trúc thư mục

```
PLAYWRIGHT-TEMPLATE/
├─ .github/workflows/ci.yml            # CI chạy test, upload report
├─ config/                             # Config theo môi trường
│  ├─ env.local.js
│  ├─ env.staging.js
│  └─ env.prod.js
├─ global/
│  └─ global-setup.js                  # Đăng nhập 1 lần → lưu storageState
├─ pages/                              # POM (Page Object Model)
│  ├─ base.page.js
│  ├─ home.page.js
│  └─ login.page.js
├─ tests/
│  ├─ e2e/                             # E2E specs (UI flows)
│  │  └─ example.spec.js
│  ├─ api/                             # API specs (không mở browser)
│  │  └─ health.spec.js
│  ├─ component/                       # (tùy) nếu dùng Playwright Component
│  ├─ fixtures/                        # test fixtures (roles, builders)
│  │  └─ auth.fixture.js
│  ├─ helpers/                         # assertions tùy biến, testids, route mocks
│  │  ├─ assertions.js
│  │  └─ testids.js
│  ├─ models/                          # domain objects cho test (vd Address)
│  │  └─ address.js
│  ├─ factories/                       # tạo dữ liệu hợp lệ (faker/builders)
│  │  └─ addressFactory.js
│  └─ data/                            # test data tĩnh (json/csv)
│     └─ user.json
├─ storage/                            # storageState (auth.json) – KHÔNG commit
├─ test-results/                       # output runtime – KHÔNG commit
├─ playwright-report/                  # HTML report – KHÔNG commit
├─ .gitignore
├─ package.json
├─ playwright.config.js
└─ README.md
```

**Vì sao tổ chức như vậy?**

* `tests/…` gom **toàn bộ test code** (specs, fixtures, helpers, models, factories, data) ⇒ tách biệt với code ứng dụng, dễ bảo trì.
* `pages/` tách riêng POM để tái dùng và import ngắn trong nhiều spec (có thể đặt trong `tests/` nếu muốn cực chặt chẽ — đều hợp lệ).
* `global/global-setup.js` sinh `storage/auth.json` 1 lần cho toàn suite ⇒ chạy nhanh, ít flaky.
* Output mặc định `test-results/` + `playwright-report/` khớp template & tài liệu chính thức ⇒ tích hợp CI dễ.

---

## 3) Cấu hình Playwright (JS)

**`playwright.config.js`**

```js
require('dotenv/config');
const { defineConfig, devices } = require('@playwright/test');

const ENV = process.env.ENV || 'local';
const cfg = require(`./config/env.${ENV}.js`);

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: !!process.env.CI,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
  ],
  outputDir: 'test-results',

  use: {
    baseURL: cfg.BASE_URL,
    extraHTTPHeaders: cfg.HTTP_HEADERS || {},
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: 'storage/auth.json'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],

  globalSetup: require.resolve('./global/global-setup'),
});
```

**`config/env.local.js`**

```js
module.exports = {
  BASE_URL: 'http://localhost:3000',
  HTTP_HEADERS: {}
};
```

> Tạo thêm `env.staging.js`, `env.prod.js` tương tự. Chạy môi trường khác: `ENV=staging npx playwright test`.

---

## 4) Global setup (login 1 lần)

**`global/global-setup.js`**

```js
const { chromium } = require('@playwright/test');

module.exports = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email').fill(process.env.E2E_USER || 'user@example.com');
  await page.getByLabel('Password').fill(process.env.E2E_PASS || 'secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${baseURL}/dashboard`);

  await page.context().storageState({ path: 'storage/auth.json' });
  await browser.close();
};
```

> Lưu ý: đưa `E2E_USER`, `E2E_PASS` vào `.env` (local) và **Secrets** trên CI.

---

## 5) Page Object Model (POM)

**`pages/login.page.js`**

```js
class LoginPage {
  constructor(page) { this.page = page; }
  get email() { return this.page.getByLabel('Email'); }
  get password() { return this.page.getByLabel('Password'); }
  get submit() { return this.page.getByRole('button', { name: 'Sign in' }); }

  async goto() { await this.page.goto('/login'); }
  async login(email, pass) {
    await this.email.fill(email);
    await this.password.fill(pass);
    await this.submit.click();
  }
}
module.exports = { LoginPage };
```

**Nguyên tắc POM**

* POM **chỉ** chứa locators + hành vi UI. Tránh nhét assert business; assert để ở spec.
* Ưu tiên Locator theo **role/label/placeholder/testId** (ổn định hơn CSS/XPath).

---

## 6) Domain model & Factory (ví dụ Address)

**`tests/models/address.js`**

```js
/** @typedef {Object} Address
 * @property {string} fullName
 * @property {string} street
 * @property {string} city
 * @property {string} zip
 * @property {string} country // e.g. 'DE' | 'US' | 'AU'
 * @property {string=} state
 * @property {string=} phone
 */
```

**`tests/factories/addressFactory.js`**

```js
// đơn giản; có thể dùng faker nếu muốn
function makeAddress(partial = {}) {
  return {
    fullName: 'Andre Machon',
    street: 'Musterstraße 12',
    city: 'Köln',
    zip: '50667',
    country: 'DE',
    phone: '+49 221 123456',
    ...partial,
  };
}
module.exports = { makeAddress };
```

**Sử dụng trong POM** *(ví dụ checkout page)*

```js
class CheckoutPage {
  constructor(page) { this.page = page; }
  async fillAddress(a) {
    await this.page.getByLabel('Full name').fill(a.fullName);
    await this.page.getByLabel('Street').fill(a.street);
    await this.page.getByLabel('City').fill(a.city);
    await this.page.getByLabel(/(ZIP|Postcode)/).fill(a.zip);
    await this.page.getByLabel('Country').selectOption(a.country);
    if (a.state) await this.page.getByLabel('State').fill(a.state);
    if (a.phone) await this.page.getByLabel('Phone').fill(a.phone);
  }
}
module.exports = { CheckoutPage };
```

---

## 7) Viết test (E2E + API)

**E2E** — `tests/e2e/example.spec.js`

```js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');

test('[smoke] user can login', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(process.env.E2E_USER, process.env.E2E_PASS);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

**API** — `tests/api/health.spec.js`

```js
const { test, expect } = require('@playwright/test');

test('Health endpoint returns 200', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toMatchObject({ status: 'ok' });
});
```

---

## 8) CI/CD (GitHub Actions)

**`.github/workflows/ci.yml`**

```yaml
name: E2E
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Run tests (smoke on PR)
        env:
          ENV: staging
          E2E_USER: ${{ secrets.E2E_USER }}
          E2E_PASS: ${{ secrets.E2E_PASS }}
        run: |
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            npx playwright test -g "\[smoke\]" --reporter=line
          else
            npx playwright test --reporter=line --shard=1/2
            npx playwright test --reporter=line --shard=2/2
          fi

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
```

> **Secrets**: lưu thông tin nhạy cảm (user, pass, tokens…) trong **GitHub → Settings → Secrets and variables → Actions**.

---

## 9) Quy ước & best practices

* **1 test = 1 luồng người dùng** rõ ràng; tránh assert quá nhiều thứ không liên quan trong cùng test.
* **Không `waitForTimeout`**; dùng assertions có auto-wait: `toBeVisible`, `toHaveURL`, `toHaveAttribute`…
* **Locators ổn định**: `getByRole/getByLabel/getByPlaceholder/getByTestId`.
* **Dọn state** giữa tests (cookies, localStorage) hoặc dùng `storageState`/db seed.
* **Tagging**: thêm `[smoke]`, `[regression]` vào tên test để điều khiển tập chạy.
* **Retries & trace** bật trên CI: `retries: 1-2`, `trace: 'on-first-retry'`.
* **Visual**: dùng `toHaveScreenshot` có chủ đích (tránh toàn trang nếu UI động).

---

## 10) Troubleshooting nhanh

* **`fatal: not a git repository`** → chạy `git init` trong thư mục dự án.
* **`No configured push destination`** → thêm remote: `git remote add origin <URL>` rồi `git push -u origin main`.
* **Test pass local, fail CI** → bật trace/video, tải `playwright-report` về xem; kiểm tra khác biệt ENV/viewport/network.
* **Flaky** → đổi locator sang role/label, thêm assert điều kiện sau hành động, bỏ `waitForTimeout`.

---

## 11) Bảo mật & secrets

* Không commit `.env`, `storage/`, `playwright-report/`, `test-results/`.
* Dùng secrets trên CI, không in token ra logs.

---

## 12) Mở rộng

* **Component Testing**: thêm `tests/component/` nếu dùng React/Vue/Svelte; cấu hình theo docs của Playwright CT.
* **Mock network**: `page.route()` để ép lỗi 500/timeout/latency cho edge cases.
* **Hiệu năng cơ bản**: đo thời gian các bước quan trọng (login, search); muốn load test hãy dùng k6/JMeter.

---

## 13) `.gitignore` gợi ý

```
# Node & build
node_modules/
dist/
coverage/

# Playwright outputs
test-results/
playwright-report/
storage/

# Env & IDE
.env*
.DS_Store
.vscode/
*.log
npm-debug.log*
```

---

## 14) Ghi chú kiến trúc

* **POM không giữ state domain** (Address, User…) mà nhận qua tham số để **tái dùng tối đa**.
* **Model/Factory** cho test nằm dưới `tests/` để tránh ràng buộc với code ứng dụng.
* Tách **config theo ENV** giúp chuyển môi trường bằng 1 biến duy nhất.

> Bạn có thể chuyển toàn bộ sang TypeScript khi sẵn sàng (khuyến nghị cho dự án dài hạn).
