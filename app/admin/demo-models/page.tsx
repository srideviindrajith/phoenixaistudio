'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Upload, ChevronLeft, ChevronRight, PlayCircle, Image, ToggleLeft, ToggleRight } from 'lucide-react'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface ModelItem {
  id: string
  title: string
  description: string
  image: string | null
  liveUrl: string | null
  category: string
  status: boolean
  createdAt: string
}

const ITEMS_PER_PAGE = 6
const CATEGORIES = ['Language Processing', 'Computer Vision', 'Predictive Analytics', 'Voice Synthesis', 'Other']

export default function AdminDemoModelsPage() {
  const [models, setModels] = useState<ModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/demo-models')
      const data = await res.json()
      setModels(data.models || [])
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || model.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE)
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/demo-models/${id}`, { method: 'DELETE' })
      setModels(models.filter((m) => m.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting model:', error)
    }
  }

  const handleStatusToggle = async (model: ModelItem) => {
    try {
      const updatedStatus = !model.status
      const res = await fetch(`/api/demo-models/${model.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...model, status: updatedStatus }),
      })
      const data = await res.json()
      setModels(models.map((m) => (m.id === model.id ? data.model : m)))
    } catch (error) {
      console.error('Error toggling model status:', error)
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
    if (!editingModel) return
    setSaving(true)

    try {
      const res = await fetch('/api/demo-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModel),
      })
      const data = await res.json()
      setModels([data.model, ...models])
      setShowModal(false)
      setEditingModel(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating model:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingModel) return
    setSaving(true)

    try {
      const res = await fetch(`/api/demo-models/${editingModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModel),
      })
      const data = await res.json()
      setModels(models.map((m) => (m.id === editingModel.id ? data.model : m)))
      setShowModal(false)
      setEditingModel(null)
    } catch (error) {
      console.error('Error updating model:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingModel({
      id: '',
      title: '',
      description: '',
      image: null,
      liveUrl: '',
      category: CATEGORIES[0],
      status: true,
      createdAt: '',
    })
    setIsCreating(true)
    setShowModal(true)
  }

  const openEditModal = (model: ModelItem) => {
    setEditingModel({ ...model, liveUrl: model.liveUrl || '' })
    setIsCreating(false)
    setShowModal(true)
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Demo Models</h1>
          <p className="text-gray-400 text-sm mt-1">Manage interactive machine learning models</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add Model
        </button>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="demo-models" moduleName="Demo Models" />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search models..."
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
      ) : paginatedModels.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium mb-2">No models found</p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery ? 'Try a different search' : 'Create your first Demo Model'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Model
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedModels.map((model) => (
            <div
              key={model.id}
              className={`phoenix-card relative p-6 ${
                model.status ? 'border-[#FF6A00]/20' : 'border-white/[0.06] opacity-60'
              }`}
            >
              <div className="flex gap-4">
                {model.image ? (
                  <img
                    src={model.image}
                    alt={model.title}
                    className="w-16 h-16 rounded-xl object-cover bg-zinc-900 border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <PlayCircle className="w-8 h-8 text-[#FF6A00]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#FF6A00] mb-1">
                    {model.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white truncate">{model.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{model.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500 truncate max-w-[150px]" title={model.liveUrl || ''}>
                  {model.liveUrl || 'No preview URL'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(model)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={model.status ? 'Deactivate' : 'Activate'}
                  >
                    {model.status ? (
                      <ToggleRight className="w-6 h-6 text-[#FF6A00]" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(model)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    disabled={deleteId === model.id}
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

      {/* Modal */}
      {showModal && editingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg overflow-hidden rounded-[20px] shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">
                {isCreating ? 'Add Demo Model' : 'Edit Demo Model'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingModel(null)
                }}
                className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isCreating ? handleCreate : handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Title</label>
                <input
                  type="text"
                  required
                  placeholder="Custom NLP Classifier"
                  value={editingModel.title}
                  onChange={(e) => setEditingModel({ ...editingModel, title: e.target.value })}
                  className="phoenix-input py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Interactive demo classifying customer intent..."
                  value={editingModel.description}
                  onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                  className="phoenix-input resize-none py-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={editingModel.category}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value })}
                    className="phoenix-input py-2.5"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Live Preview URL</label>
                  <input
                    type="url"
                    placeholder="https://nlp.demo.phoenixai.studio"
                    value={editingModel.liveUrl || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, liveUrl: e.target.value })}
                    className="phoenix-input py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Model Image</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
                    {editingModel.image ? (
                      <img src={editingModel.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="model-image-upload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = await handleFileUpload(file)
                        if (url) {
                          setEditingModel({ ...editingModel, image: url })
                        }
                      }}
                    />
                    <label
                      htmlFor="model-image-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4 text-[#FF6A00]" />
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="model-status"
                  checked={editingModel.status}
                  onChange={(e) => setEditingModel({ ...editingModel, status: e.target.checked })}
                  className="h-4 w-4 rounded border-white/10 bg-[#050505] text-[#FF6A00] focus:ring-[#FF6A00]/50"
                />
                <label htmlFor="model-status" className="text-sm font-medium text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingModel(null)
                  }}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="phoenix-button py-2.5"
                >
                  {saving ? 'Saving...' : 'Save Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
