\# Playwright-template (POM)



Playwright E2E/API template theo \*\*Page Object Model\*\* (POM). Chạy được ngay trên Chromium/Firefox/WebKit, có HTML report và CI GitHub Actions.



\## Features

\- POM: `pages/\*` tách khỏi `tests/\*`

\- Test E2E + API

\- HTML report: `reports/html`

\- CI: `.github/workflows/ci.yml`

\- (Tùy chọn) helpers trong `src/` (utils/services/factories)



\## Requirements

\- Node.js 18+ (khuyến nghị 20)

\- npm

\- Playwright browsers: `npx playwright install`



\## Cài đặt

```bash

npm install

npx playwright install



