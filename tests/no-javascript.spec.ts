import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

test('remains readable without JavaScript', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Fundering gereed.' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('mobile-no-javascript.png'), fullPage: true });
});
