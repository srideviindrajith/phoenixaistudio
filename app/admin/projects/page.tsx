'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, ExternalLink, Star, Upload, ChevronLeft, ChevronRight, FolderKanban, Image, ChevronDown } from 'lucide-react'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface Project {
  id: string
  title: string
  description: string
  category: string
  image: string | null
  client: string | null
  technologies: string | null
  link: string | null
  featured: boolean
  order: number
  createdAt: string
}

const ITEMS_PER_PAGE = 6
const CATEGORIES = ['AI Solution', 'Web Application', 'Mobile App', 'Data Analytics', 'Cloud Solution', 'Automation']

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      setProjects(projects.filter((p) => p.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting project:', error)
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
    if (!editingProject) return
    setSaving(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      })
      const data = await res.json()
      setProjects([...projects, data.project])
      setShowModal(false)
      setEditingProject(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProject) return
    setSaving(true)

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject),
      })
      const data = await res.json()
      setProjects(projects.map((p) => (p.id === editingProject.id ? data.project : p)))
      setShowModal(false)
      setEditingProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingProject({
      id: '',
      title: '',
      description: '',
      category: '',
      image: null,
      client: null,
      technologies: null,
      link: null,
      featured: false,
      order: projects.length,
      createdAt: '',
    })
    setIsCreating(true)
    setShowModal(true)
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Manage portfolio projects</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="projects" moduleName="Projects" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5 pl-10 pr-4"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="phoenix-input min-w-[150px] py-2.5"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
        </div>
      ) : paginatedProjects.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium mb-2">No projects found</p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery || categoryFilter !== 'all' ? 'Try different filters' : 'Create your first project'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedProjects.map((project) => (
            <div
              key={project.id}
              className="phoenix-card group overflow-hidden p-0"
            >
              <div className="relative h-40 bg-[#050505]">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FF6A00]/5 to-[#CC4F00]/5">
                    <span className="text-5xl font-bold text-[#FF6A00]/20">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                )}
                {project.featured && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] px-2 py-1 text-xs font-semibold text-white">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-white mb-2 group-hover:text-[#FF6A00] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProject(project)
                      setIsCreating(false)
                      setShowModal(true)
                    }}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-[#FF6A00] bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 transition-all flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this project?')) handleDelete(project.id)
                    }}
                    disabled={deleteId === project.id}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleteId === project.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400 px-4">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && editingProject && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="glass-card my-8 w-full max-w-lg overflow-hidden rounded-[20px]">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Create Project' : 'Edit Project'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={isCreating ? handleCreate : handleUpdate}
              className="p-5 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="phoenix-input"
                  value={editingProject.title}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, title: e.target.value })
                  }
                  placeholder="Project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="phoenix-input resize-none"
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  placeholder="Project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    className="phoenix-input"
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, category: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Client</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingProject.client || ''}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, client: e.target.value })
                    }
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                {editingProject.image ? (
                  <div className="relative mb-2">
                    <img
                      src={editingProject.image}
                      alt="Project"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingProject({ ...editingProject, image: null })}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/10 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="project-image-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const url = await handleFileUpload(file)
                          if (url) {
                            setEditingProject({ ...editingProject, image: url })
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="project-image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      {uploading ? (
                        <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-400">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  className="phoenix-input"
                  value={editingProject.technologies || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, technologies: e.target.value })
                  }
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Link</label>
                <input
                  type="url"
                  className="phoenix-input"
                  value={editingProject.link || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProject.featured}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, featured: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-white/20 bg-[#050505] text-[#FF6A00] focus:ring-[#FF6A00]/20"
                  />
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-4 h-4 text-[#FF6A00]" />
                    <span className="text-sm">Featured</span>
                  </div>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                  <input
                    type="number"
                    className="phoenix-input w-20 px-3 py-2"
                    value={editingProject.order}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                disabled={saving}
                className="phoenix-button"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving...' : isCreating ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
