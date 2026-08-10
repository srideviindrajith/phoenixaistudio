'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, X, Star, ChevronLeft, ChevronRight, Package, IndianRupee, Loader2 } from 'lucide-react'

interface PackageItem {
  id: string
  name: string
  description: string
  category: string
  price: number
  features: string
  launchUrl?: string | null
  demoUrl?: string | null
  documentationUrl?: string | null
  buttonText?: string
  buttonUrl?: string | null
  billingCycle?: string
  currency?: string
  popular: boolean
  featured?: boolean
  visibility?: string
  status?: string | boolean
  tags?: string | null
  shortDescription?: string | null
  longDescription?: string | null
  buttonColor?: string | null
  gradient?: string | null
  buttonIcon?: string | null
  buttonAction?: string
  order: number
  offerEnabled?: boolean
  offerLabel?: string | null
  customOfferLabel?: string | null
  originalPrice?: number | null
  offerPrice?: number | null
  offerStartDate?: string | null
  offerEndDate?: string | null
  discountPercentage?: number | null
  offerMetadata?: string | null
  createdAt: string
  _count?: {
    agents: number
  }
}


const ITEMS_PER_PAGE = 6
const PACKAGE_CATEGORIES = ['AI Agent', 'Client Solution', 'Career Builder']
const PACKAGE_STATUSES = ['Draft', 'Active', 'Coming Soon', 'Maintenance', 'Archived']
const PACKAGE_VISIBILITIES = ['Public', 'Hidden']
const BUTTON_ACTIONS = ['Contact', 'Launch', 'Demo', 'Documentation', 'Custom URL']

