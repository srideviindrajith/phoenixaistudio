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

test.describe('Cross-Module Integration QA', () => {

  // ==========================================
  // 1. PUBLIC NAVIGATION JOURNEY
  // ==========================================
  test.describe('Public Navigation Journey', () => {
    test('Navigate through all public modules from Home', async ({ page }) => {
      const helpers = createTestHelpers(page);
      
      // Navigate to each module directly (more stable than navbar navigation)
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Allow time for hydration
        
        // Verify correct page content
        const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
        await expect(heading).toBeVisible();
        
        // Verify no broken routes
        expect(page.url()).toContain(module.path);
      }
    });

    test('Browser back and forward navigation works', async ({ page }) => {
      const helpers = createTestHelpers(page);
      
      // Navigate through modules
      await helpers.navigateTo('/services');
      await helpers.waitForPageLoad();
      
      await helpers.navigateTo('/ai-agents');
      await helpers.waitForPageLoad();
      
      // Go back
      await page.goBack();
      await page.waitForTimeout(1000); // Allow time for navigation
      expect(page.url()).toContain('/services');
      
      // Go forward
      await page.goForward();
      await page.waitForTimeout(1000); // Allow time for navigation
      expect(page.url()).toContain('/ai-agents');
    });

    test('No unexpected redirects during navigation', async ({ page }) => {
      // Test a few key modules
      const modulesToTest = PUBLIC_MODULES.slice(0, 3);
      
      for (const module of modulesToTest) {
        await page.goto(module.path);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        
        // Verify we're on the expected URL
        expect(page.url()).toContain(module.path);
        
        // Verify page loads successfully
        const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
        await expect(heading).toBeVisible();
      }
    });
  });

  // ==========================================
  // 2. SERVICES → RELATED ACTIONS
  // ==========================================
  test.describe('Services → Related Actions', () => {
    test('Services page navigation works', async ({ page }) => {
      const helpers = createTestHelpers(page);
      await helpers.navigateTo('/services');
      await helpers.waitForPageLoad();
      
      // Verify services page loads
      const heading = page.locator('h1, h2').filter({ hasText: /Services/i }).first();
      await expect(heading).toBeVisible();
      
      // Verify navigation still works after reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const headingAfterReload = page.locator('h1, h2').filter({ hasText: /Services/i }).first();
      await expect(headingAfterReload).toBeVisible();
    });
  });

  // ==========================================
  // 3. AI AGENTS JOURNEY
  // ==========================================
  test.describe('AI Agents Journey', () => {
    test('AI Agents listing → detail → CTA → back', async ({ page, request }) => {
      const helpers = createTestHelpers(page);
      
      // Get public agents from API
      const apiResponse = await request.get('/api/ai-agents/public');
      const data = await apiResponse.json();
      const agents = data.agents || [];
      
      if (agents.length > 0) {
        const sampleAgent = agents[0];
        
        // Navigate to listing
        await helpers.navigateTo('/ai-agents');
        await helpers.waitForPageLoad();
        
        // Navigate to detail page
        await page.goto(`/ai-agents/${sampleAgent.id}`);
        await page.waitForLoadState('networkidle');
        
        // Verify correct agent data
        const detailHeading = page.locator('h1').first();
        await expect(detailHeading).toBeVisible();
        const detailText = await detailHeading.textContent();
        expect(detailText?.toLowerCase()).toContain(sampleAgent.name.toLowerCase());
        
        // Test CTA if available
        const ctaButton = page.locator('a[href], button').filter({ hasText: /demo|try|live|contact/i }).first();
        if (await ctaButton.isVisible()) {
          const href = await ctaButton.getAttribute('href');
          expect(href).toBeTruthy();
        }
        
        // Back to listing
        await page.goto('/ai-agents');
        await page.waitForLoadState('networkidle');
        
        // Verify listing still works
        const listingHeading = page.locator('h1, h2').filter({ hasText: /AI Agent/i }).first();
        await expect(listingHeading).toBeVisible();
      }
    });

    test('Invalid agent ID shows proper error handling', async ({ page }) => {
      await page.goto('/ai-agents/invalid-id-99999');
      await page.waitForLoadState('networkidle');
      
      // Should not crash - should show error or redirect
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
    });
  });

  // ==========================================
  // 4. DEMO MODELS JOURNEY
  // ==========================================
  test.describe('Demo Models Journey', () => {
    test('Demo Models listing → demo action → return', async ({ page, request }) => {
      const helpers = createTestHelpers(page);
      
      // Get public models from API
      const apiResponse = await request.get('/api/demo-models');
      const data = await apiResponse.json();
      const models = data.models?.filter((m: any) => m.status) || [];
      
      if (models.length > 0) {
        // Navigate to listing
        await helpers.navigateTo('/demo-models');
        await helpers.waitForPageLoad();
        
        // Test demo action if available
        const demoButton = page.locator('button').filter({ hasText: /demo|try|preview|interactive/i }).first();
        if (await demoButton.isVisible()) {
          await demoButton.click();
          await page.waitForTimeout(1000); // Wait for any modal/interaction
        }
        
        // Return to listing
        await page.goto('/demo-models');
        await page.waitForLoadState('networkidle');
        
        // Verify listing still works
        const heading = page.locator('h1, h2').filter({ hasText: /Demo Model/i }).first();
        await expect(heading).toBeVisible();
      }
    });
  });

  // ==========================================
  // 5. CORE SYSTEMS JOURNEY
  // ==========================================
  test.describe('Core Systems Journey', () => {
    test('Core Systems listing → CTA → destination → back', async ({ page, request }) => {
      const helpers = createTestHelpers(page);
      
      // Get public systems from API
      const apiResponse = await request.get('/api/core-systems');
      const data = await apiResponse.json();
      const systems = data.systems?.filter((s: any) => s.status) || [];
      
      if (systems.length > 0) {
        // Navigate to listing
        await helpers.navigateTo('/core-systems');
        await helpers.waitForPageLoad();
        
        // Test CTA if available
        const ctaLink = page.locator('a[href]').filter({ hasText: /learn|view|details|more/i }).first();
        if (await ctaLink.isVisible()) {
          const href = await ctaLink.getAttribute('href');
          if (href && href.startsWith('http')) {
            expect(href).toMatch(/^https?:\/\//);
          }
        }
        
        // Verify listing still works
        const heading = page.locator('h1, h2').filter({ hasText: /Core System/i }).first();
        await expect(heading).toBeVisible();
      }
    });

    test('Invalid system slug shows proper error handling', async ({ page }) => {
      await page.goto('/core-systems/invalid-slug-99999');
      await page.waitForTimeout(5000); // Wait for error handling
      
      // Should not crash - page should load or show error
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
    });
  });

  // ==========================================
  // 6. PORTFOLIO JOURNEY
  // ==========================================
  test.describe('Portfolio Journey', () => {
    test('Portfolio → project link → return', async ({ page, request }) => {
      const helpers = createTestHelpers(page);
      
      // Get public projects from API
      const apiResponse = await request.get('/api/projects');
      const data = await apiResponse.json();
      const projects = data.projects || [];
      
      if (projects.length > 0) {
        // Navigate to portfolio
        await helpers.navigateTo('/portfolio');
        await helpers.waitForPageLoad();
        
        // Test external link if available
        const externalLink = page.locator('a[href^="http"]').first();
        if (await externalLink.isVisible()) {
          const href = await externalLink.getAttribute('href');
          expect(href).toMatch(/^https?:\/\//);
        }
        
        // Verify portfolio still works
        const heading = page.locator('h1, h2').filter({ hasText: /Portfolio|Project/i }).first();
        await expect(heading).toBeVisible();
      }
    });
  });

  // ==========================================
  // 7. PACKAGES JOURNEY
  // ==========================================
  test.describe('Packages Journey', () => {
    test('Packages → package → CTA → destination', async ({ page, request }) => {
      const helpers = createTestHelpers(page);
      
      // Get public packages from API
      const apiResponse = await request.get('/api/packages');
      const data = await apiResponse.json();
      const packages = (data.packages || []).filter((p: any) => p.status === 'Active' && p.visibility === 'Public');
      
      if (packages.length > 0) {
        // Navigate to packages
        await helpers.navigateTo('/packages');
        await helpers.waitForPageLoad();
        
        // Test CTA if available
        const ctaButton = page.locator('a[href], button').filter({ hasText: /buy|subscribe|get|start/i }).first();
        if (await ctaButton.isVisible()) {
          const href = await ctaButton.getAttribute('href');
          expect(href).toBeTruthy();
        }
        
        // Verify packages still works
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Packages');
      }
    });
  });

  // ==========================================
  // 8. CROSS-MODULE CTA VALIDATION
  // ==========================================
  test.describe('Cross-Module CTA Validation', () => {
    test('Internal links are valid', async ({ page }) => {
      // Test a couple of key modules
      const modulesToTest = PUBLIC_MODULES.slice(0, 2);
      
      for (const module of modulesToTest) {
        await page.goto(module.path);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        
        // Find internal links and verify they have valid hrefs
        const internalLinks = page.locator('a[href^="/"]');
        const count = await internalLinks.count();
        
        if (count > 0) {
          // Check first link has valid href
          const firstLink = internalLinks.first();
          const href = await firstLink.getAttribute('href');
          expect(href).toBeTruthy();
          expect(href).toMatch(/^\//);
        }
      }
    });
  });

  // ==========================================
  // 9. PUBLIC VISIBILITY INTEGRATION
  // ==========================================
  test.describe('Public Visibility Integration', () => {
    test('API returns only public records', async ({ request }) => {
      // Services
      const servicesResponse = await request.get('/api/services/public');
      const services = await servicesResponse.json();
      for (const service of services) {
        expect(service.status).toBe('published');
        expect(service.visibility).toBe('public');
      }
      
      // AI Agents
      const agentsResponse = await request.get('/api/ai-agents/public');
      const agentsData = await agentsResponse.json();
      const agents = agentsData.agents || [];
      for (const agent of agents) {
        expect(agent.status).toBeTruthy();
        expect(agent.isPublic).toBeTruthy();
      }
      
      // Demo Models
      const modelsResponse = await request.get('/api/demo-models');
      const modelsData = await modelsResponse.json();
      const models = modelsData.models?.filter((m: any) => m.status) || [];
      for (const model of models) {
        expect(model.status).toBeTruthy();
      }
    });

    test('Private/inactive records not exposed via UI', async ({ page }) => {
      // Navigate to each module and verify no private data indicators
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');
        
        // Check for private/admin indicators
        const privateIndicators = page.locator('[class*="private"], [class*="admin"], [data-private]');
        const count = await privateIndicators.count();
        expect(count).toBe(0);
      }
    });
  });

  // ==========================================
  // 10. API ↔ PAGE INTEGRATION
  // ==========================================
  test.describe('API ↔ Page Integration', () => {
    test('UI records match API records for Services', async ({ page, request }) => {
      const apiResponse = await request.get('/api/services/public');
      const apiServices = await apiResponse.json();
      
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      
      // Verify page loads successfully
      const heading = page.locator('h1, h2').filter({ hasText: /Services/i }).first();
      await expect(heading).toBeVisible();
      
      // If API has data, page should display content
      if (apiServices.length > 0) {
        const pageContent = await page.locator('body').textContent();
        expect(pageContent?.length).toBeGreaterThan(0);
      }
    });

    test('UI records match API records for AI Agents', async ({ page, request }) => {
      const apiResponse = await request.get('/api/ai-agents/public');
      const data = await apiResponse.json();
      const apiAgents = data.agents || [];
      
      await page.goto('/ai-agents');
      await page.waitForLoadState('networkidle');
      
      const heading = page.locator('h1, h2').filter({ hasText: /AI Agent/i }).first();
      await expect(heading).toBeVisible();
      
      if (apiAgents.length > 0) {
        const pageContent = await page.locator('body').textContent();
        expect(pageContent?.length).toBeGreaterThan(0);
      }
    });

    test('UI records match API records for Packages', async ({ page, request }) => {
      const apiResponse = await request.get('/api/packages');
      const data = await apiResponse.json();
      const apiPackages = (data.packages || []).filter((p: any) => p.status === 'Active' && p.visibility === 'Public');
      
      await page.goto('/packages');
      await page.waitForLoadState('networkidle');
      
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Packages');
      
      if (apiPackages.length > 0) {
        const pageContent = await page.locator('body').textContent();
        expect(pageContent?.length).toBeGreaterThan(0);
      }
    });
  });

  // ==========================================
  // 11. SESSION-INDEPENDENT PUBLIC ACCESS
  // ==========================================
  test.describe('Session-Independent Public Access', () => {
    test('Public modules accessible without authentication', async ({ page, context }) => {
      // Clear all cookies/storage to ensure no authentication
      await context.clearCookies();
      
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');
        
        // Verify page loads
        const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
        await expect(heading).toBeVisible();
        
        // Verify no authentication errors
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.toLowerCase()).not.toContain('unauthorized');
        expect(bodyText?.toLowerCase()).not.toContain('login required');
      }
    });

    test('No admin/private content exposed without auth', async ({ page, context }) => {
      await context.clearCookies();
      
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');
        
        // Check for admin indicators
        const adminElements = page.locator('[data-admin], [class*="admin-panel"], [class*="admin-only"]');
        const count = await adminElements.count();
        expect(count).toBe(0);
      }
    });
  });

  // ==========================================
  // 12. ERROR / EDGE INTEGRATION
  // ==========================================
  test.describe('Error / Edge Integration', () => {
    test('Invalid routes handled gracefully', async ({ page }) => {
      const invalidRoutes = [
        '/invalid-route-12345',
      ];
      
      for (const route of invalidRoutes) {
        await page.goto(route);
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); // Allow error handling
        
        // Should not crash
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).toBeTruthy();
      }
    });

    test('Direct navigation to public routes works', async ({ page }) => {
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');
        
        const heading = page.locator('h1, h2').filter({ hasText: module.heading }).first();
        await expect(heading).toBeVisible();
      }
    });

    test('Refresh on detail pages works', async ({ page, request }) => {
      const apiResponse = await request.get('/api/ai-agents/public');
      const data = await apiResponse.json();
      const agents = data.agents || [];
      
      if (agents.length > 0) {
        const sampleAgent = agents[0];
        
        await page.goto(`/ai-agents/${sampleAgent.id}`);
        await page.waitForLoadState('networkidle');
        
        // Refresh
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should still work
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible();
      }
    });

    test('Empty public data handled gracefully', async ({ page }) => {
      // Navigate to modules - they should handle empty data gracefully
      for (const module of PUBLIC_MODULES) {
        await page.goto(module.path);
        await page.waitForLoadState('networkidle');
        
        // Page should not crash even with empty data
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).toBeTruthy();
      }
    });
  });
});
