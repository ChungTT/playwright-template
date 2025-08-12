# Playwright E2E Template · Option C (Centralized Locators)

A scalable E2E/UI/API testing template for medium–large projects: **centralized locators**, clear **Page/Component Objects**, multi-environment config, and ready-to-run CI.

<!-- Badges (replace with your repo links)
[![CI](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/your-repo/actions/workflows/ci.yml)
-->

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [ENV & Configuration](#env--configuration)
- [Folder Structure](#folder-structure)
- [Testing Style](#testing-style)
- [NPM Scripts](#npm-scripts)
- [CI (GitHub Actions)](#ci-github-actions)
- [Refactor Guidelines](#refactor-guidelines)
- [Troubleshooting](#troubleshooting)

---

## Features
- **Centralized locators** → change in one place, propagate everywhere.
- **Page/Component Objects** → separate screen behavior from reusable UI blocks.
- **Multi-environment** via `ENV=local|staging|prod`.
- **API tests** with Playwright’s request client (no browser).
- **CI ready** workflow to run tests and publish reports.

---

## Requirements
- Node.js **>= 20**
- Playwright installed with browsers:
  ```bash
  npm ci
  npx playwright install --with-deps


Quick Start
# 1) Install deps
npm ci

# 2) Install browsers + system deps
npx playwright install --with-deps

# 3) Run locally (ENV=local by default)
npx playwright test

# 4) Run against staging/prod
ENV=staging npx playwright test
ENV=prod     npx playwright test

# 5) Open HTML report
npx playwright show-report


ENV & Configuration
Select environment via ENV (local | staging | prod). Each file in config/ exports the settings for its environment.

// config/env.local.js
module.exports = {
  baseURL: 'http://localhost:3000',
  apiURL:  'http://localhost:3000/api',
  defaultCredentials: { user: 'user@example.com', pass: 'password' },
};
playwright.config.js reads ENV and imports config/env.${ENV}.js to set use.baseURL, outputDir, etc.


Folder Structure
PLAYWRIGHT-TEMPLATE
├─ .github/
│  └─ workflows/
│     └─ ci.yml                      # CI: install → test → upload report/trace
├─ config/                           # Environment-specific configuration
│  ├─ env.local.js
│  ├─ env.staging.js
│  └─ env.prod.js
├─ global/
│  └─ global-setup.js                # Pre-test hook: light seeding, create storageState, cleanup
├─ ┌────────────────────────── tests/ ───────────────────────────┐
│  ├─ e2e/                             # E2E specs (orchestrate + assert)
│  │  ├─ smoke/                        # Fast sanity checks
│  │  ├─ regression/                   # Full regression suites
│  │  └─ example.spec.js
│  ├─ api/                             # HTTP/REST tests (no browser)
│  │  └─ basic.spec.js
│  ├─ ct/                              # (optional) Component Testing — remove if unused
│  │  └─ example.ct.spec.js
│  ├─ fixtures/                        # Custom fixtures: api client, pageAuth context, user ctx…
│  │  └─ base.fixture.js
│  ├─ models/                          # Domain models (enums/types — no UI)
│  │  └─ entity.model.js
│  ├─ factories/                       # Data builders (faker…) based on models
│  │  └─ entity.factory.js
│  ├─ data/                            # Static datasets (JSON/CSV)
│  │  └─ entities.json
│  ├─ helpers/                         # Pure utilities (NO selectors)
│  │  ├─ assertions.js                 # Custom matchers (e.g., expectUrlContains, expectToast)
│  │  ├─ validate.js                   # Ajv/Zod for API contract validation
│  │  └─ waiters.js                    # Polling/wait helpers
│  ├─ locators/                        # 🧭 Centralized LOCATOR library (returns Locators; no actions)
│  │  ├─ pages/                        # Screen-level locators
│  │  │  ├─ auth.locators.js
│  │  │  ├─ dashboard.locators.js
│  │  │  └─ example.locators.js
│  │  └─ components/                   # Shared UI locators (header, modal, sidebar…)
│  │     ├─ header.locators.js
│  │     ├─ sidebar.locators.js
│  │     └─ modal.locators.js
│  ├─ components/                      # 🧩 Component Objects (behavior; import locators/components)
│  │  ├─ header.component.js
│  │  ├─ sidebar.component.js
│  │  └─ modal.component.js
│  └─ pages/                           # 📄 Page Objects (screen behavior; compose components + locators/pages)
│     ├─ auth.page.js
│     ├─ dashboard.page.js
│     └─ example.page.js
├─ └─────────────────────────────────────────────────────────────┘
├─ package.json                        # Scripts & deps (use `npm ci` on CI)
├─ package-lock.json                   # Locked dependency tree — commit this file
├─ playwright.config.js                # Base config, projects, globalSetup, ENV import
├─ .gitignore                          # Ignore node_modules/, outputs/, storage/*.auth.json, .env
└─ (outputs — generated; DO NOT commit)
   ├─ playwright-report/               # HTML report
   ├─ test-results/                    # Per-run artifacts
   └─ storage/                         # <ENV>.auth.json (created in global-setup)


Testing Style
Locators: defined centrally in tests/locators/*, return Playwright Locators (functions receive page → page.getBy…).

Components: behavior for shared UI blocks (header/sidebar/modal…), import from locators/components/*.

Pages: behavior for screens (open/fill/submit…), import from locators/pages/* and compose components.

E2E specs: orchestrate Page/Component and assert only (aim for 5–20 lines). No raw selectors in specs.

data-testid convention: prefix by block — hdr-*, sdb-*, mdl-*, auth-*, dash-* — for easy grep & refactor.

NPM Scripts
{
  "scripts": {
    "test": "playwright test",
    "test:staging": "ENV=staging playwright test",
    "report": "playwright show-report",
    "trace:open": "playwright show-trace trace.zip"
  }
}


CI (GitHub Actions)
Suggested steps in .github/workflows/ci.yml:

npm ci

npx playwright install --with-deps

ENV=staging npx playwright test

Upload playwright-report/ (and traces if needed)

Troubleshooting
Missing browsers → npx playwright install --with-deps

Lockfile issues → rm -rf node_modules package-lock.json && npm ci

Empty report → run npx playwright show-report after tests

Artifacts committed → git rm -r --cached playwright-report test-results storage