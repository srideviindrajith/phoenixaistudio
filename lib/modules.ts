import { prisma } from './prisma'

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

interface ModuleState {
  key: string
  name: string
  category: string
  parent: string | null
  adminEnabled: boolean
  publicEnabled: boolean
  status: string
}

// Get module states from database
export async function getModuleStates(): Promise<Record<string, ModuleState>> {
  try {
    const modules = await prisma.setting.findMany({
      where: { type: 'module' },
      orderBy: { key: 'asc' }
    })

    const moduleStates: Record<string, ModuleState> = {}
    
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

    // Initialize missing modules with default enabled state
    Object.entries(MODULE_DEFINITIONS).forEach(([key, def]) => {
      if (!moduleStates[key]) {
        moduleStates[key] = {
          key,
          name: def.name,
          category: def.category,
          parent: def.parent || null,
          adminEnabled: true,
          publicEnabled: true,
          status: 'enabled'
        }
      }
    })

    return moduleStates
  } catch (error) {
    console.error('Error fetching module states:', error)
    // Return default enabled states on error
    const defaultStates: Record<string, ModuleState> = {}
    Object.entries(MODULE_DEFINITIONS).forEach(([key, def]) => {
      defaultStates[key] = {
        key,
        name: def.name,
        category: def.category,
        parent: def.parent || null,
        adminEnabled: true,
        publicEnabled: true,
        status: 'enabled'
      }
    })
    return defaultStates
  }
}

// Check if a module is publicly visible (respects parent hierarchy)
export function isModulePubliclyEnabled(moduleKey: string, moduleStates: Record<string, ModuleState>): boolean {
  const module = moduleStates[moduleKey]
  
  if (!module) {
    return true // Default to enabled if module not found
  }

  // Check if module itself is publicly enabled
  if (!module.publicEnabled) {
    return false
  }

  // Check parent hierarchy
  if (module.parent) {
    const parent = moduleStates[module.parent]
    if (parent && !parent.publicEnabled) {
      return false
    }
  }

  return true
}

// Check if a module is admin enabled
export function isModuleAdminEnabled(moduleKey: string, moduleStates: Record<string, ModuleState>): boolean {
  const module = moduleStates[moduleKey]
  
  if (!module) {
    return true // Default to enabled if module not found
  }

  return module.adminEnabled ?? true
}

// Get all publicly enabled navigation links
export function getPublicNavLinks(moduleStates: Record<string, ModuleState>) {
  const navLinks = [
    { href: '/', label: 'Home', module: null },
    { href: '/services', label: 'Services', module: 'services' },
    { href: '/ai-agents', label: 'AI Agents', module: 'ai-agents' },
    { href: '/demo-models', label: 'Demo Models', module: 'demo-models' },
    { href: '/core-systems', label: 'Core Systems', module: 'core-systems' },
    { href: '/portfolio', label: 'Portfolio', module: 'portfolio' },
    { href: '/packages', label: 'Packages', module: 'packages' },
    { href: '/career-builder', label: 'Career Builder', module: 'career-builder' },
  ]

  return navLinks.filter(link => {
    if (!link.module) return true
    return isModulePubliclyEnabled(link.module, moduleStates)
  })
}
