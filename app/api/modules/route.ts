import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Module definitions with hierarchy
interface ModuleDefinition {
  name: string
  category: string
  parent?: string | null
}

const MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  // Main modules
  services: { name: 'Services', category: 'main' },
  'ai-agents': { name: 'AI Agents', category: 'main' },
  packages: { name: 'Packages', category: 'main' },
  'career-builder': { name: 'Career Builder', category: 'main', parent: null },
  projects: { name: 'Projects', category: 'main' },
  leads: { name: 'Leads', category: 'main' },
  'demo-models': { name: 'Demo Models', category: 'main' },
  'core-systems': { name: 'Core Systems', category: 'main' },
  portfolio: { name: 'Portfolio', category: 'main' },
  testimonials: { name: 'Testimonials', category: 'main' },
  
  // Career Builder child modules
  'resume-templates': { name: 'Resume Templates', category: 'career-builder', parent: 'career-builder' },
  'resume-services': { name: 'Resume Services', category: 'career-builder', parent: 'career-builder' },
  'portfolio-templates': { name: 'Portfolio Templates', category: 'career-builder', parent: 'career-builder' },
  'portfolio-services': { name: 'Portfolio Services', category: 'career-builder', parent: 'career-builder' },
  'cover-letter-templates': { name: 'Cover Letter Templates', category: 'career-builder', parent: 'career-builder' },
  'cover-letter-services': { name: 'Cover Letter Services', category: 'career-builder', parent: 'career-builder' },
  'ats-analysis': { name: 'ATS Analysis', category: 'career-builder', parent: 'career-builder' },
  'ai-generator': { name: 'AI Generator', category: 'career-builder', parent: 'career-builder' },
  'career-orders': { name: 'Orders', category: 'career-builder', parent: 'career-builder' },
  'career-analytics': { name: 'Analytics', category: 'career-builder', parent: 'career-builder' },
  'export-center': { name: 'Export Center', category: 'career-builder', parent: 'career-builder' },
}


// Initialize module settings if they don't exist
async function initializeModuleSettings() {
  const modules = await prisma.setting.findMany({
    where: { type: 'module' }
  })

  const existingKeys = new Set(modules.map(m => m.key))
  
  const initPromises = Object.entries(MODULE_DEFINITIONS).map(([key, def]) => {
    if (!existingKeys.has(key)) {
      return prisma.setting.create({
        data: {
          key,
          value: def.name,
          type: 'module',
          adminEnabled: true,
          publicEnabled: true,
          status: 'enabled'
        }
      })
    }
    return Promise.resolve(null)
  })

  await Promise.all(initPromises)
}

// Get all module states
async function getModuleStates() {
  await initializeModuleSettings()
  
  const modules = await prisma.setting.findMany({
    where: { type: 'module' },
    orderBy: { key: 'asc' }
  })

  const moduleStates: Record<string, any> = {}
  
  modules.forEach(module => {
    const def = MODULE_DEFINITIONS[module.key]
    if (def) {
      moduleStates[module.key] = {
        key: module.key,
        name: def.name,
        category: def.category,
        parent: def.parent || null,
        adminEnabled: module.adminEnabled ?? true,
        publicEnabled: module.publicEnabled ?? true,
        status: module.status ?? 'enabled'
      }
    }
  })

  return moduleStates
}

// Update module state
async function updateModuleState(key: string, updates: { adminEnabled?: boolean; publicEnabled?: boolean; status?: string }) {
  const module = await prisma.setting.upsert({
    where: { key },
    update: {
      ...updates,
      updatedAt: new Date()
    },
    create: {
      key,
      value: MODULE_DEFINITIONS[key]?.name || key,
      type: 'module',
      adminEnabled: updates.adminEnabled ?? true,
      publicEnabled: updates.publicEnabled ?? true,
      status: updates.status ?? 'enabled'
    }
  })

  return module
}

// GET - Fetch all module states
export async function GET() {
  try {
    const moduleStates = await getModuleStates()
    return NextResponse.json({ modules: moduleStates })
  } catch (error) {
    console.error('Error fetching module states:', error)
    return NextResponse.json({ error: 'Failed to fetch module states' }, { status: 500 })
  }
}

// POST - Update module states
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle single module update from frontend toggle
    if (body.moduleKey && body.updates) {
      const { moduleKey, updates } = body
      
      if (!MODULE_DEFINITIONS[moduleKey]) {
        return NextResponse.json({ error: 'Invalid module key' }, { status: 400 })
      }

      await updateModuleState(moduleKey, {
        adminEnabled: updates.adminEnabled,
        publicEnabled: updates.publicEnabled,
        status: updates.status
      })

      const updatedStates = await getModuleStates()
      return NextResponse.json({ modules: updatedStates })
    }
    
    // Handle bulk updates from modules page
    const { modules } = body
    if (!modules || typeof modules !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updatePromises = Object.entries(modules).map(([key, updates]: [string, any]) => {
      if (MODULE_DEFINITIONS[key]) {
        return updateModuleState(key, {
          adminEnabled: updates.adminEnabled,
          publicEnabled: updates.publicEnabled,
          status: updates.status
        })
      }
      return Promise.resolve(null)
    })

    await Promise.all(updatePromises)

    const updatedStates = await getModuleStates()
    return NextResponse.json({ modules: updatedStates })
  } catch (error) {
    console.error('Error updating module states:', error)
    return NextResponse.json({ error: 'Failed to update module states', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
