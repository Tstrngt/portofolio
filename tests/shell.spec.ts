import { expect, test } from '@playwright/test';

test('theme selection persists without a reload flash', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('[data-theme-toggle]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  await expect(page.getByRole('button', { name: 'Dagwerk inschakelen' })).toBeVisible();
});

test('rail links navigate to every section', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Secties' });
  await expect(navigation.getByRole('link')).toHaveCount(7);
  await navigation.getByRole('link', { name: 'Projecten' }).click();
  await expect(page).toHaveURL(/#projecten$/);
  await expect(page.getByRole('heading', { name: 'Projecten' })).toBeInViewport();
});
