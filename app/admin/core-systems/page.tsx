'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Upload, ChevronLeft, ChevronRight, Layers, Image, ToggleLeft, ToggleRight, Settings, FileText, Hash, AlignLeft, Link, ExternalLink, Tag, Server, FileImage, Loader2 } from 'lucide-react'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface SystemItem {
  id: string
  name: string
  slug: string
  description: string
  image: string | null
  category: string
  launchUrl?: string
  devUrl?: string
  prodUrl?: string
  version?: string
  environment?: string
  icon?: string
  banner?: string
  status: boolean
  createdAt: string
}

const ITEMS_PER_PAGE = 6
const CATEGORIES = ['CRM', 'ERP', 'Billing', 'Automation', 'Analytics']

// URL validation helper
const isValidUrl = (url: string | null | undefined) => {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default function AdminCoreSystemsPage() {
  const [systems, setSystems] = useState<SystemItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingSystem, setEditingSystem] = useState<SystemItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [showModal])

  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchSystems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/core-systems')
      const data = await res.json()
      setSystems(data.systems || [])
    } catch (error) {
      console.error('Error fetching core systems:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSystems()
  }, [fetchSystems])

  const filteredSystems = systems.filter((sys) => {
    const matchesSearch = sys.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sys.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || sys.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredSystems.length / ITEMS_PER_PAGE)
  const paginatedSystems = filteredSystems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/core-systems/${id}`, { method: 'DELETE' })
      setSystems(systems.filter((sys) => sys.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting core system:', error)
    }
  }

  const handleStatusToggle = async (sys: SystemItem) => {
    try {
      const updatedStatus = !sys.status
      const res = await fetch(`/api/core-systems/${sys.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...sys, status: updatedStatus }),
      })
      const data = await res.json()
      setSystems(systems.map((s) => (s.id === sys.id ? data.system : s)))
    } catch (error) {
      console.error('Error toggling core system status:', error)
    }
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      return data.url
    } catch (error) {
      console.error('Error uploading file:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSystem) return
    setSaving(true)

    try {
      const res = await fetch('/api/core-systems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSystem),
      })
      const data = await res.json()
      setSystems([data.system, ...systems])
      setShowModal(false)
      setEditingSystem(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating core system:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSystem) return
    setSaving(true)

    try {
      const res = await fetch(`/api/core-systems/${editingSystem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSystem),
      })
      const data = await res.json()
      setSystems(systems.map((sys) => (sys.id === editingSystem.id ? data.system : sys)))
      setShowModal(false)
      setEditingSystem(null)
    } catch (error) {
      console.error('Error updating core system:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingSystem({
      id: '',
      name: '',
      slug: '',
      description: '',
      image: null,
      banner: '',
      category: CATEGORIES[0],
      launchUrl: '',
      devUrl: '',
      prodUrl: '',
      version: '',
      environment: '',
      status: true,
      createdAt: '',
    })
    setIsCreating(true)
    setShowModal(true)
  }

  const openEditModal = (sys: SystemItem) => {
    setEditingSystem({ ...sys })
    setIsCreating(false)
    setShowModal(true)
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Core Systems</h1>
          <p className="text-gray-400 text-sm mt-1">Manage core software SaaS modules</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add System
        </button>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="core-systems" moduleName="Core Systems" />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search systems..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5 pl-10 pr-4"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
        </div>
      ) : paginatedSystems.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <Layers className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium mb-2">No systems found</p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery ? 'Try a different search' : 'Create your first Core System'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add System
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedSystems.map((sys) => (
            <div
              key={sys.id}
              className={`phoenix-card relative p-6 transition-all duration-300 hover:scale-[1.02] ${sys.status ? 'border-[#FF6A00]/20' : 'border-white/[0.06] opacity-60'
                }`}
            >
              <div className="flex gap-4">
                {sys.image ? (
                  <img
                    src={sys.image}
                    alt={sys.name}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Layers className="w-8 h-8 text-[#FF6A00]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#FF6A00] mb-1">
                    {sys.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white truncate">{sys.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{sys.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500 truncate" title={sys.category}>
                  Core System
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(sys)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={sys.status ? 'Deactivate' : 'Activate'}
                  >
                    {sys.status ? (
                      <ToggleRight className="w-6 h-6 text-[#FF6A00]" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(sys)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sys.id)}
                    disabled={deleteId === sys.id}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, Math.min(totalPages, p + 1)))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Premium Add/Edit Modal */}
      {showModal && editingSystem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
          <div className="relative w-full max-w-[900px] max-h-[90vh] flex flex-col bg-[#0B0B0C] border border-white/10 rounded-[22px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7),0_0_50px_rgba(255,106,0,0.12)] overflow-hidden">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/5 bg-[#0B0B0C]/90 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00]">🚀</span>
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  {isCreating ? 'Add New Core System' : 'Edit Core System'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingSystem(null); }}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={isCreating ? handleCreate : handleUpdate} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-phoenix bg-[#09090A]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Information Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 rounded-[18px] p-6 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Settings className="w-5 h-5 text-[#FF6A00]" />
                    <h4 className="text-base font-semibold text-white">General Information</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
                        System Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. PhoenixCRM Enterprise"
                        value={editingSystem.name}
                        onChange={e => setEditingSystem({ ...editingSystem, name: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">Enter a clear, descriptive name for the core module.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Slug
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. phoenix-crm"
                        value={editingSystem.slug ?? ''}
                        onChange={e => setEditingSystem({ ...editingSystem, slug: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">A unique slug identifier used in internal routing.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <AlignLeft className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Description
                      </label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Next-gen Client Relationship Manager..."
                        value={editingSystem.description}
                        onChange={e => setEditingSystem({ ...editingSystem, description: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all resize-none"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">A concise explanation of features and capabilities.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Category
                      </label>
                      <select
                        value={editingSystem.category}
                        onChange={e => setEditingSystem({ ...editingSystem, category: e.target.value })}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-zinc-950">{cat}</option>
                        ))}
                      </select>
                      <p className="text-[11px] text-zinc-500 mt-1.5">Choose the SaaS module category classification.</p>
                    </div>
                  </div>
                </div>

                {/* Deployment Settings Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 rounded-[18px] p-6 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Link className="w-5 h-5 text-[#FF6A00]" />
                    <h4 className="text-base font-semibold text-white">Deployment Settings</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Launch URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={editingSystem.launchUrl ?? ''}
                        onChange={e => setEditingSystem({ ...editingSystem, launchUrl: e.target.value })}
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all ${
                          !isValidUrl(editingSystem.launchUrl) ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">Public entry point for system users.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Development URL
                      </label>
                      <input
                        type="url"
                        placeholder="http://localhost:3000"
                        value={editingSystem.devUrl ?? ''}
                        onChange={e => setEditingSystem({ ...editingSystem, devUrl: e.target.value })}
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all ${
                          !isValidUrl(editingSystem.devUrl) ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">Local development server address.</p>
                    </div>

                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Production URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://prod.example.com"
                        value={editingSystem.prodUrl ?? ''}
                        onChange={e => setEditingSystem({ ...editingSystem, prodUrl: e.target.value })}
                        className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all ${
                          !isValidUrl(editingSystem.prodUrl) ? 'border-red-500' : 'border-white/10'
                        }`}
                      />
                      <p className="text-[11px] text-zinc-500 mt-1.5">Live production instance URL.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#FF6A00]" />
                          Version
                        </label>
                        <input
                          type="text"
                          placeholder="v1.0.0"
                          value={editingSystem.version ?? ''}
                          onChange={e => setEditingSystem({ ...editingSystem, version: e.target.value })}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all"
                        />
                      </div>
                      <div>
                        <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                          <Server className="w-3.5 h-3.5 text-[#FF6A00]" />
                          Environment
                        </label>
                        <input
                          type="text"
                          placeholder="production"
                          value={editingSystem.environment ?? ''}
                          onChange={e => setEditingSystem({ ...editingSystem, environment: e.target.value })}
                          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40 focus:border-[#FF6A00] transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assets Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 rounded-[18px] p-6 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Image className="w-5 h-5 text-[#FF6A00]" />
                    <h4 className="text-base font-semibold text-white">System Assets</h4>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Icon Image */}
                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <FileImage className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Icon Image
                      </label>
                      <div className="flex gap-4 items-center">
                        {editingSystem.image ? (
                          <div className="relative group w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-white/10">
                            <img src={editingSystem.image} alt="Icon preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditingSystem({ ...editingSystem, image: null })}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity font-medium text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-zinc-950 border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600">
                            <Image className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <label className="relative flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#FF6A00]/30 hover:bg-white/[0.01] rounded-xl p-3 cursor-pointer transition-all duration-300">
                            {uploading ? (
                              <div className="flex flex-col items-center py-1">
                                <Loader2 className="w-5 h-5 text-[#FF6A00] animate-spin" />
                                <span className="text-[11px] text-[#FF6A00] mt-1 font-medium">Uploading...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-4 h-4 text-[#FF6A00] mb-1" />
                                <span className="text-xs text-zinc-400 text-center font-medium">Upload Icon</span>
                                <span className="text-[9px] text-zinc-600 mt-0.5">PNG, JPG up to 2MB</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={async e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const url = await handleFileUpload(file)
                                if (url) setEditingSystem({ ...editingSystem, image: url })
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Banner Image */}
                    <div>
                      <label className="flex items-center text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 gap-1.5">
                        <FileImage className="w-3.5 h-3.5 text-[#FF6A00]" />
                        Banner Image
                      </label>
                      <div className="flex flex-col gap-3">
                        {editingSystem.banner ? (
                          <div className="relative group w-full h-28 rounded-xl overflow-hidden bg-zinc-950 border border-white/10">
                            <img src={editingSystem.banner} alt="Banner preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setEditingSystem({ ...editingSystem, banner: '' })}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 transition-opacity font-medium text-xs"
                            >
                              Remove Banner
                            </button>
                          </div>
                        ) : (
                          <label className="relative flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-[#FF6A00]/30 hover:bg-white/[0.01] rounded-xl p-5 cursor-pointer transition-all duration-300">
                            {uploading ? (
                              <div className="flex flex-col items-center py-1">
                                <Loader2 className="w-6 h-6 text-[#FF6A00] animate-spin" />
                                <span className="text-[11px] text-[#FF6A00] mt-1 font-medium">Uploading banner...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="w-5 h-5 text-[#FF6A00] mb-1" />
                                <span className="text-xs text-zinc-400 font-medium">Upload Banner Image</span>
                                <span className="text-[9px] text-zinc-600 mt-0.5">Landscape aspect recommended</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploading}
                              onChange={async e => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const url = await handleFileUpload(file)
                                if (url) setEditingSystem({ ...editingSystem, banner: url })
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="glass-card bg-white/[0.01] border border-white/5 rounded-[18px] p-6 space-y-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <ToggleRight className="w-5 h-5 text-[#FF6A00]" />
                    <h4 className="text-base font-semibold text-white">Status</h4>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-950 border border-white/5 rounded-2xl">
                    <div className="flex flex-col pr-4">
                      <span className="text-sm font-semibold text-white">Active Status</span>
                      <span className="text-xs text-zinc-500 mt-1">Enable or disable this system across the platform.</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editingSystem.status}
                      onClick={() => setEditingSystem({ ...editingSystem, status: !editingSystem.status })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 focus:ring-offset-black ${
                        editingSystem.status ? 'bg-[#FF6A00]' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          editingSystem.status ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>
              
              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex justify-end gap-3 pt-6 border-t border-white/5 bg-[#0B0B0C]/90 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSystem(null); }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9500] hover:from-[#FF8000] hover:to-[#FFA622] text-white font-semibold text-sm disabled:opacity-50 transition-all duration-300 shadow-[0_4px_20px_rgba(255,106,0,0.25)] hover:shadow-[0_4px_25px_rgba(255,106,0,0.4)]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save System'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