const isValidUrl = (url: string) => {
  const trimmed = url.trim()

  if (!trimmed) return true

  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const splitPackageFeatures = (features: string) => {
  const [featureText] = (features || '').split('\n\n[METADATA]\n')

  return featureText
    .split('\n')
    .map((feature) => feature.trim())
    .filter(Boolean)
}

const parseLegacyMetadata = (features: string) => {
  const [, metadataText] = (features || '').split('\n\n[METADATA]\n')

  if (!metadataText) return {} as Record<string, string>

  try {
    return JSON.parse(metadataText) as Record<string, string>
  } catch {
    return {} as Record<string, string>
  }
}

const getStatusLabel = (status: PackageItem['status']) => {
  if (typeof status === 'boolean') return status ? 'Active' : 'Draft'
  return status || 'Active'
}

const getOfferStatusLabel = (pkg: PackageItem) => {
  if (!pkg.offerEnabled) return 'No Offer'
  
  const now = new Date()
  if (pkg.offerStartDate && new Date(pkg.offerStartDate) > now) {
    return 'Upcoming'
  }
  if (pkg.offerEndDate && new Date(pkg.offerEndDate) < now) {
    return 'Expired'
  }
  
  const discount = pkg.discountPercentage
  const label = pkg.offerLabel === 'Custom' ? pkg.customOfferLabel : pkg.offerLabel
  return label || (discount ? `${discount}% OFF` : 'Active')
}

const getPackageDescription = (pkg: PackageItem) => pkg.shortDescription || pkg.description || ''

const getPackageCtaUrl = (pkg: {
  buttonAction?: string | null
  buttonUrl?: string | null
  launchUrl?: string | null
  demoUrl?: string | null
  documentationUrl?: string | null
}) => {
  if (pkg.buttonAction === 'Launch') return pkg.launchUrl || pkg.buttonUrl || '/contact'
  if (pkg.buttonAction === 'Demo') return pkg.demoUrl || pkg.buttonUrl || '/contact'
  if (pkg.buttonAction === 'Documentation') return pkg.documentationUrl || pkg.buttonUrl || '/contact'
  if (pkg.buttonAction === 'Custom URL') return pkg.buttonUrl || '/contact'

  return pkg.buttonUrl || '/contact'
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form States
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState('AI Agent')

  // Handle category change to clear category-specific fields
  const handleCategoryChange = (newCategory: string) => {
    setFormCategory(newCategory)
    // Clear billing cycle when switching away from AI Agent
    if (newCategory !== 'AI Agent') {
      setFormBillingCycle('')
    } else {
      // Set default when switching to AI Agent
      setFormBillingCycle('month')
    }
  }
  const [formPrice, setFormPrice] = useState('0')
  const [formOrder, setFormOrder] = useState('0')
  const [formDescription, setFormDescription] = useState('')
  const [formLongDescription, setFormLongDescription] = useState('')
  const [formFeatures, setFormFeatures] = useState('')
  const [formPopular, setFormPopular] = useState(false)
  const [formFeatured, setFormFeatured] = useState(false)
  const [formBillingCycle, setFormBillingCycle] = useState('')
  const [formCurrency, setFormCurrency] = useState('₹')
  const [formLaunchUrl, setFormLaunchUrl] = useState('')
  const [formDemoUrl, setFormDemoUrl] = useState('')
  const [formDocumentationUrl, setFormDocumentationUrl] = useState('')
  const [formButtonText, setFormButtonText] = useState('Contact Sales')
  const [formButtonUrl, setFormButtonUrl] = useState('')
  const [formButtonColor, setFormButtonColor] = useState('#FF6A00')
  const [formGradient, setFormGradient] = useState('linear-gradient(135deg, #FF6A00 0%, #CC4F00 100%)')
  const [formButtonIcon, setFormButtonIcon] = useState('arrow-right')
  const [formButtonAction, setFormButtonAction] = useState('Contact')
  const [formVisibility, setFormVisibility] = useState('Public')
  const [formStatus, setFormStatus] = useState('Active')
  const [formTags, setFormTags] = useState('')
  const [formOfferEnabled, setFormOfferEnabled] = useState(false)
  const [formOfferLabel, setFormOfferLabel] = useState('Launch Offer')
  const [formCustomOfferLabel, setFormCustomOfferLabel] = useState('')
  const [formOriginalPrice, setFormOriginalPrice] = useState('')
  const [formOfferPrice, setFormOfferPrice] = useState('')
  const [formOfferStartDate, setFormOfferStartDate] = useState('')
  const [formOfferEndDate, setFormOfferEndDate] = useState('')
  const [formOfferMetadata, setFormOfferMetadata] = useState('')
  const [offerSectionOpen, setOfferSectionOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Career Builder Category visibility state
  const [careerBuilderVisible, setCareerBuilderVisible] = useState(true)
  const [savingCareerSetting, setSavingCareerSetting] = useState(false)

  const fetchPackages = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackages()
  }, [fetchPackages])

  // Fetch Career Builder category visibility setting
  useEffect(() => {
    const fetchCareerBuilderSetting = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()
        setCareerBuilderVisible(data.settings?.careerBuilderCategoryVisible !== 'false')
      } catch (error) {
        console.error('Error fetching Career Builder setting:', error)
      }
    }
    fetchCareerBuilderSetting()
  }, [])

  // Update Career Builder category visibility
  const toggleCareerBuilderCategory = async () => {
    setSavingCareerSetting(true)
    try {
      const newValue = !careerBuilderVisible
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerBuilderCategoryVisible: newValue }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setCareerBuilderVisible(newValue)
    } catch (error) {
      console.error('Error updating Career Builder setting:', error)
    } finally {
      setSavingCareerSetting(false)
    }
  }

  // Synchronize form states when editingPackage changes
  useEffect(() => {
    if (editingPackage) {
      const metadata = parseLegacyMetadata(editingPackage.features || '')

      setFormName(editingPackage.name || '')
      const category = editingPackage.category || 'AI Agent'
      setFormCategory(category)
      setFormPrice(editingPackage.price !== undefined ? editingPackage.price.toString() : '0')
      setFormOrder(editingPackage.order !== undefined ? editingPackage.order.toString() : '0')
      setFormDescription(editingPackage.shortDescription || editingPackage.description || '')
      setFormLongDescription(editingPackage.longDescription || '')
      setFormFeatures(splitPackageFeatures(editingPackage.features || '').join('\n'))
      setFormPopular(editingPackage.popular || false)
      setFormFeatured(editingPackage.featured || false)
      setFormBillingCycle(category === 'AI Agent' ? (editingPackage.billingCycle || metadata.billingCycle || 'month') : '')
      setFormCurrency(editingPackage.currency || '₹')
      setFormLaunchUrl(editingPackage.launchUrl || metadata.launchUrl || '')
      setFormDemoUrl(editingPackage.demoUrl || metadata.demoUrl || '')
      setFormDocumentationUrl(editingPackage.documentationUrl || '')
      setFormButtonText(editingPackage.buttonText || 'Contact Sales')
      setFormButtonUrl(editingPackage.buttonUrl || '')
      setFormButtonColor(editingPackage.buttonColor || '#FF6A00')
      setFormGradient(editingPackage.gradient || 'linear-gradient(135deg, #FF6A00 0%, #CC4F00 100%)')
      setFormButtonIcon(editingPackage.buttonIcon || 'arrow-right')
      setFormButtonAction(editingPackage.buttonAction || 'Contact')
      setFormVisibility(editingPackage.visibility || 'Public')
      setFormStatus(getStatusLabel(editingPackage.status))
      setFormTags(editingPackage.tags || '')
      setFormOfferEnabled(editingPackage.offerEnabled || false)
      setFormOfferLabel(editingPackage.offerLabel || 'Launch Offer')
      setFormCustomOfferLabel(editingPackage.customOfferLabel || '')
      setFormOriginalPrice(editingPackage.originalPrice !== undefined && editingPackage.originalPrice !== null ? editingPackage.originalPrice.toString() : '')
      setFormOfferPrice(editingPackage.offerPrice !== undefined && editingPackage.offerPrice !== null ? editingPackage.offerPrice.toString() : '')
      setFormOfferStartDate(editingPackage.offerStartDate ? editingPackage.offerStartDate.split('T')[0] : '')
      setFormOfferEndDate(editingPackage.offerEndDate ? editingPackage.offerEndDate.split('T')[0] : '')
      setFormOfferMetadata(editingPackage.offerMetadata || '')
      setFormErrors({})
    }
  }, [editingPackage])

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getPackageDescription(pkg).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getStatusLabel(pkg.status).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.tags || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        setDeleteId(null)
        return
      }
      setPackages(packages.filter((p) => p.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting package:', error)
      alert('Failed to delete package')
      setDeleteId(null)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formName.trim()) errors.name = 'Package name is required'
    if (!PACKAGE_CATEGORIES.includes(formCategory)) errors.category = 'Choose a valid package category'
    if (!PACKAGE_STATUSES.includes(formStatus)) errors.status = 'Choose a valid status'
    if (!isValidUrl(formLaunchUrl)) errors.launchUrl = 'Launch URL must include http:// or https://'
    if (!isValidUrl(formDemoUrl)) errors.demoUrl = 'Demo URL must include http:// or https://'
    if (!isValidUrl(formDocumentationUrl)) errors.documentationUrl = 'Documentation URL must include http:// or https://'
    if (!isValidUrl(formButtonUrl)) errors.buttonUrl = 'Button URL must include http:// or https://'

    // Offer Validation
    if (formOfferEnabled) {
      if (!formOriginalPrice.trim() || isNaN(parseFloat(formOriginalPrice))) {
        errors.originalPrice = 'Original Price (MRP) is required when offer is enabled'
      }
      if (!formOfferPrice.trim() || isNaN(parseFloat(formOfferPrice))) {
        errors.offerPrice = 'Offer Price is required when offer is enabled'
      }
      if (!formOfferEndDate.trim()) {
        errors.offerEndDate = 'Offer End Date is required when offer is enabled'
      }
    }

    if (formOriginalPrice.trim() && formOfferPrice.trim()) {
      const orig = parseFloat(formOriginalPrice)
      const off = parseFloat(formOfferPrice)
      if (!isNaN(orig) && !isNaN(off) && off >= orig) {
        errors.offerPrice = 'Offer Price must always be less than Original Price'
      }
    }

    if (formOfferStartDate.trim() && formOfferEndDate.trim()) {
      const start = new Date(formOfferStartDate)
      const end = new Date(formOfferEndDate)
      if (end < start) {
        errors.offerEndDate = 'Offer End Date cannot be before Offer Start Date'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = () => {
    const orig = formOriginalPrice.trim() ? parseFloat(formOriginalPrice) : null
    const off = formOfferPrice.trim() ? parseFloat(formOfferPrice) : null
    const discount = (orig && off && orig > 0) ? Math.round(((orig - off) / orig) * 100) : null

    const payload: any = {
      name: formName,
      category: formCategory,
      description: formDescription,
      shortDescription: formDescription,
      longDescription: formLongDescription,
      price: parseFloat(formPrice) || 0,
      order: parseInt(formOrder, 10) || 0,
      features: formFeatures,
      launchUrl: formLaunchUrl,
      demoUrl: formDemoUrl,
      documentationUrl: formDocumentationUrl,
      buttonText: formButtonText,
      buttonUrl: formButtonUrl,
      currency: formCurrency,
      popular: formPopular,
      featured: formFeatured,
      visibility: formVisibility,
      status: formStatus,
      tags: formTags,
      buttonColor: formButtonColor,
      gradient: formGradient,
      buttonIcon: formButtonIcon,
      buttonAction: formButtonAction,
      offerEnabled: formOfferEnabled,
      offerLabel: formOfferLabel,
      customOfferLabel: formOfferLabel === 'Custom' ? formCustomOfferLabel : '',
      originalPrice: orig,
      offerPrice: off,
      offerStartDate: formOfferStartDate ? new Date(formOfferStartDate).toISOString() : null,
      offerEndDate: formOfferEndDate ? new Date(formOfferEndDate).toISOString() : null,
      discountPercentage: discount,
      offerMetadata: formOfferMetadata || null,
    }

    // Only include billingCycle for AI Agent category
    if (formCategory === 'AI Agent') {
      payload.billingCycle = formBillingCycle
    }

    return payload
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPackages([...packages, data.package])
      setShowModal(false)
      setEditingPackage(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating package:', error)
      setFormErrors({ general: error instanceof Error ? error.message : 'Failed to create package' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage) return
    if (!validateForm()) return
    setSaving(true)

    try {
      const res = await fetch(`/api/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPackages(packages.map((p) => (p.id === editingPackage.id ? data.package : p)))
      setShowModal(false)
      setEditingPackage(null)
    } catch (error) {
      console.error('Error updating package:', error)
      setFormErrors({ general: error instanceof Error ? error.message : 'Failed to update package' })
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingPackage({
      id: '',
      name: '',
      description: '',
      category: 'AI Agent',
      price: 0,
      features: '',
      launchUrl: '',
      demoUrl: '',
      documentationUrl: '',
      buttonText: 'Contact Sales',
      buttonUrl: '',
      billingCycle: '',
      currency: '₹',
      popular: false,
      featured: false,
      visibility: 'Public',
      status: 'Active',
      tags: '',
      shortDescription: '',
      longDescription: '',
      buttonColor: '#FF6A00',
      gradient: 'linear-gradient(135deg, #FF6A00 0%, #CC4F00 100%)',
      buttonIcon: 'arrow-right',
      buttonAction: 'Contact',
      order: packages.length,
      offerEnabled: false,
      offerLabel: 'Launch Offer',
      customOfferLabel: '',
      originalPrice: null,
      offerPrice: null,
      offerStartDate: null,
      offerEndDate: null,
      discountPercentage: null,
      offerMetadata: null,
      createdAt: '',
    })
    // Reset form states with AI Agent defaults
    setFormName('')
    setFormCategory('AI Agent')
    setFormPrice('0')
    setFormOrder('0')
    setFormDescription('')
    setFormLongDescription('')
    setFormFeatures('')
    setFormPopular(false)
    setFormFeatured(false)
    setFormBillingCycle('month') // Default for AI Agent
    setFormCurrency('₹')
    setFormLaunchUrl('')
    setFormDemoUrl('')
    setFormDocumentationUrl('')
    setFormButtonText('Contact Sales')
    setFormButtonUrl('')
    setFormButtonColor('#FF6A00')
    setFormGradient('linear-gradient(135deg, #FF6A00 0%, #CC4F00 100%)')
    setFormButtonIcon('arrow-right')
    setFormButtonAction('Contact')
    setFormStatus('Active')
    setFormVisibility('Public')
    setFormTags('')
    setOfferSectionOpen(false)
    setFormOfferEnabled(false)
    setFormOfferLabel('Launch Offer')
    setFormCustomOfferLabel('')
    setFormOriginalPrice('')
    setFormOfferPrice('')
    setFormOfferStartDate('')
    setFormOfferEndDate('')
    setFormOfferMetadata('')
    setIsCreating(true)
    setOfferSectionOpen(false)
    setShowModal(true)
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Packages</h1>
          <p className="text-gray-400 text-sm mt-1">Manage pricing packages</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Career Builder Category Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl">
          <div>
            <h3 className="text-sm font-semibold text-white">Career Builder Category</h3>
            <p className="text-xs text-gray-400 mt-1">Control visibility on public website</p>
          </div>
          <button
            onClick={toggleCareerBuilderCategory}
            disabled={savingCareerSetting}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed ${
              careerBuilderVisible ? 'bg-[#FF6A00]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                careerBuilderVisible ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {savingCareerSetting && (
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="phoenix-input py-2.5 pl-10 pr-4 w-full"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'AI Agent', 'Client Solution', 'Career Builder'].map((cat) => {
            const label = cat === 'all' ? 'All' : cat
            const isActive = categoryFilter === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat)
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#FF6A00]/15 border-[#FF6A00] text-[#FF8A33] shadow-[0_0_12px_rgba(255,106,0,0.15)]'
                    : 'bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
        </div>
      ) : paginatedPackages.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF6A00]/20 bg-[#FF6A00]/10">
            <Package className="h-8 w-8 text-[#FF8A33]" />
          </div>
          <p className="text-white font-semibold mb-2">
            {categoryFilter === 'AI Agent'
              ? 'No AI Packages'
              : categoryFilter === 'Client Solution'
                ? 'No Client Packages'
                : 'No Packages'}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery ? 'Try a different search or filter.' : 'Create the first package for this catalog.'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedPackages.map((pkg) => {
            const featureCount = splitPackageFeatures(pkg.features || '').length
            const status = getStatusLabel(pkg.status)
            const offerStatus = getOfferStatusLabel(pkg)

            return (
              <div
                key={pkg.id}
                className={`phoenix-card relative p-6 ${
                  pkg.popular ? 'border-[#FF6A00]/50' : 'border-white/5'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] px-3 py-1 text-xs font-semibold text-white">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${
                      pkg.category === 'Client Solution'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : (pkg.category === 'Career Builder'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-[#FF6A00]/10 text-[#FF8A33] border-[#FF6A00]/20')
                    }`}>
                      {pkg.category || 'AI Agent'}
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${
                      status === 'Active'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-white/[0.03] text-gray-400 border-white/10'
                    }`}>
                      {status}
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${
                      offerStatus === 'Expired'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : offerStatus === 'Upcoming'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : offerStatus === 'No Offer'
                            ? 'bg-white/[0.03] text-zinc-500 border-white/5'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    }`}>
                      {offerStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <span className="text-3xl font-bold gradient-text">
                      {pkg.price.toLocaleString('en-IN')}
                    </span>
                    {pkg.billingCycle && pkg.category === 'AI Agent' && <span className="text-xs text-gray-500">/{pkg.billingCycle}</span>}
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{getPackageDescription(pkg)}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>Features: {featureCount}</span>
                  <span>AI Agents: {pkg._count?.agents || 0}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPackage(pkg)
                      setIsCreating(false)
                      setOfferSectionOpen(false)
                      setShowModal(true)
                    }}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-medium text-[#FF6A00] bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 transition-all flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this package?')) handleDelete(pkg.id)
                    }}
                    disabled={deleteId === pkg.id}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {deleteId === pkg.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && editingPackage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div className="relative w-full max-w-4xl bg-[#0B0B0C] border border-white/10 rounded-[22px] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_50px_rgba(255,106,0,0.12)] backdrop-blur-md overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0B0B0C]/90 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/25 text-[#FF6A00]">📦</span>
                <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  {isCreating ? 'Create Package' : 'Edit Package'}
                </span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={isCreating ? handleCreate : handleUpdate}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090A]"
            >
              {formErrors.general && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formErrors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Column 1: Configuration Fields */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Package Configuration</span>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Package Name <span className="text-[#FF6A00]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="phoenix-input w-full"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Pro Suite Automation"
                    />
                    {formErrors.name && <p className="mt-1 text-[11px] text-red-400">{formErrors.name}</p>}
                  </div>

                  {/* Category, Status, Visibility */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                      <select
                        required
                        className="phoenix-input py-2.5 text-xs w-full bg-zinc-950 border-white/10"
                        value={formCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        {PACKAGE_CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {formErrors.category && <p className="mt-1 text-[11px] text-red-400">{formErrors.category}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Status</label>
                      <select
                        className="phoenix-input py-2.5 text-xs w-full bg-zinc-950 border-white/10"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                      >
                        {PACKAGE_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      {formErrors.status && <p className="mt-1 text-[11px] text-red-400">{formErrors.status}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Visibility</label>
                      <select
                        className="phoenix-input py-2.5 text-xs w-full bg-zinc-950 border-white/10"
                        value={formVisibility}
                        onChange={(e) => setFormVisibility(e.target.value)}
                      >
                        {PACKAGE_VISIBILITIES.map((visibility) => (
                          <option key={visibility} value={visibility}>{visibility}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price, Currency, Billing Cycle, Order */}
                  <div className="grid grid-cols-2 gap-4 bg-zinc-950/60 p-4 border border-white/5 rounded-2xl">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                        Price <span className="text-[#FF6A00]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">₹</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          className="phoenix-input pl-8 w-full"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Currency</label>
                      <input
                        type="text"
                        className="phoenix-input w-full"
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value || '₹')}
                        placeholder="₹"
                      />
                    </div>

                    {formCategory === 'AI Agent' && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Billing Cycle</label>
                        <input
                          type="text"
                          className="phoenix-input w-full"
                          value={formBillingCycle}
                          onChange={(e) => setFormBillingCycle(e.target.value)}
                          placeholder="month"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Display Order</label>
                      <input
                        type="number"
                        className="phoenix-input w-full"
                        value={formOrder}
                        onChange={(e) => setFormOrder(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Description Fields */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Short Description</label>
                    <input
                      type="text"
                      className="phoenix-input w-full"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Brief card summary description"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Long Description</label>
                    <textarea
                      rows={3}
                      className="phoenix-input w-full resize-none text-xs"
                      value={formLongDescription}
                      onChange={(e) => setFormLongDescription(e.target.value)}
                      placeholder="Detailed features/capabilities description"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tags</label>
                    <input
                      type="text"
                      className="phoenix-input w-full"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="e.g. AI, Automation, Enterprise"
                    />
                  </div>

                  {/* Popular & Featured Switches */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-white/5 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Popular Tier</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-medium">Adds Popular Badge</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormPopular(!formPopular)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formPopular ? 'bg-[#FF6A00]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formPopular ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-white/5 rounded-2xl">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Featured Tier</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-medium">Highlight prominently</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormFeatured(!formFeatured)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formFeatured ? 'bg-[#FF6A00]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formFeatured ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2: URLs, Button Config & Live Preview */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">CTA Actions & Live Preview</span>
                  </div>

                  {/* Features Field */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Features (one per line)
                    </label>
                    <textarea
                      rows={3}
                      className="phoenix-input w-full resize-none text-xs"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    />
                  </div>

                  {/* URLs & Validation indicators */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Launch URL</label>
                      <input
                        type="url"
                        className={`phoenix-input w-full ${formLaunchUrl && !isValidUrl(formLaunchUrl) ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                        value={formLaunchUrl}
                        onChange={(e) => setFormLaunchUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      {formLaunchUrl && !isValidUrl(formLaunchUrl) && <p className="mt-1 text-[10px] text-red-400">Invalid URL format</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Demo URL</label>
                      <input
                        type="url"
                        className={`phoenix-input w-full ${formDemoUrl && !isValidUrl(formDemoUrl) ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                        value={formDemoUrl}
                        onChange={(e) => setFormDemoUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      {formDemoUrl && !isValidUrl(formDemoUrl) && <p className="mt-1 text-[10px] text-red-400">Invalid URL format</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Documentation URL</label>
                      <input
                        type="url"
                        className={`phoenix-input w-full ${formDocumentationUrl && !isValidUrl(formDocumentationUrl) ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                        value={formDocumentationUrl}
                        onChange={(e) => setFormDocumentationUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      {formDocumentationUrl && !isValidUrl(formDocumentationUrl) && <p className="mt-1 text-[10px] text-red-400">Invalid URL format</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Button URL</label>
                      <input
                        type="url"
                        className={`phoenix-input w-full ${formButtonUrl && !isValidUrl(formButtonUrl) ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                        value={formButtonUrl}
                        onChange={(e) => setFormButtonUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      {formButtonUrl && !isValidUrl(formButtonUrl) && <p className="mt-1 text-[10px] text-red-400">Invalid URL format</p>}
                    </div>
                  </div>

                  {/* Button customization */}
                  <div className="bg-zinc-950/60 p-4 border border-white/5 rounded-2xl space-y-3">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">Button Properties</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Button Text</label>
                        <input
                          type="text"
                          className="phoenix-input w-full text-xs py-2"
                          value={formButtonText}
                          onChange={(e) => setFormButtonText(e.target.value)}
                          placeholder="Contact Sales"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Button Action</label>
                        <select
                          className="phoenix-input w-full text-xs py-2 bg-zinc-950 border-white/10"
                          value={formButtonAction}
                          onChange={(e) => setFormButtonAction(e.target.value)}
                        >
                          {BUTTON_ACTIONS.map((action) => (
                            <option key={action} value={action}>{action}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Button Color</label>
                        <input
                          type="text"
                          className="phoenix-input w-full text-xs py-2 font-mono"
                          value={formButtonColor}
                          onChange={(e) => setFormButtonColor(e.target.value)}
                          placeholder="#FF6A00"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Button Icon</label>
                        <input
                          type="text"
                          className="phoenix-input w-full text-xs py-2"
                          value={formButtonIcon}
                          onChange={(e) => setFormButtonIcon(e.target.value)}
                          placeholder="arrow-right"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Gradient Background</label>
                        <input
                          type="text"
                          className="phoenix-input w-full text-xs py-2 font-mono text-[11px]"
                          value={formGradient}
                          onChange={(e) => setFormGradient(e.target.value)}
                          placeholder="linear-gradient(135deg, #FF6A00 0%, #CC4F00 100%)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Live Preview */}
                  <div className="border border-white/5 bg-zinc-950/60 rounded-2xl p-4 space-y-3 shadow-inner">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Live CTA Button Preview</span>
                    <div className="flex items-center justify-center p-4 rounded-xl bg-white/[0.01] border border-dashed border-white/10 min-h-[70px]">
                      <button
                        type="button"
                        style={{
                          background: formGradient || formButtonColor || '#FF6A00',
                          boxShadow: `0 4px 15px rgba(${formButtonColor.startsWith('#') ? parseInt(formButtonColor.slice(1,3),16) : 255}, ${formButtonColor.startsWith('#') ? parseInt(formButtonColor.slice(3,5),16) : 106}, ${formButtonColor.startsWith('#') ? parseInt(formButtonColor.slice(5,7),16) : 0}, 0.35)`
                        }}
                        className="px-6 py-2.5 rounded-xl font-bold text-white text-xs tracking-wide transition-all uppercase flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98]"
                      >
                        {formButtonText || 'Contact Sales'}
                        <span className="text-[10px]">→</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center">
                      Action: <span className="font-semibold text-zinc-400">{formButtonAction}</span> | URL: <span className="font-semibold text-zinc-400 break-all">{getPackageCtaUrl({ buttonAction: formButtonAction, buttonUrl: formButtonUrl, launchUrl: formLaunchUrl, demoUrl: formDemoUrl, documentationUrl: formDocumentationUrl })}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Offer Management Collapsible Section */}
              <div className="border border-white/5 bg-zinc-950/40 rounded-2xl overflow-hidden mt-6">
                <button
                  type="button"
                  onClick={() => setOfferSectionOpen(!offerSectionOpen)}
                  className="flex items-center justify-between w-full px-5 py-4 bg-zinc-950/80 border-b border-[#FF6A00]/10 text-left text-sm font-semibold text-white hover:bg-zinc-900/60 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#FF6A00]">🏷️</span>
                    <span>Offer Management</span>
                  </div>
                  <span className="text-zinc-500 font-normal text-xs">
                    {offerSectionOpen ? 'Collapse ▲' : 'Expand ▼'}
                  </span>
                </button>

                {offerSectionOpen && (
                  <div className="p-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Enable Offer Toggle */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 border border-white/5 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">Enable Offer</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-medium">Activate a promotional pricing deal</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormOfferEnabled(!formOfferEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formOfferEnabled ? 'bg-[#FF6A00]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formOfferEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {formOfferEnabled && (
                      <div className="space-y-4 pt-2 border-t border-white/5 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Offer Label Dropdown */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Offer Label</label>
                            <select
                              className="phoenix-input py-2.5 text-xs w-full bg-zinc-950 border-white/10"
                              value={formOfferLabel}
                              onChange={(e) => setFormOfferLabel(e.target.value)}
                            >
                              {['Launch Offer', 'Limited Time', 'Festival Offer', 'Special Offer', 'New Customer Offer', 'Custom'].map((lbl) => (
                                <option key={lbl} value={lbl}>{lbl}</option>
                              ))}
                            </select>
                          </div>

                          {/* Custom Label Textbox */}
                          {formOfferLabel === 'Custom' && (
                            <div>
                              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Custom Label</label>
                              <input
                                type="text"
                                className="phoenix-input w-full"
                                value={formCustomOfferLabel}
                                onChange={(e) => setFormCustomOfferLabel(e.target.value)}
                                placeholder="Enter custom label description"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Original Price (MRP) */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Original Price (MRP) <span className="text-[#FF6A00]">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">₹</span>
                              <input
                                type="number"
                                className="phoenix-input pl-8 w-full"
                                value={formOriginalPrice}
                                onChange={(e) => setFormOriginalPrice(e.target.value)}
                                placeholder="2999"
                              />
                            </div>
                            {formErrors.originalPrice && <p className="mt-1 text-[10px] text-red-400">{formErrors.originalPrice}</p>}
                          </div>

                          {/* Offer Price */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Offer Price <span className="text-[#FF6A00]">*</span></label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">₹</span>
                              <input
                                type="number"
                                className="phoenix-input pl-8 w-full"
                                value={formOfferPrice}
                                onChange={(e) => setFormOfferPrice(e.target.value)}
                                placeholder="1999"
                              />
                            </div>
                            {formErrors.offerPrice && <p className="mt-1 text-[10px] text-red-400">{formErrors.offerPrice}</p>}
                          </div>

                          {/* Discount Percentage (Auto calculated, Read Only) */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Discount Percentage</label>
                            <div className="relative">
                              <input
                                type="text"
                                readOnly
                                className="phoenix-input w-full bg-zinc-900 border-white/5 text-zinc-400 cursor-not-allowed text-xs py-2.5"
                                value={
                                  formOriginalPrice && formOfferPrice && parseFloat(formOriginalPrice) > 0
                                    ? `${Math.round(((parseFloat(formOriginalPrice) - parseFloat(formOfferPrice)) / parseFloat(formOriginalPrice)) * 100)}% OFF`
                                    : '0% OFF'
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Offer Start Date */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Offer Start Date</label>
                            <input
                              type="date"
                              className="phoenix-input w-full text-zinc-300"
                              value={formOfferStartDate}
                              onChange={(e) => setFormOfferStartDate(e.target.value)}
                            />
                          </div>

                          {/* Offer End Date */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Offer End Date <span className="text-[#FF6A00]">*</span></label>
                            <input
                              type="date"
                              className="phoenix-input w-full text-zinc-300"
                              value={formOfferEndDate}
                              onChange={(e) => setFormOfferEndDate(e.target.value)}
                            />
                            {formErrors.offerEndDate && <p className="mt-1 text-[10px] text-red-400">{formErrors.offerEndDate}</p>}
                          </div>
                        </div>

                        {/* Future Ready Metadata JSON payload */}
                        <div className="pt-2">
                          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Future Ready Offer Metadata (JSON String - Optional)</label>
                          <textarea
                            rows={2}
                            className="phoenix-input w-full font-mono text-[11px] resize-none"
                            value={formOfferMetadata}
                            onChange={(e) => setFormOfferMetadata(e.target.value)}
                            placeholder='e.g. {"couponCodes": ["PROMO10"], "seasonalCampaign": "Monsoon 2026"}'
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5 bg-[#0B0B0C]/90 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? handleCreate : handleUpdate}
                disabled={saving}
                className="phoenix-button font-semibold"
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

