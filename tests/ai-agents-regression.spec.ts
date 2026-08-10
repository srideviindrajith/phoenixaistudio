import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('AI Agents Regression Tests - URL and Image Field Persistence', () => {
  test('Direct API test: Create agent with metadata, verify persistence', async ({ request }) => {
    const timestamp = Date.now();
    
    // Create metadata with all URL fields
    const metadata = {
      slug: `test-agent-${timestamp}`,
      agentType: 'Chatbot',
      version: '1.0.0',
      environment: 'Production',
      currency: 'INR',
      launchUrl: 'https://example.com/launch',
      liveDemoUrl: 'https://example.com/demo',
      docUrl: 'https://example.com/docs',
      githubUrl: 'https://github.com/example/repo',
      apiEndpoint: 'https://api.example.com/v1',
      supportedModels: ['GPT-5.5'],
      deploymentType: 'Cloud',
      bannerImage: 'https://example.com/banner.jpg',
      previewImage: 'https://example.com/preview.jpg',
      tags: ['AI', 'Test'],
    };
    
    const featuresWithMetadata = `Feature 1\nFeature 2\nFeature 3\n\n[METADATA]\n${JSON.stringify(metadata)}`;
    
    // Create agent via API
    const createResponse = await request.post(`${BASE_URL}/api/ai-agents`, {
      data: {
        name: `Test Agent ${timestamp}`,
        description: 'Test agent for URL persistence',
        longDescription: 'Long description',
        image: 'https://example.com/logo.jpg',
        price: 100,
        features: featuresWithMetadata,
        category: 'Sales & Lead Generation',
        agentType: 'Sales Agent',
        tags: 'AI, Test',
        status: true,
        isPublic: false,
        packageId: null,
        aiInstructions: '',
        businessKnowledge: '',
        systemPrompt: '',
      },
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    expect(createData.agent).toBeDefined();
    expect(createData.agent.id).toBeDefined();
    
    const agentId = createData.agent.id;
    
    console.log('✓ Agent created successfully with ID:', agentId);
    
    // Fetch the agent via GET API
    const getResponse = await request.get(`${BASE_URL}/api/ai-agents/${agentId}`);
    expect(getResponse.ok()).toBeTruthy();
    
    const getData = await getResponse.json();
    expect(getData.agent).toBeDefined();
    expect(getData.agent.features).toContain('[METADATA]');
    
    // Parse and verify metadata
    const parts = getData.agent.features.split('\n\n[METADATA]\n');
    expect(parts.length).toBeGreaterThan(1);
    
    const retrievedMetadata = JSON.parse(parts[1]);
    expect(retrievedMetadata.launchUrl).toBe('https://example.com/launch');
    expect(retrievedMetadata.liveDemoUrl).toBe('https://example.com/demo');
    expect(retrievedMetadata.docUrl).toBe('https://example.com/docs');
    expect(retrievedMetadata.githubUrl).toBe('https://github.com/example/repo');
    expect(retrievedMetadata.apiEndpoint).toBe('https://api.example.com/v1');
    expect(retrievedMetadata.bannerImage).toBe('https://example.com/banner.jpg');
    expect(retrievedMetadata.previewImage).toBe('https://example.com/preview.jpg');
    
    console.log('✓ All URL and image fields persisted correctly in database');
    
    // Update the agent with new values
    const updatedMetadata = {
      ...metadata,
      launchUrl: 'https://updated.example.com/launch',
      liveDemoUrl: 'https://updated.example.com/demo',
    };
    
    const updatedFeatures = `Updated Feature 1\nUpdated Feature 2\n\n[METADATA]\n${JSON.stringify(updatedMetadata)}`;
    
    const updateResponse = await request.put(`${BASE_URL}/api/ai-agents/${agentId}`, {
      data: {
        name: getData.agent.name,
        description: getData.agent.description,
        longDescription: getData.agent.longDescription,
        image: getData.agent.image,
        price: getData.agent.price,
        features: updatedFeatures,
        category: getData.agent.category,
        agentType: getData.agent.agentType,
        tags: getData.agent.tags,
        status: getData.agent.status,
        isPublic: getData.agent.isPublic,
        packageId: getData.agent.packageId,
        aiInstructions: getData.agent.aiInstructions,
        businessKnowledge: getData.agent.businessKnowledge,
        systemPrompt: getData.agent.systemPrompt,
      },
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    
    // Fetch again to verify update
    const getAfterUpdateResponse = await request.get(`${BASE_URL}/api/ai-agents/${agentId}`);
    const getAfterUpdateData = await getAfterUpdateResponse.json();
    
    const updatedParts = getAfterUpdateData.agent.features.split('\n\n[METADATA]\n');
    const updatedRetrievedMetadata = JSON.parse(updatedParts[1]);
    
    expect(updatedRetrievedMetadata.launchUrl).toBe('https://updated.example.com/launch');
    expect(updatedRetrievedMetadata.liveDemoUrl).toBe('https://updated.example.com/demo');
    
    console.log('✓ URL fields persist correctly after update');
    
    // Cleanup
    await request.delete(`${BASE_URL}/api/ai-agents/${agentId}`);
    console.log('✓ Test agent deleted');
  });

  test('Verify GET API returns all agents with metadata', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/ai-agents`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.agents).toBeDefined();
    expect(Array.isArray(data.agents)).toBeTruthy();
    
    console.log(`✓ GET API returns ${data.agents.length} agents`);
    
    // Check if any agents have metadata
    const agentsWithMetadata = data.agents.filter((a: any) => a.features.includes('[METADATA]'));
    console.log(`✓ ${agentsWithMetadata.length} agents have metadata`);
  });

});
