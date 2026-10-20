const { test, expect } = require('@playwright/test');

// NOTE: Start a static server in project root before running tests:
// npx serve . or python -m http.server 8000

const BASE = process.env.TEST_BASE_URL || 'http://localhost:8000';

test('help modal opens and closes', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  await page.click('#helpBtn');
  await expect(page.locator('#helpBackdrop')).toHaveClass(/show/);
  await page.click('#helpClose');
  await expect(page.locator('#helpBackdrop')).not.toHaveClass(/show/);
});

test('tabs keyboard navigation and activation', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  const ipv6Tab = page.locator('.tab[data-tab="ipv6"]');
  await ipv6Tab.focus();
  await ipv6Tab.press('Enter');
  await expect(page.locator('#ipv6')).toBeVisible();
});

test('ipv4 calculate produces output', async ({ page }) => {
  await page.goto(BASE + '/index.html');
  // Ensure IPv4 tab active
  await page.click('.tab[data-tab="ipv4"]');
  await page.click('button:has-text("Calculate")');
  await expect(page.locator('#v4_outputs')).toBeVisible();
});
