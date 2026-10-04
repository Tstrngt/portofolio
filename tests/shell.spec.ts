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

test('glass navigation stays visible and reaches the projects', async ({ page }) => {
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: 'Hoofdnavigatie' });
  await expect(navigation.getByRole('link')).toHaveCount(4);
  await navigation.getByRole('link', { name: 'Mijn werk' }).click();
  await expect(page).toHaveURL(/#projecten$/);
  await expect(page.getByRole('heading', { name: /Twee disciplines/ })).toBeInViewport();
  await expect(navigation).toBeInViewport();
  await expect(page.getByRole('heading', { name: 'Websites & systemen.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voorbereiding & uitvoering.' })).toBeVisible();
});

test('scrolling moves from the network to civil engineering', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#tim-motion')).toHaveClass(/is-enhanced/);
  await page.getByRole('link', { name: 'Civiel', exact: true }).click();
  await expect(page.locator('[data-story="infra"]')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('[data-story="infra"]')).toBeInViewport();
  await expect(page.locator('.tm-nav')).toBeInViewport();
  const heights = await page.locator('.tm-stage').evaluate((element) => ({
    stage: element.getBoundingClientRect().height,
    viewport: window.innerHeight,
  }));
  expect(heights.stage).toBe(heights.viewport);
});
