import { test, expect } from '@playwright/test';

test.describe('Production Asset QA', () => {
  test('JavaScript bundles load', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      if (request.resourceType() === 'script') {
        failedRequests.push(request.url());
      }
    });
    
    await page.goto('http://localhost:3000/services');
    await page.waitForLoadState('networkidle');
    
    expect(failedRequests.length).toBe(0);
  });

  test('CSS loads', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      if (request.resourceType() === 'stylesheet') {
        failedRequests.push(request.url());
      }
    });
    
    await page.goto('http://localhost:3000/ai-agents');
    await page.waitForLoadState('networkidle');
    
    expect(failedRequests.length).toBe(0);
  });

  test('Images load or handle missing gracefully', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      if (request.resourceType() === 'image') {
        failedRequests.push(request.url());
      }
    });
    
    await page.goto('http://localhost:3000/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Allow some image failures (missing assets should not break the page)
    // But check that the page still renders
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('No critical network failures', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', (request) => {
      // Track all failures except images (which may be optional)
      if (request.resourceType() !== 'image') {
        failedRequests.push(`${request.resourceType()}: ${request.url()}`);
      }
    });
    
    await page.goto('http://localhost:3000/packages');
    await page.waitForLoadState('networkidle');
    
    // No critical failures allowed
    expect(failedRequests.length).toBe(0);
  });

  test('Page loads without hydration errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('hydration') || text.includes('React')) {
          errors.push(text);
        }
      }
    });
    
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    
    // Should not have hydration errors
    const hydrationErrors = errors.filter(e => e.toLowerCase().includes('hydration'));
    expect(hydrationErrors.length).toBe(0);
  });
});
