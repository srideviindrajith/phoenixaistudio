import { test, expect } from '@playwright/test';

test.describe('Public Website Modules QA Validation', () => {

  // ==========================================
  // PUBLIC MODULE: Services
  // STATUS: TESTING
  // ==========================================
  test('Services Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: Services');

    // 1. Page Load
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /Services/i }).first();
    await expect(heading).toBeVisible();

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/services/public');
    expect(apiResponse.ok()).toBeTruthy();
    const services = await apiResponse.json();
    expect(Array.isArray(services)).toBeTruthy();
    console.log('Public services retrieved from API:', services.length);

    // 3. Published vs Unpublished Verification
    for (const service of services) {
      expect(service.status).toBe('published');
      expect(service.visibility).toBe('public');
    }

    // 4. Content & CTA Verification
    if (services.length > 0) {
      const firstService = services[0];
      const serviceTitle = page.locator('h3').filter({ hasText: firstService.name }).first();
      await expect(serviceTitle).toBeVisible();
    }

    console.log('// PUBLIC MODULE: Services');
    console.log('// STATUS: PASS');
  });

  // ==========================================
  // PUBLIC MODULE: AI Agents
  // STATUS: TESTING
  // ==========================================
  test('AI Agents Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: AI Agents');

    // 1. Page Load
    await page.goto('/ai-agents');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /AI Agent/i }).first();
    await expect(heading).toBeVisible();

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/ai-agents/public');
    expect(apiResponse.ok()).toBeTruthy();
    const agents = await apiResponse.json();
    expect(Array.isArray(agents)).toBeTruthy();
    console.log('Public AI Agents retrieved from API:', agents.length);

    // 3. Visibility Verification
    for (const agent of agents) {
      expect(agent.status).toBeTruthy();
      expect(agent.isPublic).toBeTruthy();
    }

    // 4. Detail Page Verification (if agents exist)
    if (agents.length > 0) {
      const sampleAgent = agents[0];
      console.log('Testing detail page for AI Agent:', sampleAgent.id);

      await page.goto(`/ai-agents/${sampleAgent.id}`);
      await page.waitForLoadState('networkidle');

      const detailHeading = page.locator('h1').first();
      await expect(detailHeading).toBeVisible();
      const detailText = await detailHeading.textContent();
      expect(detailText?.toLowerCase()).toContain(sampleAgent.name.toLowerCase());
    }

    console.log('// PUBLIC MODULE: AI Agents');
    console.log('// STATUS: PASS');
  });

  // ==========================================
  // PUBLIC MODULE: Demo Models
  // STATUS: TESTING
  // ==========================================
  test('Demo Models Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: Demo Models');

    // 1. Page Load
    await page.goto('/demo-models');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /Demo Model/i }).first();
    await expect(heading).toBeVisible();

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/demo-models/public');
    expect(apiResponse.ok()).toBeTruthy();
    const models = await apiResponse.json();
    expect(Array.isArray(models)).toBeTruthy();
    console.log('Public Demo Models retrieved from API:', models.length);

    // 3. Status Verification
    for (const item of models) {
      expect(item.status).toBeTruthy();
    }

    // 4. Cards Display Verification
    if (models.length > 0) {
      const sampleModel = models[0];
      const modelTitle = page.locator('h3').filter({ hasText: sampleModel.title }).first();
      await expect(modelTitle).toBeVisible();
    }

    console.log('// PUBLIC MODULE: Demo Models');
    console.log('// STATUS: PASS');
  });

  // ==========================================
  // PUBLIC MODULE: Core Systems
  // STATUS: TESTING
  // ==========================================
  test('Core Systems Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: Core Systems');

    // 1. Page Load
    await page.goto('/core-systems');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /Core System/i }).first();
    await expect(heading).toBeVisible();

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/core-systems/public');
    expect(apiResponse.ok()).toBeTruthy();
    const systems = await apiResponse.json();
    expect(Array.isArray(systems)).toBeTruthy();
    console.log('Public Core Systems retrieved from API:', systems.length);

    // 3. Status & Detail Page Verification
    if (systems.length > 0) {
      const sampleSystem = systems[0];
      const slug = sampleSystem.slug || sampleSystem.id;
      console.log('Testing detail page for Core System:', slug);

      await page.goto(`/core-systems/${slug}`);
      await page.waitForLoadState('networkidle');

      const detailHeading = page.locator('h1').first();
      await expect(detailHeading).toBeVisible();
    }

    console.log('// PUBLIC MODULE: Core Systems');
    console.log('// STATUS: PASS');
  });

  // ==========================================
  // PUBLIC MODULE: Portfolio
  // STATUS: TESTING
  // ==========================================
  test('Portfolio Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: Portfolio');

    // 1. Page Load
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1, h2').filter({ hasText: /Portfolio|Project/i }).first();
    await expect(heading).toBeVisible();

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/projects/public');
    expect(apiResponse.ok()).toBeTruthy();
    const projects = await apiResponse.json();
    expect(Array.isArray(projects)).toBeTruthy();
    console.log('Public Projects retrieved from API:', projects.length);

    // 3. Project Cards Render Verification
    if (projects.length > 0) {
      const sampleProject = projects[0];
      const projectTitle = page.locator('h3').filter({ hasText: sampleProject.title }).first();
      await expect(projectTitle).toBeVisible();
    }

    console.log('// PUBLIC MODULE: Portfolio');
    console.log('// STATUS: PASS');
  });

  // ==========================================
  // PUBLIC MODULE: Packages
  // STATUS: TESTING
  // ==========================================
  test('Packages Module Public Validation', async ({ page, request }) => {
    console.log('Testing Public Module: Packages');

    // 1. Page Load
    await page.goto('/packages');
    await page.waitForLoadState('networkidle');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Packages');

    // 2. DB / API Data Source
    const apiResponse = await page.request.get('/api/packages');
    expect(apiResponse.ok()).toBeTruthy();
    const data = await apiResponse.json();
    expect(Array.isArray(data.packages)).toBeTruthy();

    const activePublic = (data.packages || []).filter(
      (p: any) => p.status === 'Active' && p.visibility === 'Public'
    );
    console.log('Active Public Packages in DB:', activePublic.length);

    // 3. Card & CTA Verification
    if (activePublic.length > 0) {
      const samplePkg = activePublic[0];
      const categoryParam = samplePkg.category || 'Client Solution';

      await page.goto(`/packages?category=${encodeURIComponent(categoryParam)}`);
      await page.waitForLoadState('networkidle');

      const pkgHeading = page.locator('h3').filter({ hasText: samplePkg.name }).first();
      await expect(pkgHeading).toBeVisible();
    }

    console.log('// PUBLIC MODULE: Packages');
    console.log('// STATUS: PASS');
  });
});
