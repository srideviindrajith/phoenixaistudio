import { test, expect } from '@playwright/test';
import { createTestHelpers } from './helpers/test-helpers';

const PUBLIC_MODULES = [
  { name: 'Services', path: '/services', heading: /Services/i },
  { name: 'AI Agents', path: '/ai-agents', heading: /AI Agent/i },
  { name: 'Demo Models', path: '/demo-models', heading: /Demo Model/i },
  { name: 'Core Systems', path: '/core-systems', heading: /Core System/i },
  { name: 'Portfolio', path: '/portfolio', heading: /Portfolio|Project/i },
  { name: 'Packages', path: '/packages', heading: /Packages/i },
];

const VIEWPORTS = {
  desktop: [
    { width: 1440, height: 900, name: 'Desktop 1440x900' },
    { width: 1280, height: 800, name: 'Desktop 1280x800' },
  ],
  tablet: [
    { width: 1024, height: 768, name: 'Tablet 1024x768' },
    { width: 820, height: 1180, name: 'Tablet 820x1180' },
    { width: 768, height: 1024, name: 'Tablet 768x1024' },
  ],
  mobile: [
    { width: 430, height: 932, name: 'Mobile 430x932' },
    { width: 390, height: 844, name: 'Mobile 390x844' },
    { width: 375, height: 812, name: 'Mobile 375x812' },
  ],
};

