import { test, expect } from '@playwright/test';

test.describe('Production Server Smoke Test', () => {
  const PUBLIC_ROUTES = [
    '/',
    '/services',
    '/ai-agents',
    '/demo-models',
    '/core-systems',
    '/portfolio',
    '/packages',
  ];

  const PUBLIC_APIS = [
    '/api/services/public',
    '/api/ai-agents/public',
    '/api/demo-models',
    '/api/core-systems',
    '/api/projects',
    '/api/packages',
  ];

  test.describe('Public Routes', () => {
    test('All public routes return 200', async ({ request }) => {
      for (const route of PUBLIC_ROUTES) {
        const response = await request.get(`http://localhost:3000${route}`);
        expect(response.status()).toBe(200);
      }
    });

    test('Public routes render HTML', async ({ request }) => {
      for (const route of PUBLIC_ROUTES) {
        const response = await request.get(`http://localhost:3000${route}`);
        const text = await response.text();
        expect(text).toContain('<!DOCTYPE html>');
        expect(text).toContain('<html');
      }
    });
  });

  test.describe('Public APIs', () => {
    test('All public APIs return 200 or 404', async ({ request }) => {
      for (const api of PUBLIC_APIS) {
        const response = await request.get(`http://localhost:3000${api}`);
        expect([200, 404]).toContain(response.status());
      }
    });

    test('Public APIs return JSON', async ({ request }) => {
      for (const api of PUBLIC_APIS) {
        const response = await request.get(`http://localhost:3000${api}`);
        if (response.ok()) {
          const contentType = response.headers()['content-type'];
          expect(contentType).toContain('application/json');
        }
      }
    });

    test('Public APIs do not expose secrets', async ({ request }) => {
      for (const api of PUBLIC_APIS) {
        const response = await request.get(`http://localhost:3000${api}`);
        if (response.ok()) {
          const data = await response.json();
          const dataStr = JSON.stringify(data).toLowerCase();
          expect(dataStr).not.toContain('password');
          expect(dataStr).not.toContain('secret');
          expect(dataStr).not.toContain('api_key');
        }
      }
    });
  });

  test.describe('Admin Routes Protected', () => {
    test('Admin routes redirect to login', async ({ page }) => {
      await page.goto('http://localhost:3000/admin');
      await page.waitForLoadState('domcontentloaded');
      
      // Should redirect to login or show unauthorized
      const currentUrl = page.url();
      const isLoginPage = currentUrl.includes('/login');
      expect(isLoginPage).toBeTruthy();
    });
  });

  test.describe('Invalid Routes', () => {
    test('Invalid routes return 404', async ({ request }) => {
      const response = await request.get('http://localhost:3000/invalid-route-12345');
      expect(response.status()).toBe(404);
    });
  });
});
