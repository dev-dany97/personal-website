import { test, expect } from '@playwright/test';

test('home page loads with navbar and brand', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.navbar-brand')).toContainText('Daniel Mohles');
  await expect(page).toHaveTitle(/Daniel Mohles/);
});

test('navigates to the contact page and shows the form', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/contact"]').first().click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#message')).toBeVisible();
});

test('legal pages are reachable', async ({ page }) => {
  await page.goto('/impressum');
  await expect(page.locator('h1')).toBeVisible();

  await page.goto('/datenschutz');
  await expect(page.locator('h1')).toContainText('Datenschutzerkl');
});

test('language toggle switches the navbar language', async ({ page }) => {
  await page.goto('/');
  const deOption = page.locator('.lang-toggle-option', { hasText: 'DE' });
  const enOption = page.locator('.lang-toggle-option', { hasText: 'EN' });
  await expect(deOption).toHaveClass(/active/);

  await enOption.click();
  await expect(enOption).toHaveClass(/active/);
  await expect(deOption).not.toHaveClass(/active/);
});

test('gaming page shows hero, hardware filter and 3D model on demand', async ({ page }) => {
  await page.goto('/setup');
  await expect(page.locator('.gx-hero h1')).toContainText('Gaming');
  const parts = page.locator('.gx-part');
  const total = await parts.count();
  expect(total).toBeGreaterThan(10);

  await page.locator('.gx-filters button', { hasText: /Peripherie|Peripherals/ }).click();
  await expect.poll(() => parts.count()).toBeLessThan(total);

  await expect(page.locator('.gx-chamber iframe')).toHaveCount(0);
  await page.locator('.gx-chamber-gate').click();
  await expect(page.locator('.gx-chamber iframe')).toHaveAttribute('src', '/pc-modell.html');
});
