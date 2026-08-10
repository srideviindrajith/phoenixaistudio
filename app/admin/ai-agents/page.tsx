'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Search, Plus, Edit, Trash2, X, Upload, ChevronLeft, ChevronRight, 
  Cpu, Image as ImageIcon, ToggleLeft, ToggleRight, Info, ExternalLink, 
  Link2, Globe, Tag, DollarSign, Settings, Check, HelpCircle, LayoutGrid
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ModuleToggle } from '@/components/admin/module-toggle'

interface AgentItem {
  id: string
  name: string
  description: string
  longDescription?: string
  image: string | null
  price: number
  features: string
  category: string
  agentType?: string
  tags?: string
  status: boolean
  isPublic: boolean
  packageId?: string
  package?: any
  aiInstructions?: string
  businessKnowledge?: string
  systemPrompt?: string
  createdAt: string
  updatedAt: string
}

interface PackageOption {
  id: string
  name: string
  price: number
  currency?: string
}

const ITEMS_PER_PAGE = 6
const CATEGORIES = ['Sales & Lead Generation', 'Customer Support', 'Booking & Appointment', 'WhatsApp Business', 'Custom Business AI', 'Multi-Agent AI System']
const AGENT_TYPES = ['Sales Agent', 'Customer Support Agent', 'Booking Agent', 'Lead Qualification Agent', 'WhatsApp Business Agent', 'Custom Business AI Agent', 'Multi-Agent AI System']
const TAGS_LIST = ['AI', 'Automation', 'CRM', 'Sales', 'Support', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Enterprise']
const MODELS_LIST = ['GPT-5.5', 'Claude', 'Gemini', 'DeepSeek', 'Llama', 'Custom']
const DEPLOYMENT_TYPES = ['Cloud', 'On Premise', 'Hybrid']

const isValidUrl = (url: string) => {
  if (!url) return false
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false
    new URL(url)
    return true
  } catch {
    return false
  }
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editingAgent, setEditingAgent] = useState<AgentItem | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Rich Modal State Variables
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formAgentType, setFormAgentType] = useState('Chatbot')
  const [formVersion, setFormVersion] = useState('1.0.0')
  const [formEnvironment, setFormEnvironment] = useState('Production')
  const [formPrice, setFormPrice] = useState('0')
  const [formCurrency, setFormCurrency] = useState('INR')
  const [formLaunchUrl, setFormLaunchUrl] = useState('')
  const [formLiveDemoUrl, setFormLiveDemoUrl] = useState('')
  const [formDocUrl, setFormDocUrl] = useState('')
  const [formGithubUrl, setFormGithubUrl] = useState('')
  const [formApiEndpoint, setFormApiEndpoint] = useState('')
  const [formFeatures, setFormFeatures] = useState('')
  const [formSupportedModels, setFormSupportedModels] = useState<string[]>([])
  const [formDeploymentType, setFormDeploymentType] = useState('Cloud')
  const [formLogo, setFormLogo] = useState<string | null>(null)
  const [formBanner, setFormBanner] = useState<string | null>(null)
  const [formPreview, setFormPreview] = useState<string | null>(null)
  const [formTags, setFormTags] = useState<string[]>([])
  const [formStatus, setFormStatus] = useState(true)
  const [formIsPublic, setFormIsPublic] = useState(false)
  const [formLongDescription, setFormLongDescription] = useState('')
  const [formPackageId, setFormPackageId] = useState('')
  const [formAiInstructions, setFormAiInstructions] = useState('')
  const [formBusinessKnowledge, setFormBusinessKnowledge] = useState('')
  const [formSystemPrompt, setFormSystemPrompt] = useState('')
  const [packages, setPackages] = useState<PackageOption[]>([])
  
  // Validation Errors State
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai-agents')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch('/api/packages')
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    fetchPackages()
  }, [fetchAgents, fetchPackages])

  // Synchronize form states when editingAgent shifts
  useEffect(() => {
    if (editingAgent) {
      const isNew = editingAgent.id === ''
      setIsCreating(isNew)

      const parts = (editingAgent.features || '').split('\n\n[METADATA]\n')
      const userFeaturesText = parts[0] || ''
      let metadata: any = {}
      if (parts[1]) {
        try {
          metadata = JSON.parse(parts[1])
        } catch (e) {
          metadata = {}
        }
      }

      setFormName(editingAgent.name || '')
      setFormSlug(metadata.slug || '')
      setIsSlugManual(!!metadata.slug)
      setFormDescription(editingAgent.description || '')
      setFormCategory(editingAgent.category || CATEGORIES[0])
      setFormAgentType(metadata.agentType || 'Chatbot')
      setFormVersion(metadata.version || '1.0.0')
      setFormEnvironment(metadata.environment || 'Production')
      setFormPrice(editingAgent.price !== undefined ? editingAgent.price.toString() : '0')
      setFormCurrency(metadata.currency || 'INR')
      setFormLaunchUrl(metadata.launchUrl || '')
      setFormLiveDemoUrl(metadata.liveDemoUrl || '')
      setFormDocUrl(metadata.docUrl || '')
      setFormGithubUrl(metadata.githubUrl || '')
      setFormApiEndpoint(metadata.apiEndpoint || '')
      setFormFeatures(userFeaturesText)
      setFormSupportedModels(metadata.supportedModels || [])
      setFormDeploymentType(metadata.deploymentType || 'Cloud')
      setFormLogo(editingAgent.image || null)
      setFormBanner(metadata.bannerImage || null)
      setFormPreview(metadata.previewImage || null)
      setFormTags(metadata.tags || [])
      setFormStatus(editingAgent.status !== undefined ? editingAgent.status : true)
      setFormIsPublic(editingAgent.isPublic || false)
      setFormLongDescription(editingAgent.longDescription || '')
      setFormPackageId(editingAgent.packageId || '')
      setFormAiInstructions(editingAgent.aiInstructions || '')
      setFormBusinessKnowledge(editingAgent.businessKnowledge || '')
      setFormSystemPrompt(editingAgent.systemPrompt || '')
      setFormErrors({})
    }
  }, [editingAgent])

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE)
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const hasPackages = packages.length > 0

  const handleDelete = async (id: string) => {
    setDeleteId(id)
    try {
      await fetch(`/api/ai-agents/${id}`, { method: 'DELETE' })
      setAgents(agents.filter((a) => a.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting agent:', error)
    }
  }

  const handleStatusToggle = async (agent: AgentItem) => {
    try {
      const updatedStatus = !agent.status
      const res = await fetch(`/api/ai-agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...agent, status: updatedStatus }),
      })
      const data = await res.json()
      setAgents(agents.map((a) => (a.id === agent.id ? data.agent : a)))
    } catch (error) {
      console.error('Error toggling agent status:', error)
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

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (!formName.trim()) errs.name = "Agent Name is required"
    if (!formDescription.trim()) errs.description = "Short Description is required"
    if (!formCategory) errs.category = "Category is required"
    if (!formFeatures.trim()) errs.features = "Features are required"
    if (!formPrice.trim() || isNaN(parseFloat(formPrice)) || parseFloat(formPrice) < 0) {
      errs.price = "Valid Price is required"
    }

    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)

    // Construct metadata object with all URL and image fields
    const metadata = {
      slug: formSlug,
      agentType: formAgentType,
      version: formVersion,
      environment: formEnvironment,
      currency: formCurrency,
      launchUrl: formLaunchUrl,
      liveDemoUrl: formLiveDemoUrl,
      docUrl: formDocUrl,
      githubUrl: formGithubUrl,
      apiEndpoint: formApiEndpoint,
      supportedModels: formSupportedModels,
      deploymentType: formDeploymentType,
      bannerImage: formBanner,
      previewImage: formPreview,
      tags: formTags,
    }

    // Combine features with metadata
    const featuresWithMetadata = formFeatures + '\n\n[METADATA]\n' + JSON.stringify(metadata)

    const updatedAgentData = {
      name: formName,
      description: formDescription,
      longDescription: formLongDescription,
      image: formLogo,
      price: parseFloat(formPrice) || 0,
      features: featuresWithMetadata,
      category: formCategory,
      agentType: formAgentType,
      tags: formTags.join(', '),
      status: formStatus,
      isPublic: formIsPublic,
      packageId: formPackageId || null,
      aiInstructions: formAiInstructions,
      businessKnowledge: formBusinessKnowledge,
      systemPrompt: formSystemPrompt,
    }

    try {
      if (isCreating) {
        const res = await fetch('/api/ai-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedAgentData),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setAgents([data.agent, ...agents])
      } else {
        const res = await fetch(`/api/ai-agents/${editingAgent?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedAgentData),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setAgents(agents.map((a) => (a.id === editingAgent?.id ? data.agent : a)))
      }
      closeModal()
    } catch (error) {
      console.error('Error saving agent:', error)
    } finally {
      setSaving(false)
    }
  }

  const openCreateModal = () => {
    setEditingAgent({
      id: '',
      name: '',
      description: '',
      longDescription: '',
      image: null,
      price: 0,
      features: '',
      category: CATEGORIES[0],
      agentType: 'Sales Agent',
      tags: '',
      status: true,
      isPublic: false,
      packageId: '',
      aiInstructions: '',
      businessKnowledge: '',
      systemPrompt: '',
      createdAt: '',
      updatedAt: '',
    })
    setIsCreating(true)
    setShowModal(true)
  }

  const openEditModal = (agent: AgentItem) => {
    setEditingAgent({ ...agent })
    setIsCreating(false)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAgent(null)
  }

  const handleNameChange = (val: string) => {
    setFormName(val)
    if (!isSlugManual) {
      setFormSlug(slugify(val))
    }
  }

  const handleSlugChange = (val: string) => {
    setFormSlug(slugify(val))
    setIsSlugManual(true)
  }

  const toggleModel = (model: string) => {
    if (formSupportedModels.includes(model)) {
      setFormSupportedModels(formSupportedModels.filter(m => m !== model))
    } else {
      setFormSupportedModels([...formSupportedModels, model])
    }
  }

  const toggleTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter(t => t !== tag))
    } else {
      setFormTags([...formTags, tag])
    }
  }

  const getFormattedPrice = (price: number, featuresStr: string) => {
    const parts = (featuresStr || '').split('\n\n[METADATA]\n')
    let currency = 'INR'
    if (parts[1]) {
      try {
        const metadata = JSON.parse(parts[1])
        currency = metadata.currency || 'INR'
      } catch {}
    }
    const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
    const formattedVal = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)
    return `${symbol} ${formattedVal} / month`
  }

  // Helper local component for sections
  const SectionCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="glass border border-white/[0.06] rounded-2xl p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Icon className="w-4.5 h-4.5 text-[#FF6A00]" />
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  )

  // Reusable custom Drag & Drop upload card
  const UploadCard = ({ 
    label, 
    value, 
    onChange, 
    helperText 
  }: { 
    label: string; 
    value: string | null; 
    onChange: (url: string | null) => void; 
    helperText?: string 
  }) => {
    const [dragActive, setDragActive] = useState(false)
    const [localUploading, setLocalUploading] = useState(false)

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }

    const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await uploadFile(e.dataTransfer.files[0])
      }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        await uploadFile(e.target.files[0])
      }
    }

    const uploadFile = async (file: File) => {
      setLocalUploading(true)
      try {
        const url = await handleFileUpload(file)
        if (url) {
          onChange(url)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLocalUploading(false)
      }
    }

    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-300">{label}</span>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center h-28 rounded-xl border border-dashed transition-all cursor-pointer overflow-hidden",
            dragActive 
              ? "border-[#FF6A00] bg-[#FF6A00]/5" 
              : value 
                ? "border-white/10 bg-zinc-950" 
                : "border-white/10 hover:border-white/20 bg-white/[0.02]"
          )}
        >
          {localUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
              <span className="text-[10px] text-gray-400">Uploading...</span>
            </div>
          ) : value ? (
            <div className="group relative w-full h-full">
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all gap-2">
                <label className="px-2.5 py-1.5 rounded-lg bg-[#FF6A00] text-white text-[10px] font-semibold hover:bg-[#CC4F00] transition-colors cursor-pointer">
                  Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-white text-[10px] font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-full p-3 text-center cursor-pointer">
              <Upload className="w-5 h-5 text-[#FF6A00] mb-1.5" />
              <span className="text-[11px] font-medium text-white mb-0.5">Drag & drop or click</span>
              {helperText && <span className="text-[9px] text-gray-500">{helperText}</span>}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </div>
    )
  }

  // URL Field Wrapper
  const UrlInput = ({
    label,
    value,
    onChange,
    required = false,
    placeholder = "https://...",
    errorKey
  }: {
    label: string
    value: string
    onChange: (val: string) => void
    required?: boolean
    placeholder?: string
    errorKey: string
  }) => {
    const isValid = !value || isValidUrl(value)
    const hasError = !!formErrors[errorKey]

    const handleOpen = () => {
      if (value && isValid) {
        window.open(value, '_blank', 'noopener,noreferrer')
      }
    }

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-300">
          {label} {required && <span className="text-[#FF6A00]">*</span>}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="url"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "phoenix-input pl-9 pr-4 py-2.5 w-full text-sm",
                (hasError || !isValid) && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
              )}
            />
          </div>
          <button
            type="button"
            disabled={!value || !isValid}
            onClick={handleOpen}
            title="Open Link"
            className="px-3 rounded-xl border border-white/10 hover:border-[#FF6A00]/30 hover:bg-[#FF6A00]/5 text-gray-400 hover:text-white disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-transparent transition-all flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        {formErrors[errorKey] ? (
          <span className="text-[10px] text-red-500 font-medium">{formErrors[errorKey]}</span>
        ) : !isValid ? (
          <span className="text-[10px] text-red-400 font-medium">Please enter a valid URL (include https://)</span>
        ) : null}
      </div>
    )
  }

  const currencySymbol = formCurrency === 'INR' ? '₹' : formCurrency === 'EUR' ? '€' : formCurrency === 'GBP' ? '£' : '$'

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">AI Agents</h1>
          <p className="text-gray-400 text-sm mt-1">Manage AI operational agents</p>
        </div>
        <button
          onClick={openCreateModal}
          className="phoenix-button"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="ai-agents" moduleName="AI Agents" />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search agents..."
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
      ) : paginatedAgents.length === 0 ? (
        <div className="glass-card rounded-[20px] p-12 text-center">
          <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium mb-2">No agents found</p>
          <p className="text-gray-400 text-sm mb-6">
            {searchQuery ? 'Try a different search' : 'Create your first AI Agent'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] text-sm font-medium hover:bg-[#FF6A00]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {paginatedAgents.map((agent) => (
            <div
              key={agent.id}
              className={cn(
                "phoenix-card relative p-6 transition-all duration-300",
                agent.status ? "border-[#FF6A00]/20 shadow-[0_4px_20px_rgba(255,106,0,0.05)]" : "border-white/[0.06] opacity-60"
              )}
            >
              <div className="flex gap-4">
                {agent.image ? (
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-zinc-900 border border-white/10"
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Cpu className="w-8 h-8 text-[#FF6A00]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#FF6A00]">
                      {agent.category}
                    </span>
                    {agent.isPublic && (
                      <span className="inline-block text-[9px] uppercase tracking-wider font-semibold bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                        Public
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white truncate">{agent.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{agent.description}</p>
                  {agent.package && (
                    <div className="mt-2 text-[10px] text-gray-500">
                      Package: <span className="text-[#FF8A33]">{agent.package.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <span className="text-white font-medium">
                  {getFormattedPrice(agent.price, agent.features)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(agent)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title={agent.status ? 'Deactivate' : 'Activate'}
                  >
                    {agent.status ? (
                      <ToggleRight className="w-6 h-6 text-[#FF6A00]" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(agent)}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    disabled={deleteId === agent.id}
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

      {/* Modal Redesign - Premium Enterprise SaaS */}
      {showModal && editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="glass-strong border border-white/[0.08] w-full max-w-[900px] max-h-[90vh] overflow-hidden rounded-[22px] shadow-2xl flex flex-col">
            
            {/* Sticky Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06] bg-[#0A0A0C]/90 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6A00]/10 flex items-center justify-center border border-[#FF6A00]/20">
                  <Cpu className="w-4.5 h-4.5 text-[#FF6A00]" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {isCreating ? 'Add AI Agent' : 'Edit AI Agent'}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-phoenix bg-black/40">
              
              {/* Row 1: General Info & Pricing Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Information Card */}
                <SectionCard title="General Information" icon={Info}>
                  <div className="space-y-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Agent Name <span className="text-[#FF6A00]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="OmniChannel Support Agent"
                        value={formName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className={cn(
                          "phoenix-input py-2.5 text-sm",
                          formErrors.name && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                        )}
                      />
                      {formErrors.name && (
                        <span className="text-[10px] text-red-500 font-medium">{formErrors.name}</span>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Slug <span className="text-[#FF6A00]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="omnichannel-support-agent"
                        value={formSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={cn(
                          "phoenix-input py-2.5 text-sm",
                          formErrors.slug && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                        )}
                      />
                      <span className="text-[9px] text-gray-500">Alphanumeric character sequences separated by dashes only</span>
                      {formErrors.slug && (
                        <span className="text-[10px] text-red-500 font-medium">{formErrors.slug}</span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Short Description <span className="text-[#FF6A00]">*</span>
                      </label>
                      <textarea
                        rows={2.5}
                        placeholder="Resolves customer tickets and handles user issues..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className={cn(
                          "phoenix-input resize-none py-2.5 text-sm",
                          formErrors.description && "border-red-500/50"
                        )}
                      />
                    </div>

                    {/* Long Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Long Description
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Detailed description of the AI agent capabilities, use cases, and value proposition..."
                        value={formLongDescription}
                        onChange={(e) => setFormLongDescription(e.target.value)}
                        className="phoenix-input resize-none py-2.5 text-sm"
                      />
                    </div>

                    {/* Category & Agent Type Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-300">Category *</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="phoenix-input py-2.5 text-sm"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-300">Agent Type *</label>
                        <select
                          value={formAgentType}
                          onChange={(e) => setFormAgentType(e.target.value)}
                          className="phoenix-input py-2.5 text-sm"
                        >
                          {AGENT_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Version & Environment Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-300">Version *</label>
                        <input
                          type="text"
                          placeholder="1.0.0"
                          value={formVersion}
                          onChange={(e) => setFormVersion(e.target.value)}
                          className={cn(
                            "phoenix-input py-2.5 text-sm",
                            formErrors.version && "border-red-500/50"
                          )}
                        />
                        {formErrors.version && (
                          <span className="text-[10px] text-red-500 font-medium">{formErrors.version}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-300">Environment *</label>
                        <select
                          value={formEnvironment}
                          onChange={(e) => setFormEnvironment(e.target.value)}
                          className="phoenix-input py-2.5 text-sm"
                        >
                          <option value="Development">Development</option>
                          <option value="Staging">Staging</option>
                          <option value="Production">Production</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Pricing & Status Card */}
                <SectionCard title="Pricing & Status" icon={DollarSign}>
                  <div className="space-y-4">
                    {/* Currency Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">Currency</label>
                      <select
                        value={formCurrency}
                        onChange={(e) => setFormCurrency(e.target.value)}
                        className="phoenix-input py-2.5 text-sm"
                      >
                        <option value="INR">₹ Indian Rupee (INR)</option>
                        <option value="USD">$ US Dollar (USD)</option>
                        <option value="EUR">€ Euro (EUR)</option>
                        <option value="GBP">£ British Pound (GBP)</option>
                      </select>
                    </div>

                    {/* Price Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">
                        Monthly Price <span className="text-[#FF6A00]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">
                          {currencySymbol}
                        </span>
                        <input
                          type="text"
                          placeholder="4999"
                          value={formPrice}
                          onChange={(e) => {
                            const cleanVal = e.target.value.replace(/[^0-9.]/g, '')
                            setFormPrice(cleanVal)
                          }}
                          className={cn(
                            "phoenix-input pl-8 pr-16 py-2.5 w-full text-sm",
                            formErrors.price && "border-red-500/50"
                          )}
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-[11px] font-medium pointer-events-none">
                          / month
                        </span>
                      </div>
                      {formPrice && !isNaN(parseFloat(formPrice)) && (
                        <div className="text-[11px] text-gray-400">
                          Display Format: <span className="text-[#FF8A33] font-semibold">{currencySymbol} {new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parseFloat(formPrice) || 0)} / month</span>
                        </div>
                      )}
                      {formErrors.price && (
                        <span className="text-[10px] text-red-500 font-medium">{formErrors.price}</span>
                      )}
                    </div>

                    {/* Status Toggle switch */}
                    <div className="pt-4 flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-white">Agent Status</span>
                        <span className="text-[10px] text-gray-500">Active or inactive on platform</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold tracking-wider uppercase transition-colors duration-200", 
                          formStatus ? "text-[#FF8A33]" : "text-gray-500"
                        )}>
                          {formStatus ? "Active" : "Inactive"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormStatus(!formStatus)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40",
                            formStatus ? "bg-[#FF6A00]" : "bg-zinc-800"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300",
                              formStatus ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Public Visibility Toggle switch */}
                    <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-white">Public Visibility</span>
                        <span className="text-[10px] text-gray-500">Show on public website</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[10px] font-bold tracking-wider uppercase transition-colors duration-200", 
                          formIsPublic ? "text-[#FF8A33]" : "text-gray-500"
                        )}>
                          {formIsPublic ? "Public" : "Private"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormIsPublic(!formIsPublic)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6A00]/40",
                            formIsPublic ? "bg-[#FF6A00]" : "bg-zinc-800"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300",
                              formIsPublic ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Package Assignment */}
                    <div className="pt-2 flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-300">Assign Package</label>
                      <select
                        value={formPackageId}
                        onChange={(e) => setFormPackageId(e.target.value)}
                        disabled={!hasPackages}
                        className="phoenix-input py-2.5 text-sm"
                      >
                        <option value="">
                          {hasPackages ? 'No Package' : 'No packages available'}
                        </option>
                        {packages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} - {pkg.currency}{pkg.price}/mo
                          </option>
                        ))}
                      </select>
                      <span className="text-[9px] text-gray-500">
                        {hasPackages
                          ? 'Optional: Assign this agent to a subscription package'
                          : 'No packages available. Please create a package first.'}
                      </span>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Deployment Card */}
              <SectionCard title="Deployment" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UrlInput 
                    label="Launch URL" 
                    value={formLaunchUrl} 
                    onChange={setFormLaunchUrl} 
                    required 
                    errorKey="launchUrl"
                  />
                  <UrlInput 
                    label="Live Demo URL" 
                    value={formLiveDemoUrl} 
                    onChange={setFormLiveDemoUrl} 
                    errorKey="liveDemoUrl"
                  />
                  <UrlInput 
                    label="Documentation URL" 
                    value={formDocUrl} 
                    onChange={setFormDocUrl} 
                    errorKey="docUrl"
                  />
                  <UrlInput 
                    label="GitHub URL" 
                    value={formGithubUrl} 
                    onChange={setFormGithubUrl} 
                    errorKey="githubUrl"
                  />
                  <div className="md:col-span-2">
                    <UrlInput 
                      label="API Endpoint" 
                      value={formApiEndpoint} 
                      onChange={setFormApiEndpoint} 
                      errorKey="apiEndpoint"
                    />
                  </div>
                </div>
              </SectionCard>

              {/* Agent Details Card */}
              <SectionCard title="Agent Details" icon={Settings}>
                <div className="space-y-4">
                  {/* Capabilities features text area */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-300">Agent Features (one per line)</label>
                    <textarea
                      rows={3}
                      placeholder="Multilingual support&#10;CRM Integration&#10;Automatic ticket assignment"
                      value={formFeatures}
                      onChange={(e) => setFormFeatures(e.target.value)}
                      className="phoenix-input resize-none py-2.5 text-sm"
                    />
                  </div>

                  {/* Models list pills */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-gray-300">Supported Models</span>
                    <div className="flex flex-wrap gap-2">
                      {MODELS_LIST.map(model => {
                        const isSelected = formSupportedModels.includes(model)
                        return (
                          <button
                            type="button"
                            key={model}
                            onClick={() => toggleModel(model)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                              isSelected 
                                ? "bg-[#FF6A00]/15 border-[#FF6A00] text-[#FF8A33] shadow-[0_0_12px_rgba(255,106,0,0.15)]" 
                                : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                            )}
                          >
                            {model}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Deployment type segmented control */}
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-xs font-medium text-gray-300">Deployment Type</span>
                    <div className="grid grid-cols-3 p-1 bg-zinc-950 border border-white/10 rounded-xl">
                      {DEPLOYMENT_TYPES.map(type => {
                        const isSelected = formDeploymentType === type
                        return (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setFormDeploymentType(type)}
                            className={cn(
                              "py-2 text-xs font-medium rounded-lg transition-all duration-200",
                              isSelected 
                                ? "bg-[#FF6A00] text-white shadow-lg shadow-[#FF6A00]/20" 
                                : "text-gray-400 hover:text-white"
                            )}
                          >
                            {type}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Media Card */}
              <SectionCard title="Media Assets" icon={ImageIcon}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <UploadCard 
                    label="Agent Logo" 
                    value={formLogo} 
                    onChange={setFormLogo} 
                    helperText="Icon format (SVG, PNG)" 
                  />
                  <UploadCard 
                    label="Banner Image" 
                    value={formBanner} 
                    onChange={setFormBanner} 
                    helperText="Wide background image" 
                  />
                  <UploadCard 
                    label="Preview Image" 
                    value={formPreview} 
                    onChange={setFormPreview} 
                    helperText="Form preview screenshot" 
                  />
                </div>
              </SectionCard>

              {/* Tags Selector Card */}
              <SectionCard title="Categorization Tags" icon={Tag}>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-gray-300">Multi-Select Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {TAGS_LIST.map(tag => {
                      const isSelected = formTags.includes(tag)
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                            isSelected 
                              ? "bg-[#FF6A00]/15 border-[#FF6A00] text-[#FF8A33]" 
                              : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </SectionCard>

              {/* AI Configuration Card */}
              <SectionCard title="AI Configuration" icon={Cpu}>
                <div className="space-y-4">
                  {/* AI Instructions */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-300">AI Instructions</label>
                    <textarea
                      rows={3}
                      placeholder="Specific instructions for how the AI should behave and respond..."
                      value={formAiInstructions}
                      onChange={(e) => setFormAiInstructions(e.target.value)}
                      className="phoenix-input resize-none py-2.5 text-sm"
                    />
                    <span className="text-[9px] text-gray-500">Guidelines for AI behavior and response patterns</span>
                  </div>

                  {/* Business Knowledge */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-300">Business Knowledge</label>
                    <textarea
                      rows={3}
                      placeholder="Domain-specific knowledge, business rules, and context the AI should understand..."
                      value={formBusinessKnowledge}
                      onChange={(e) => setFormBusinessKnowledge(e.target.value)}
                      className="phoenix-input resize-none py-2.5 text-sm"
                    />
                    <span className="text-[9px] text-gray-500">Industry-specific information and business context</span>
                  </div>

                  {/* System Prompt */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-300">System Prompt</label>
                    <textarea
                      rows={4}
                      placeholder="Base system prompt that defines the AI&apos;s core personality and behavior..."
                      value={formSystemPrompt}
                      onChange={(e) => setFormSystemPrompt(e.target.value)}
                      className="phoenix-input resize-none py-2.5 text-sm"
                    />
                    <span className="text-[9px] text-gray-500">Foundation prompt that sets the AI&apos;s fundamental behavior</span>
                  </div>
                </div>
              </SectionCard>

            </form>

            {/* Sticky Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-white/[0.06] bg-[#0A0A0C]/90 backdrop-blur-md sticky bottom-0 z-20">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] text-white text-sm font-semibold hover:from-[#FF8A33] hover:to-[#FF6A00] transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,106,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{saving ? 'Saving...' : 'Save Agent'}</span>
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
