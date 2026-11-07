import { test, expect } from '@playwright/test';

test('project image opens fullscreen and Esc closes only the fullscreen view', async ({ page }) => {
  await page.goto('/projects');
  const card = page.locator('.project-card').filter({ has: page.locator('.project-gallery-badge') }).first();
  await card.click();
  await page.locator('.project-modal-zoom').click();

  const lightbox = page.locator('.image-lightbox');
  await expect(lightbox).toBeVisible();
  await expect(lightbox.locator('.image-lightbox-counter')).toHaveText(/^1 \/ \d+$/);

  await page.keyboard.press('ArrowRight');
  await expect(lightbox.locator('.image-lightbox-counter')).toHaveText(/^2 \/ \d+$/);

  await page.keyboard.press('Escape');
  await expect(lightbox).toHaveCount(0);
  await expect(page.locator('.project-modal')).toBeVisible();
  await expect(page.locator('.project-modal-dot').nth(1)).toHaveClass(/active/);
});
