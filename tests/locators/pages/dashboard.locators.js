// Centralized locators for the Dashboard screen (generic / ARIA-first).
// Adjust the regexes or add data-testid variants if your app uses testids.

module.exports = {
  // H1/H2 like "Dashboard" or "Overview"
  heading: (page) => page.getByRole('heading', { name: /dashboard|overview/i }),

  // Tabs such as "Overview", "Reports", "Settings", ...
  tab: (page, name) =>
    page.getByRole('tab', { name, exact: false }),

  // KPI / statistic cards: <section/region aria-label="Revenue">… or role="group"
  card: (page, name) =>
    page.getByRole('region', { name, exact: false })
        .or(page.getByRole('group', { name, exact: false })),

  // Main table (if present)
  table: (page) => page.getByRole('table'),

  // Row that contains the given text (case-insensitive)
  rowByText: (page, text) =>
    page.getByRole('row', { name: new RegExp(text, 'i') }),

  // Quick action buttons on the screen
  action: (page, name) =>
    page.getByRole('button', { name, exact: false }),

  // Optional: empty state
  emptyState: (page) =>
    page.getByTestId?.('empty-state') ?? page.getByText(/no data|empty/i),
};
