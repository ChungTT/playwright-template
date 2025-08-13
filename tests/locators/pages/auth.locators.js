// tests/locators/pages/auth.locators.js
// Centralized locators for the Login screen.
// Return *Playwright Locators* (not strings).

module.exports = {
  email:    (page) => page.getByTestId('auth-email'),
  password: (page) => page.getByTestId('auth-password'),
  submit:   (page) => page.getByTestId('auth-submit'),
  error:    (page) => page.getByRole('alert'),
};
