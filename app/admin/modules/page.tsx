'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, AlertCircle, CheckCircle, Layers, Briefcase, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleState {
  key: string
  name: string
  category: string
  parent: string | null
  adminEnabled: boolean
  publicEnabled: boolean
  status: string
}

interface ModuleStates {
  [key: string]: ModuleState
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<ModuleStates>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['main']))

  const fetchModules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/modules')
      const data = await res.json()
      setModules(data.modules || {})
    } catch (err) {
      console.error('Error fetching modules:', err)
      setError('Failed to load modules')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const handleToggle = (key: string, field: 'adminEnabled' | 'publicEnabled') => {
    setModules(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: !prev[key][field]
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules }),
      })

      if (!res.ok) {
        throw new Error('Failed to save module states')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving modules:', err)
      setError('Failed to save module states')
    } finally {
      setSaving(false)
    }
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Group modules by category
  const groupedModules = Object.values(modules).reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleState[]>)

  // Sort categories: main first, then career-builder
  const sortedCategories = Object.keys(groupedModules).sort((a, b) => {
    if (a === 'main') return -1
    if (b === 'main') return 1
    return a.localeCompare(b)
  })

  // Check if parent is disabled
  const isParentDisabled = (module: ModuleState) => {
    if (!module.parent) return false
    const parent = modules[module.parent]
    return parent ? (!parent.adminEnabled || !parent.publicEnabled) : false
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Module Management</h1>
          <p className="text-gray-400 text-sm mt-1">Enable or disable application modules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="phoenix-button"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-green-400 text-sm">Module states saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Module Groups */}
      {sortedCategories.map(category => (
        <div key={category} className="glass-card rounded-[20px] overflow-hidden">
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(category)}
            className="w-full flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                {category === 'main' ? (
                  <Layers className="w-5 h-5 text-[#FF6A00]" />
                ) : (
                  <Briefcase className="w-5 h-5 text-[#FF6A00]" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white capitalize">
                  {category === 'main' ? 'Main Modules' : 'Career Builder Modules'}
                </h2>
                <p className="text-xs text-gray-500">
                  {groupedModules[category].length} module{groupedModules[category].length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {expandedCategories.has(category) ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {/* Module List */}
          {expandedCategories.has(category) && (
            <div className="divide-y divide-white/5">
              {groupedModules[category].map(module => {
                const parentDisabled = isParentDisabled(module)
                return (
                  <div
                    key={module.key}
                    className={cn(
                      "p-5 transition-colors",
                      parentDisabled ? "bg-white/[0.02] opacity-60" : "hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{module.name}</h3>
                          {module.parent && (
                            <span className="px-2 py-0.5 rounded-md bg-[#FF6A00]/10 text-[#FF6A00] text-xs">
                              Sub-module
                            </span>
                          )}
                        </div>
                        {parentDisabled && (
                          <p className="text-xs text-gray-500 mt-1">
                            Parent module ({modules[module.parent!]?.name}) is disabled
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Admin Toggle */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">Admin</span>
                          <button
                            onClick={() => handleToggle(module.key, 'adminEnabled')}
                            disabled={parentDisabled}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-colors duration-300",
                              module.adminEnabled && !parentDisabled
                                ? "bg-[#FF6A00]"
                                : "bg-gray-700"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
                                module.adminEnabled && !parentDisabled ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>

                        {/* Public Toggle */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">Public</span>
                          <button
                            onClick={() => handleToggle(module.key, 'publicEnabled')}
                            disabled={parentDisabled}
                            className={cn(
                              "relative w-12 h-6 rounded-full transition-colors duration-300",
                              module.publicEnabled && !parentDisabled
                                ? "bg-[#FF6A00]"
                                : "bg-gray-700"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300",
                                module.publicEnabled && !parentDisabled ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div className="glass-card rounded-[20px] p-5">
        <h3 className="font-semibold text-white mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-6 rounded-full bg-[#FF6A00] relative">
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
            </div>
            <span className="text-gray-400">Enabled - Module is active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-6 rounded-full bg-gray-700 relative">
              <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
            </div>
            <span className="text-gray-400">Disabled - Module is inactive</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <strong>Admin:</strong> Controls visibility in admin panel. <strong>Public:</strong> Controls visibility on public website.
        </p>
      </div>
    </div>
  )
}
