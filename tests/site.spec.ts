import { test, expect } from '@playwright/test';

const routes = ['/', '/contact/', '/404.html', '/playground/bezier/'];

test.describe('site smoke tests', () => {
  for (const route of routes) {
    test(`GET ${route} should load without hard errors`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response).not.toBeNull();
      expect(response?.status()).toBeLessThan(400);
    });
  }

  test('home page should render welcome heading and projects section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
  });

  test('contact page should expose key contact channels', async ({ page }) => {
  await page.goto('/contact/');
  const contact = page.locator('#contact');

  await expect(contact.getByRole('heading', { name: 'Contact' })).toBeVisible();
  await expect(contact.getByRole('link', { name: 'Email' })).toHaveAttribute('href', /mailto:/);
  await expect(contact.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', /github\.com/);
  await expect(contact.getByRole('button', { name: 'Send Message' })).toBeVisible();
});

  test('primary home navigation links should not 404', async ({ page }) => {
    await page.goto('/');
    const urls = await page.locator('main a[href]').evaluateAll((anchors) => {
      const origin = window.location.origin;
      return anchors
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => Boolean(href))
        .filter((href) => href.startsWith('/') || !href.startsWith('http'))
        .slice(0, 12)
        .map((href) => new URL(href, origin).toString());
    });

    for (const url of urls) {
      const response = await page.request.get(url);
      expect(response.status(), `${url} should be reachable`).toBeLessThan(400);
    }
  });
});
