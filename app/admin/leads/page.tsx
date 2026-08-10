'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Edit, Trash2, X, ChevronLeft, ChevronRight, Filter, Users, Mail, Phone, Building, Calendar, Plus } from 'lucide-react'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  budget: string | null
  message: string
  status: string
  createdAt: string
}

const ITEMS_PER_PAGE = 10

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      setLeads(leads.filter((l) => l.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    setSaving(true)

    try {
      const res = await fetch(`/api/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead),
      })
      const data = await res.json()
      setLeads(leads.map((l) => (l.id === editingLead.id ? data.lead : l)))
      setShowModal(false)
      setEditingLead(null)
    } catch (error) {
      console.error('Error updating lead:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLead) return
    setSaving(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLead),
      })
      const data = await res.json()
      if (res.ok && data.lead) {
        setLeads((prev) => [data.lead, ...prev])
        setShowModal(false)
        setEditingLead(null)
      }
    } catch (error) {
      console.error('Error creating lead:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const lead = leads.find((l) => l.id === id)
      if (!lead) return

      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, status }),
      })
      setLeads(leads.map((l) => (l.id === id ? { ...l, status } : l)))
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    contacted: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/20' },
    qualified: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    converted: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    lost: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your leads and prospects</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setEditingLead({
                name: '',
                email: '',
                phone: '',
                company: '',
                service: '',
                budget: '',
                message: '',
                status: 'new',
              } as any)
              setShowModal(true)
            }}
            className="phoenix-button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Users className="w-4 h-4 text-[#FF6A00]" />
            <span>{filteredLeads.length} total</span>
          </div>
        </div>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="leads" moduleName="Leads" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5 pl-10 pr-4"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input min-w-[140px] cursor-pointer appearance-none py-2.5 pl-10 pr-8"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="phoenix-table-wrap">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
                      <span>Loading leads...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="font-medium">No leads found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const statusStyle = statusColors[lead.status] || statusColors.new
                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#CC4F00]/10 text-sm font-bold text-white">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{lead.name}</p>
                            {lead.company && (
                              <p className="text-xs text-gray-500">{lead.company}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {lead.service || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateStatus(lead.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} cursor-pointer focus:outline-none`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingLead(lead)
                              setShowModal(true)
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this lead?')) handleDelete(lead.id)
                            }}
                            disabled={deleteId === lead.id}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteId === lead.id ? (
                              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin mx-auto" />
            </div>
          ) : paginatedLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p>No leads found</p>
            </div>
          ) : (
            paginatedLeads.map((lead) => {
              const statusStyle = statusColors[lead.status] || statusColors.new
              return (
                <div key={lead.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#CC4F00]/10 text-sm font-bold text-white">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  {lead.service && (
                    <p className="text-sm text-gray-400 mb-3">{lead.service}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingLead(lead)
                        setShowModal(true)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#FF6A00] bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this lead?')) handleDelete(lead.id)
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && editingLead && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
            }
          }}
        >
          <div className="glass-card max-h-[90vh] w-full max-w-lg overflow-hidden rounded-[20px]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">
                {editingLead.id ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={editingLead.id ? handleUpdate : handleCreate} className="p-5 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="phoenix-input"
                  value={editingLead.name}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, name: e.target.value })
                  }
                  placeholder="Lead name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-[#FF6A00]">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="phoenix-input"
                  value={editingLead.email}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, email: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone & Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingLead.phone || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, phone: e.target.value })
                    }
                    placeholder="+1 234..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingLead.company || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, company: e.target.value })
                    }
                    placeholder="Company"
                  />
                </div>
              </div>

              {/* Service & Budget */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingLead.service || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, service: e.target.value })
                    }
                    placeholder="Service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                  <input
                    type="text"
                    className="phoenix-input"
                    value={editingLead.budget || ''}
                    onChange={(e) =>
                      setEditingLead({ ...editingLead, budget: e.target.value })
                    }
                    placeholder="$5000"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  className="phoenix-input"
                  value={editingLead.status}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, status: e.target.value })
                  }
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  rows={4}
                  className="phoenix-input resize-none"
                  value={editingLead.message}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, message: e.target.value })
                  }
                  placeholder="Lead message..."
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={editingLead.id ? handleUpdate : handleCreate}
                disabled={saving}
                className="phoenix-button"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving...' : editingLead.id ? 'Save Changes' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
