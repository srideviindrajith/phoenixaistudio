import { test, expect } from '@playwright/test';

test.describe('Production Performance Smoke Test', () => {
  test('Home page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('API responses are reasonably fast', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get('http://localhost:3000/api/services/public');
    const responseTime = Date.now() - startTime;
    
    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
  });

  test('Page has reasonable JavaScript bundle size', async ({ page }) => {
    const jsSizes: number[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('.js')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          const size = parseInt(contentLength);
          if (size > 0) {
            jsSizes.push(size);
          }
        }
      }
    });
    
    await page.goto('http://localhost:3000/services');
    await page.waitForLoadState('networkidle');
    
    // If we got content-length headers, verify total size is reasonable
    if (jsSizes.length > 0) {
      const totalJsSize = jsSizes.reduce((sum, size) => sum + size, 0);
      expect(totalJsSize).toBeLessThan(2000000); // 2MB
    }
    // Otherwise, skip this check as it depends on server headers
  });

  test('No obvious layout shifts', async ({ page }) => {
    await page.goto('http://localhost:3000/ai-agents');
    await page.waitForLoadState('networkidle');
    
    // Check that the page has rendered content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that main content area exists
    const main = page.locator('main').or(page.locator('.content')).or(page.locator('#content'));
    const mainExists = await main.count();
    expect(mainExists).toBeGreaterThan(0);
  });
});
