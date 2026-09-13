import { test } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const;

for (const theme of ['light', 'night'] as const) {
  for (const viewport of viewports) {
    test(`${viewport.name} ${theme} screenshot`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.addInitScript((selectedTheme) => {
        document.documentElement.dataset.theme = selectedTheme;
      }, theme);
      await page.goto('/');
      await page.screenshot({
        path: testInfo.outputPath(`${viewport.name}-${theme}.png`),
        fullPage: true,
      });
    });
  }
}

test.use({ reducedMotion: 'reduce' });
test('reduced motion screenshot', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('mobile-reduced-motion.png'), fullPage: true });
});
