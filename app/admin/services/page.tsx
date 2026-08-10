'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Eye, EyeOff, Copy, Star } from 'lucide-react'
import Link from 'next/link'
import { getServiceIcon } from '@/lib/service-icon-engine'
import { getServiceColorScheme } from '@/lib/service-color-engine'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface Service {
  id: string
  name: string
  category: string
  description: string
  features: string
  status: string
  visibility: string
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      
      if (!response.ok) {
        console.error('API returned error status:', response.status)
        setServices([])
        return
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setServices(data)
      } else {
        console.error('API did not return an array:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' })
      fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleDuplicate = async (service: Service) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          name: `${service.name} (Copy)`,
          status: 'draft'
        })
      })
      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Error duplicating service:', error)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || service.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Services</h1>
        <p className="text-gray-400">Manage your service offerings</p>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="services" moduleName="Services" />
      </div>

      {/* Search, Filter, and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1A1A2E] border border-[#2A2A4A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF6A00]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-[#1A1A2E] border border-[#2A2A4A] rounded-lg text-white focus:outline-none focus:border-[#FF6A00]"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] hover:bg-[#FF8A33] text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Service</span>
        </Link>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No services found. Create your first service to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = getServiceIcon(service.name, service.category, service.description)
            const colorScheme = getServiceColorScheme(service.category, service.name, service.description)
            
            return (
              <div
                key={service.id}
                className="bg-[#1A1A2E] border border-[#2A2A4A] rounded-lg overflow-hidden hover:border-[#FF6A00] transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-[#2A2A4A]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.primary}05)`,
                          border: `1px solid ${colorScheme.primary}20`,
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: colorScheme.primary }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <span className="text-sm text-gray-400">{service.category}</span>
                      </div>
                    </div>
                    {service.featured && (
                      <Star className="w-5 h-5 text-[#FF6A00] fill-[#FF6A00]" />
                    )}
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">{service.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {service.visibility === 'public' ? (
                        <Eye className="w-4 h-4 text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-gray-400 capitalize">{service.visibility}</span>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${
                        service.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated: {formatDate(service.updatedAt)}</span>
                    <span>Order: {service.order}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 border-t border-[#2A2A4A] flex items-center gap-2">
                  <Link
                    href={`/admin/services/${service.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#2A2A4A] hover:bg-[#3A3A5A] text-white rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(service)}
                    className="px-3 py-2 bg-[#2A2A4A] hover:bg-[#3A3A5A] text-white rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
