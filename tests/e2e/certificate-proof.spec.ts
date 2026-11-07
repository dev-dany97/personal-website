import { test, expect } from '@playwright/test';

test('certificate proof opens in a dialog with a PDF link', async ({ page }) => {
  await page.goto('/contact');
  const cert = page.locator('.resume-cert-proof', { hasText: 'ISTQB' });
  await cert.click();

  const dialog = page.locator('.cert-proof-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toBeVisible();
  await expect(dialog.locator('a.cert-proof-pdf')).toHaveAttribute('href', '/certificates/istqb-ctfl.pdf');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('exchange semester grade links to the transcript', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('.timeline-note .resume-cert-proof').first().click();
  await expect(page.locator('.cert-proof-dialog a.cert-proof-pdf')).toHaveAttribute(
    'href',
    '/certificates/griffith-academic-transcript.pdf'
  );
});
