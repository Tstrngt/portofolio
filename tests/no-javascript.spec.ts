import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('remains readable without JavaScript', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Ik bouw aan/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Hoofdnavigatie' })).toBeVisible();
  await page.getByRole('link', { name: 'Mijn werk' }).click();
  await expect(page.getByRole('heading', { name: /Twee disciplines/ })).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath('mobile-no-javascript.png'), fullPage: true });
});