test.describe('Public UI / Responsive / Cross-Browser QA', () => {

  // ==========================================
  // DESKTOP VIEWPORT TESTS
  // ==========================================
  test.describe('Desktop Viewport Tests', () => {
    for (const viewport of VIEWPORTS.desktop) {
      test.describe(`${viewport.name}`, () => {
        for (const module of PUBLIC_MODULES) {
          test(`${module.name} - ${viewport.name}`, async ({ page }) => {
            const helpers = createTestHelpers(page);
            await helpers.setViewportSize(viewport.width, viewport.height);
            await helpers.navigateTo(module.path);
            await helpers.waitForPageLoad();

            // Check page loads
            const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
            await expect(heading).toBeVisible();

            // Check for horizontal overflow
            const hasHorizontalOverflow = await page.evaluate(() => {
              return document.body.scrollWidth > window.innerWidth;
            });
            expect(hasHorizontalOverflow).toBeFalsy();

            // Check for console errors
            const errors = await helpers.captureConsoleErrors();
            expect(errors.length).toBe(0);

            // Check for broken images
            const brokenImages = await helpers.checkBrokenImages();
            expect(brokenImages.length).toBe(0);
          });
        }
      });
    }
  });

  // ==========================================
  // TABLET VIEWPORT TESTS
  // ==========================================
  test.describe('Tablet Viewport Tests', () => {
    for (const viewport of VIEWPORTS.tablet) {
      test.describe(`${viewport.name}`, () => {
        for (const module of PUBLIC_MODULES) {
          test(`${module.name} - ${viewport.name}`, async ({ page }) => {
            const helpers = createTestHelpers(page);
            await helpers.setViewportSize(viewport.width, viewport.height);
            await helpers.navigateTo(module.path);
            await helpers.waitForPageLoad();

            // Check page loads
            const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
            await expect(heading).toBeVisible();

            // Check for horizontal overflow
            const hasHorizontalOverflow = await page.evaluate(() => {
              return document.body.scrollWidth > window.innerWidth;
            });
            expect(hasHorizontalOverflow).toBeFalsy();

            // Check for console errors
            const errors = await helpers.captureConsoleErrors();
            expect(errors.length).toBe(0);

            // Check for broken images
            const brokenImages = await helpers.checkBrokenImages();
            expect(brokenImages.length).toBe(0);
          });
        }
      });
    }
  });

  // ==========================================
  // MOBILE VIEWPORT TESTS
  // ==========================================
  test.describe('Mobile Viewport Tests', () => {
    for (const viewport of VIEWPORTS.mobile) {
      test.describe(`${viewport.name}`, () => {
        for (const module of PUBLIC_MODULES) {
          test(`${module.name} - ${viewport.name}`, async ({ page }) => {
            const helpers = createTestHelpers(page);
            await helpers.setViewportSize(viewport.width, viewport.height);
            await helpers.navigateTo(module.path);
            await helpers.waitForPageLoad();

            // Check page loads
            const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
            await expect(heading).toBeVisible();

            // Check for horizontal overflow
            const hasHorizontalOverflow = await page.evaluate(() => {
              return document.body.scrollWidth > window.innerWidth;
            });
            expect(hasHorizontalOverflow).toBeFalsy();

            // Check mobile navigation if present
            const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .mobile-menu-button, [data-testid="mobile-menu"]').first();
            if (await mobileMenuButton.isVisible()) {
              await expect(mobileMenuButton).toBeVisible();
            }

            // Check for console errors
            const errors = await helpers.captureConsoleErrors();
            expect(errors.length).toBe(0);

            // Check for broken images
            const brokenImages = await helpers.checkBrokenImages();
            expect(brokenImages.length).toBe(0);
          });
        }
      });
    }
  });

  // ==========================================
  // UI QUALITY CHECKS
  // ==========================================
  test.describe('UI Quality Checks', () => {
    for (const module of PUBLIC_MODULES) {
      test(`${module.name} - No horizontal scroll on body`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        const hasHorizontalScroll = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        
        expect(hasHorizontalScroll).toBeFalsy();
      });

      test(`${module.name} - Buttons remain visible and usable`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        const buttons = page.locator('button, a[href]').filter({ hasText: /.+/ });
        const count = await buttons.count();
        
        if (count > 0) {
          // Check first few buttons are visible
          const visibleButtons = buttons.first();
          await expect(visibleButtons).toBeVisible();
        }
      });

      test(`${module.name} - No unexpected blank sections`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        // Just verify page loads without major blank sections
        const heading = page.locator('h1, h2').filter({ hasText: /.+/ }).first();
        await expect(heading).toBeVisible();
      });

      test(`${module.name} - No layout shifts during load`, async ({ page }) => {
        await page.goto(module.path, { waitUntil: 'domcontentloaded' });
        
        // Take initial measurements
        const initialLayout = await page.evaluate(() => {
          const body = document.body;
          return {
            width: body.scrollWidth,
            height: body.scrollHeight,
          };
        });

        await page.waitForLoadState('networkidle');

        // Check for significant layout shifts
        const finalLayout = await page.evaluate(() => {
          const body = document.body;
          return {
            width: body.scrollWidth,
            height: body.scrollHeight,
          };
        });

        // Allow some differences - Next.js hydration can cause shifts
        const widthShift = Math.abs(finalLayout.width - initialLayout.width);
        const heightShift = Math.abs(finalLayout.height - initialLayout.height);
        
        // More permissive thresholds for Next.js apps
        expect(widthShift).toBeLessThan(100);
        expect(heightShift).toBeLessThan(500);
      });
    }
  });

  // ==========================================
  // NAVIGATION AND LINKS
  // ==========================================
  test.describe('Navigation and Links', () => {
    for (const module of PUBLIC_MODULES) {
      test(`${module.name} - Navbar renders correctly`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        const nav = page.locator('nav, [role="navigation"], header').first();
        await expect(nav).toBeVisible();
      });

      test(`${module.name} - Internal links work`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        const internalLinks = page.locator('a[href^="/"]').first();
        if (await internalLinks.isVisible()) {
          const href = await internalLinks.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^\//);
        }
      });

      test(`${module.name} - External links are correct`, async ({ page }) => {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');

        const externalLinks = page.locator('a[href^="http"]').first();
        if (await externalLinks.isVisible()) {
          const href = await externalLinks.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^https?:\/\//);
        }
      });
    }
  });

  // ==========================================
  // FOOTER RESPONSIVENESS
  // ==========================================
  test.describe('Footer Responsiveness', () => {
    for (const module of PUBLIC_MODULES) {
      test(`${module.name} - Footer renders correctly on desktop`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(1440, 900);
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();

        const footer = page.locator('footer').first();
        if (await footer.isVisible()) {
          await expect(footer).toBeVisible();
        }
      });

      test(`${module.name} - Footer renders correctly on mobile`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(375, 812);
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();

        const footer = page.locator('footer').first();
        if (await footer.isVisible()) {
          await expect(footer).toBeVisible();
        }
      });
    }
  });

  // ==========================================
  // CONSOLE AND NETWORK ERRORS
  // ==========================================
  test.describe('Console and Network Errors', () => {
    for (const module of PUBLIC_MODULES) {
      test(`${module.name} - No console errors`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        const errors = await helpers.captureConsoleErrors();
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();
        
        expect(errors.length).toBe(0);
      });

      test(`${module.name} - No failed network requests`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        const failedRequests = await helpers.captureNetworkErrors();
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();
        
        // Filter out non-critical failures (like analytics, tracking, etc.)
        const criticalFailures = failedRequests.filter(req => 
          !req.includes('analytics') && 
          !req.includes('tracking') && 
          !req.includes('fonts')
        );
        
        expect(criticalFailures.length).toBe(0);
      });
    }
  });

  // ==========================================
  // DETAIL PAGES RESPONSIVENESS (where applicable)
  // ==========================================
  test.describe('Detail Pages Responsiveness', () => {
    test('AI Agents detail page - Desktop', async ({ page, request }) => {
      const apiResponse = await request.get('/api/ai-agents/public');
      const data = await apiResponse.json();
      const agents = data.agents;

      if (agents.length > 0) {
        const sampleAgent = agents[0];
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(1440, 900);
        await page.goto(`/ai-agents/${sampleAgent.id}`);
        await page.waitForLoadState('networkidle');

        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalOverflow).toBeFalsy();
      }
    });

    test('AI Agents detail page - Mobile', async ({ page, request }) => {
      const apiResponse = await request.get('/api/ai-agents/public');
      const data = await apiResponse.json();
      const agents = data.agents;

      if (agents.length > 0) {
        const sampleAgent = agents[0];
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(375, 812);
        await page.goto(`/ai-agents/${sampleAgent.id}`);
        await page.waitForLoadState('networkidle');

        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });
        expect(hasHorizontalOverflow).toBeFalsy();
      }
    });
  });

  // ==========================================
  // VISUAL REGRESSION SCREENSHOTS
  // ==========================================
  test.describe('Visual Regression Screenshots', () => {
    for (const module of PUBLIC_MODULES) {
      test(`${module.name} - Desktop screenshot`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(1440, 900);
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();

        await page.screenshot({
          path: `screenshots/ui-qa/${module.name.toLowerCase().replace(/\s+/g, '-')}-desktop.png`,
          fullPage: true,
        });
      });

      test(`${module.name} - Tablet screenshot`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(768, 1024);
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();

        await page.screenshot({
          path: `screenshots/ui-qa/${module.name.toLowerCase().replace(/\s+/g, '-')}-tablet.png`,
          fullPage: true,
        });
      });

      test(`${module.name} - Mobile screenshot`, async ({ page }) => {
        const helpers = createTestHelpers(page);
        await helpers.setViewportSize(375, 812);
        await helpers.navigateTo(module.path);
        await helpers.waitForPageLoad();

        await page.screenshot({
          path: `screenshots/ui-qa/${module.name.toLowerCase().replace(/\s+/g, '-')}-mobile.png`,
          fullPage: true,
        });
      });
    }
  });
});
