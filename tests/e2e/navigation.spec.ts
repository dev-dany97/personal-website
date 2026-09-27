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
  const toggle = page.locator('.navbar-utility button').first();
  const before = await toggle.textContent();
  await toggle.click();
  await expect(toggle).not.toHaveText(before ?? '');
});
