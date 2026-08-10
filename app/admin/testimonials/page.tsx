'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Star, ChevronLeft, ChevronRight, MessageSquareQuote, Check, User, ChevronDown } from 'lucide-react'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string | null
  content: string
  rating: number
  image: string | null
  approved: boolean
  order: number
  createdAt: string
}

const ITEMS_PER_PAGE = 6

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/testimonials?all=true')
      const data = await res.json()
      setTestimonials(data.testimonials || [])
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && testimonial.approved) ||
      (statusFilter === 'pending' && !testimonial.approved)
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTestimonials.length / ITEMS_PER_PAGE)
  const paginatedTestimonials = filteredTestimonials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
      setTestimonials(testimonials.filter((t) => t.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting testimonial:', error)
    }
  }

  const toggleApproved = async (id: string, approved: boolean) => {
    try {
      const testimonial = testimonials.find((t) => t.id === id)
      if (!testimonial) return

      await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testimonial, approved }),
      })
      setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, approved } : t)))
    } catch (error) {
      console.error('Error updating testimonial:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestimonial) return
    setSaving(true)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingTestimonial, approved: true }),
      })
      const data = await res.json()
      setTestimonials([...testimonials, data.testimonial])
      setShowModal(false)
      setEditingTestimonial(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating testimonial:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestimonial) return
    setSaving(true)

    try {
      const res = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTestimonial),
      })
      const data = await res.json()
      setTestimonials(testimonials.map((t) => (t.id === editingTestimonial.id ? data.testimonial : t)))
      setShowModal(false)
      setEditingTestimonial(null)
    } catch (error) {
      console.error('Error updating testimonial:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingTestimonial({
      id: '',
      name: '',
      role: '',
      company: null,
      content: '',
      rating: 5,
      image: null,
      approved: true,
      order: testimonials.length,
      createdAt: '',
    })
    setIsCreating(true)
    setShowModal(true)
  }

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (r: number) => void) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={() => interactive && onChange && onChange(i + 1)}
        className={`${interactive ? 'cursor-pointer' : 'pointer-events-none'} p-0.5`}
        disabled={!interactive}
      >
        <Star
          className={`w-5 h-5 transition-all duration-200 ${
            i < rating ? 'text-[#FF6A00] fill-[#FF6A00]' : 'text-gray-600'
          }`}
        />
      </button>
    ))
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Testimonials</h1>
          <p className="text-gray-400 text-sm mt-1">Manage client testimonials</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="testimonials" moduleName="Testimonials" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5 pl-10 pr-4"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setCurrentPage(1)
          }}
          className="phoenix-input min-w-[150px] py-2.5"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
        </div>
      ) : paginatedTestimonials.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <MessageSquareQuote className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium mb-2">No testimonials found</p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery || statusFilter !== 'all' ? 'Try different filters' : 'Create your first testimonial'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`phoenix-card p-5 ${
                testimonial.approved ? 'border-white/[0.06] hover:border-[#FF6A00]/30' : 'border-[#F59E0B]/25'
              }`}
            >
              {/* Header with stars and status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(testimonial.rating)}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-lg ${
                    testimonial.approved
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'border border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#F59E0B]'
                  }`}
                >
                  {testimonial.approved ? 'Approved' : 'Pending'}
                </span>
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                &quot;{testimonial.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF6A00] to-[#CC4F00] text-sm font-bold text-white">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    testimonial.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleApproved(testimonial.id, !testimonial.approved)}
                  className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    testimonial.approved
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20'
                      : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {testimonial.approved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    setEditingTestimonial(testimonial)
                    setIsCreating(false)
                    setShowModal(true)
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-[#FF6A00] bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 transition-all"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this testimonial?')) handleDelete(testimonial.id)
                  }}
                  disabled={deleteId === testimonial.id}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  {deleteId === testimonial.id ? (
                    <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
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
      {showModal && editingTestimonial && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-hidden rounded-[20px]">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {isCreating ? 'Create Testimonial' : 'Edit Testimonial'}
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
                  Name <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="phoenix-input"
                  value={editingTestimonial.name}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, name: e.target.value })
                  }
                  placeholder="Client name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="phoenix-input"
                    value={editingTestimonial.role}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, role: e.target.value })
                    }
                    placeholder="CEO, Founder..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingTestimonial.company || ''}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, company: e.target.value })
                    }
                    placeholder="Company"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Testimonial <span className="text-[#FF6A00]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  className="phoenix-input resize-none"
                  value={editingTestimonial.content}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, content: e.target.value })
                  }
                  placeholder="Client feedback..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {renderStars(editingTestimonial.rating, true, (r) =>
                    setEditingTestimonial({ ...editingTestimonial, rating: r })
                  )}
                  <span className="text-sm text-gray-400 ml-2">
                    {editingTestimonial.rating}/5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Avatar URL</label>
                <input
                  type="url"
                  className="phoenix-input"
                  value={editingTestimonial.image || ''}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingTestimonial.approved}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, approved: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-white/20 bg-[#050505] text-[#FF6A00] focus:ring-[#FF6A00]/20"
                />
                <span className="text-sm text-white">Approved for public display</span>
              </label>
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
