import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const theme of ['light', 'night'] as const) {
  test(`has no accessibility violations in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      localStorage.setItem('theme', selectedTheme);
      document.documentElement.dataset.theme = selectedTheme;
    }, theme);
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test('loads resources from this origin only', async ({ page }) => {
  const foreignRequests = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4321') foreignRequests.add(url.origin);
  });
  await page.goto('/');
  expect([...foreignRequests]).toEqual([]);
});
