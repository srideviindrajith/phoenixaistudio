'use client'

import { useState } from 'react'
import { Layers, Sparkles, ExternalLink, FileText, Terminal, Info, X, Cpu, Server, Receipt, BarChart3, Database, type LucideIcon } from 'lucide-react'

interface SystemItem {
  id: string
  name: string
  description: string
  category: string
  image: string | null
  slug: string | null
  launchUrl: string | null
  devUrl: string | null
  prodUrl: string | null
  version: string | null
  environment: string | null
  icon: string | null
  banner: string | null
  status: boolean
  createdAt: Date
  updatedAt: Date
}

interface CoreSystemsGridProps {
  systems: SystemItem[]
  categoriesList: string[]
  categoryIcons: Record<string, string>
  categoryColors: Record<string, string>
}

const iconMap: Record<string, LucideIcon> = {
  Cpu,
  Server,
  Receipt,
  Database,
  BarChart3,
  Layers,
}

export function CoreSystemsGrid({
  systems,
  categoriesList,
  categoryIcons,
  categoryColors,
}: CoreSystemsGridProps) {
  const [selectedSystem, setSelectedSystem] = useState<SystemItem | null>(null)

  return (
    <div className="space-y-16">
      {categoriesList.map((cat, index) => {
        const catSystems = systems.filter((s) => s.category === cat)
        const Icon = iconMap[categoryIcons[cat] || 'Layers'] || Layers
        const color = categoryColors[cat] || '#FF6A00'
        const isEven = index % 2 === 0

        return (
          <div
            key={cat}
            className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${
              isEven ? '' : 'lg:flex-row-reverse'
            }`}
          >
            {/* Left: Graphic representation */}
            <div className="w-full lg:w-1/2">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-[20px] bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] opacity-20 blur-md transition duration-1000 group-hover:opacity-30" />
                <div className="glass-card relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[20px] p-8">
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6A00]/5 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}05)`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color }} />
                    </div>
                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                      Module 0{index + 1}
                    </span>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
                      {cat} Orchestration
                    </h2>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      Automate workflow logic, customer data updates, subscription billing routines, or analytics reporting logs without coding complex edge cases.
                    </p>
                  </div>

                  {/* Mock code block inside card */}
                  <div className="mt-6 bg-zinc-950/80 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-gray-500">
                    <span className="text-[#FF6A00]">const</span> system = PhoenixAI.<span className="text-blue-400">loadModule</span>(<span className="text-green-400">&quot;{cat.toLowerCase()}&quot;</span>);<br />
                    await system.<span className="text-blue-400">runSync</span>();
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Items list */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                <span>Dynamic Deployments</span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight">Active {cat} Packages</h3>

              <div className="space-y-4">
                {catSystems.length > 0 ? (
                  catSystems.map((sys) => (
                    <div
                      key={sys.id}
                      className="phoenix-card flex flex-col p-6 border border-white/5 bg-zinc-950/30 backdrop-blur-md rounded-[20px]"
                    >
                      <div className="flex gap-4 items-start">
                        {sys.image ? (
                          <img
                            src={sys.image}
                            alt={sys.name}
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border border-white/10 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                            <Layers className="w-6 h-6 text-[#FF6A00]/60" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-lg font-bold text-white truncate">{sys.name}</h4>
                            
                            {/* Status Indicator */}
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              Active
                            </span>
                          </div>

                          {/* Version & Environment details */}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                            <span className="bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 font-mono text-[10px]">
                              {sys.version || 'v1.0.0'}
                            </span>
                            <span className="uppercase tracking-wider text-[10px] font-semibold text-zinc-500">
                              {sys.environment || 'Production'}
                            </span>
                          </div>

                          <p className="text-gray-400 text-sm mt-3 line-clamp-2">{sys.description}</p>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/5 items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {sys.launchUrl && (
                            <a
                              href={sys.launchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF6A00]/10 text-[#FF8A33] border border-[#FF6A00]/20 hover:bg-[#FF6A00]/20 transition-all animate-in fade-in"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Launch
                            </a>
                          )}
                          {sys.devUrl && (
                            <a
                              href={sys.devUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-gray-300 border border-white/5 hover:bg-zinc-700 transition-all animate-in fade-in"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Documentation
                            </a>
                          )}
                          {sys.prodUrl && (
                            <a
                              href={sys.prodUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-gray-300 border border-white/5 hover:bg-zinc-700 transition-all animate-in fade-in"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              API
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedSystem(sys)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                          <Info className="w-3.5 h-3.5 text-[#FF6A00]" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 text-center">
                    <span className="text-sm text-gray-500">No custom {cat} modules configured yet.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Details Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-300">
          <div
            className="relative w-full max-w-[650px] bg-[#0C0C0D] border border-white/10 rounded-[24px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner Image */}
            {selectedSystem.banner ? (
              <div className="relative w-full h-40 overflow-hidden bg-zinc-950 border-b border-white/5">
                <img
                  src={selectedSystem.banner}
                  alt={`${selectedSystem.name} banner`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0D] to-transparent" />
              </div>
            ) : (
              <div className="w-full h-24 bg-gradient-to-r from-[#FF6A00]/10 to-[#CC4F00]/5 border-b border-white/5" />
            )}

            {/* Header close button */}
            <button
              onClick={() => setSelectedSystem(null)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full border border-white/10 bg-black/50 text-gray-400 hover:text-white hover:border-white/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="flex gap-4 items-start">
                {selectedSystem.image ? (
                  <img
                    src={selectedSystem.image}
                    alt={selectedSystem.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-white/10 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                    <Layers className="w-8 h-8 text-[#FF6A00]" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-[#FF6A00] tracking-wider">
                      {selectedSystem.category} Module
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Active Status
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1 leading-tight">{selectedSystem.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-zinc-400">
                    <span className="bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 font-mono text-[10px]">
                      {selectedSystem.version || 'v1.0.0'}
                    </span>
                    <span className="uppercase tracking-wider text-[10px] font-semibold text-zinc-500">
                      {selectedSystem.environment || 'Production'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Description</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedSystem.description}</p>
              </div>

              {/* Connection URLs */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">Access Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedSystem.launchUrl ? (
                    <a
                      href={selectedSystem.launchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-[#FF6A00]/25 bg-[#FF6A00]/5 text-[#FF8A33] hover:bg-[#FF6A00]/10 transition-all text-xs font-semibold"
                    >
                      <span>Launch Endpoint</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-white/5 bg-zinc-950/20 text-zinc-600 text-xs text-center cursor-not-allowed">
                      No Launch URL
                    </div>
                  )}

                  {selectedSystem.devUrl ? (
                    <a
                      href={selectedSystem.devUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all text-xs font-semibold"
                    >
                      <span>Documentation</span>
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-white/5 bg-zinc-950/20 text-zinc-600 text-xs text-center cursor-not-allowed">
                      No Docs URL
                    </div>
                  )}

                  {selectedSystem.prodUrl ? (
                    <a
                      href={selectedSystem.prodUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 transition-all text-xs font-semibold"
                    >
                      <span>API Console</span>
                      <Terminal className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-white/5 bg-zinc-950/20 text-zinc-600 text-xs text-center cursor-not-allowed">
                      No API URL
                    </div>
                  )}
                </div>
              </div>

              {/* Close footer */}
              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSystem(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
