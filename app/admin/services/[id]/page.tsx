'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, X, Sparkles, Eye, Upload, Settings, Globe, Layout, Check, AlertCircle, Clock, ChevronRight, GripVertical, Trash2, Star, Zap, Monitor, Tablet, Smartphone, Undo, Redo, RefreshCw, Maximize2, Minimize2 } from 'lucide-react'
import { getServiceIcon } from '@/lib/service-icon-engine'
import { getServiceColorScheme } from '@/lib/service-color-engine'
import Link from 'next/link'

interface ServiceFormData {
  name: string
  slug: string
  category: string
  tagline: string
  description: string
  features: string[]
  benefits: string[]
  technologies: string[]
  ctaButtonText: string
  ctaLink: string
  icon: string
  gradient: string
  accentColor: string
  thumbnail: string
  coverImage: string
  backgroundGradient: string
  status: 'draft' | 'published'
  visibility: 'public' | 'private'
  featured: boolean
  order: number
  badge: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')
  // Section refs for scrolling
  const basicRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const seoRef = useRef<HTMLDivElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const publishRef = useRef<HTMLDivElement>(null)
  const sectionRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    basic: basicRef,
    description: descriptionRef,
    features: featuresRef,
    media: mediaRef,
    seo: seoRef,
    display: displayRef,
    publish: publishRef,
  }
  const [featureInput, setFeatureInput] = useState('')
  
  // New UI states
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false)
  const [undoStack, setUndoStack] = useState<ServiceFormData[]>([])
  const [redoStack, setRedoStack] = useState<ServiceFormData[]>([])
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    slug: '',
    category: '',
    tagline: '',
    description: '',
    features: [],
    benefits: [],
    technologies: [],
    ctaButtonText: 'Learn More',
    ctaLink: '/contact',
    icon: '',
    gradient: '',
    accentColor: '',
    thumbnail: '',
    coverImage: '',
    backgroundGradient: '',
    status: 'draft',
    visibility: 'private',
    featured: false,
    order: 0,
    badge: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })

  useEffect(() => {
    fetchService()
  }, [params.id])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`)
      const data = await response.json()
      
      setFormData({
        name: data.name,
        slug: data.slug || '',
        category: data.category,
        tagline: data.tagline || '',
        description: data.description,
        features: data.features ? data.features.split('\n').filter((f: string) => f.trim()) : [],
        benefits: data.benefits ? data.benefits.split('\n').filter((f: string) => f.trim()) : [],
        technologies: data.technologies ? data.technologies.split('\n').filter((f: string) => f.trim()) : [],
        ctaButtonText: data.ctaButtonText || 'Learn More',
        ctaLink: data.ctaLink || '/contact',
        icon: data.icon || '',
        gradient: data.gradient || '',
        accentColor: data.accentColor || '',
        thumbnail: data.thumbnail || '',
        coverImage: data.coverImage || '',
        backgroundGradient: data.backgroundGradient || '',
        status: data.status,
        visibility: data.visibility,
        featured: data.featured || false,
        order: data.order,
        badge: data.badge || '',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        seoKeywords: data.seoKeywords || ''
      })
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setUndoStack(prev => [...prev, { ...formData }])
      setRedoStack([])
      
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }))
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setUndoStack(prev => [...prev, { ...formData }])
    setRedoStack([])
    
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1]
      setRedoStack(prev => [...prev, formData])
      setUndoStack(prev => prev.slice(0, -1))
      setFormData(previousState)
    }
  }, [undoStack, formData])

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack(prev => [...prev, formData])
      setRedoStack(prev => prev.slice(0, -1))
      setFormData(nextState)
    }
  }, [redoStack, formData])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  // Smart features
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200
    const words = text.split(/\s+/).filter(word => word.length > 0).length
    return Math.ceil(words / wordsPerMinute)
  }

  const generateSEOKeywords = (name: string, category: string, description: string) => {
    const keywords = [name, category]
    const descWords = description.split(' ').filter(word => word.length > 3)
    keywords.push(...descWords.slice(0, 5))
    return keywords.join(', ')
  }

  // Auto-generate functions
  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(formData.name) }))
    }
  }, [formData.name])

  useEffect(() => {
    if (formData.name || formData.category) {
      const colorScheme = getServiceColorScheme(formData.category, formData.name, formData.description)
      setFormData(prev => ({
        ...prev,
        accentColor: colorScheme.primary,
        gradient: colorScheme.gradient,
        backgroundGradient: colorScheme.gradient
      }))
    }
  }, [formData.name, formData.category, formData.description])

  useEffect(() => {
    if (formData.name && formData.category && !formData.seoTitle) {
      setFormData(prev => ({ ...prev, seoTitle: `${formData.name} - ${formData.category} Service` }))
    }
  }, [formData.name, formData.category])

  useEffect(() => {
    if (formData.description && !formData.seoKeywords) {
      setFormData(prev => ({ ...prev, seoKeywords: generateSEOKeywords(formData.name, formData.category, formData.description) }))
    }
  }, [formData.description, formData.name, formData.category])

  // Track unsaved changes and auto-save simulation
  useEffect(() => {
    setHasUnsavedChanges(true)
    
    // Simulate auto-save
    const timer = setTimeout(() => {
      setAutoSaving(true)
      setTimeout(() => {
        setAutoSaving(false)
        setLastAutoSave(new Date())
      }, 1000)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [formData])

  // Navigation sections
  const navigationSections = [
    { id: 'basic', label: 'Basic Information', icon: Sparkles, completed: !!formData.name && !!formData.category },
    { id: 'description', label: 'Description', icon: Layout, completed: !!formData.description },
    { id: 'features', label: 'Features', icon: Zap, completed: formData.features.length > 0 },
    { id: 'media', label: 'Media', icon: Upload, completed: !!formData.thumbnail },
    { id: 'seo', label: 'SEO', icon: Globe, completed: !!formData.seoTitle },
    { id: 'display', label: 'Display Settings', icon: Settings, completed: true },
    { id: 'publish', label: 'Publish', icon: Check, completed: formData.status === 'published' }
  ]

  // Intersection observer to sync active section on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80% 0px',
      threshold: 0,
    }
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id
          if (id) {
            setActiveSection(id)
          }
        }
      })
    }
    const observer = new IntersectionObserver(observerCallback, observerOptions)
    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current)
    })
    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/services/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setHasUnsavedChanges(false)
        router.push('/admin/services')
      }
    } catch (error) {
      console.error('Error updating service:', error)
    } finally {
      setSaving(false)
    }
  }

  const Icon = getServiceIcon(formData.name, formData.category, formData.description)
  const colorScheme = getServiceColorScheme(formData.category, formData.name, formData.description)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A2E] to-[#0A0A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF6A00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading service...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A2E] to-[#0A0A1A]">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A1A]/80 border-b border-[#2A2A4A]">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/services"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">Edit Service</h1>
              <p className="text-xs text-gray-400">Update your service offering</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-2 rounded-lg hover:bg-[#2A2A4A] text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-2 rounded-lg hover:bg-[#2A2A4A] text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-xs text-orange-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
              {autoSaving && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {lastAutoSave && !autoSaving && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Saved {lastAutoSave.toLocaleTimeString()}</span>
                </div>
              )}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                formData.status === 'published' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  formData.status === 'published' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <span className="capitalize">{formData.status}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2A4A] hover:bg-[#3A3A5A] text-white rounded-lg transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              {isPreviewMaximized ? 'Exit Preview' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={async () => {
                setSaving(true)
                try {
                  const response = await fetch(`/api/services/${params.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, status: 'draft' })
                  })
                  if (response.ok) {
                    setHasUnsavedChanges(false)
                    setLastAutoSave(new Date())
                  }
                } catch (error) {
                  console.error('Error saving draft:', error)
                } finally {
                  setSaving(false)
                }
              }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#2A2A4A] hover:bg-[#3A3A5A] text-white rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="submit"
              form="service-form"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] hover:bg-[#FF8A33] text-white rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6A00]/20"
            >
              {saving ? 'Saving...' : 'Publish'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <form id="service-form" onSubmit={handleSubmit} className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Navigation */}
        <div className="w-[20%] border-r border-[#2A2A4A] bg-[#0A0A1A]/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4 space-y-1">
            {navigationSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                      setActiveSection(section.id)
                      const ref = sectionRefs[section.id]
                      if (ref?.current) {
                        ref.current.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left group ${
                    activeSection === section.id
                      ? 'bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20'
                      : 'text-gray-400 hover:text-white hover:bg-[#2A2A4A]/50'
                  }`}
                >
                  <div className={`relative ${section.completed ? 'text-green-400' : ''}`}>
                    <Icon className="w-5 h-5" />
                    {section.completed && (
                      <Check className="absolute -top-1 -right-1 w-3 h-3 bg-[#0A0A1A] rounded-full" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Center - Form Cards */}
        <div className="w-[45%] overflow-y-auto p-6 space-y-6 pb-16">
          {/* Card 1: Basic Information */}
          <div id="basic" ref={basicRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Sparkles className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Basic Information</h2>
                <p className="text-xs text-gray-400 font-medium">Define your service identity</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Service Name */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Service Name
                </label>
                {formData.name && (
                  <div className="absolute right-3 top-3 text-green-400">
                    <Check className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Category
                </label>
                <p className="mt-1 text-xs text-gray-500">e.g., AI, Web, Mobile, Cloud, Security</p>
              </div>

              {/* Slug */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  URL Slug
                </label>
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  Auto-generated
                </div>
              </div>

              {/* Tagline */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Tagline
                </label>
                <p className="mt-1 text-xs text-gray-500">Short catchy phrase</p>
              </div>
            </div>
          </div>

          {/* Card 2: Description */}
          <div id="description" ref={descriptionRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Layout className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Description</h2>
                <p className="text-xs text-gray-400 font-medium">Detailed service information</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer resize-none"
                  placeholder=" "
                  required
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Service Description
                </label>
                <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                  {formData.description.length} chars · {calculateReadingTime(formData.description)} min read
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Features */}
          <div id="features" ref={featuresRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Zap className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Features</h2>
                <p className="text-xs text-gray-400 font-medium">Key service capabilities</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                    placeholder="Add a feature..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-3 bg-[#FF6A00] hover:bg-[#FF8A33] text-white rounded-xl transition-all shadow-lg shadow-[#FF6A00]/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.features.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-[#2A2A4A] rounded-xl">
                    <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No features yet</p>
                    <p className="text-xs text-gray-600">Add your first feature above</p>
                  </div>
                ) : (
                  formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-[#0A0A1A]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl group hover:border-[#FF6A00]/30 transition-all"
                    >
                      <GripVertical className="w-5 h-5 text-gray-600 cursor-move" />
                      <span className="flex-1 text-sm text-gray-300">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Media */}
          <div id="media" ref={mediaRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Upload className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Media</h2>
                <p className="text-xs text-gray-400 font-medium">Visual assets</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Thumbnail URL
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Cover Image URL
                </label>
              </div>

              <div className="p-4 bg-[#0A0A1A]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg" style={{ background: colorScheme.gradient }} />
                  <span className="text-sm text-gray-400">Auto-generated gradient</span>
                </div>
                <input
                  type="text"
                  value={formData.backgroundGradient}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundGradient: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-lg text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all"
                  placeholder="Custom gradient"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Display Settings */}
          <div id="display" ref={displayRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Settings className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Display Settings</h2>
                <p className="text-xs text-gray-400 font-medium">Visibility and ordering</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <label className="absolute left-4 -top-2.5 text-xs text-[#FF6A00] bg-[#1A1A2E] px-1">
                    Status
                  </label>
                </div>

                <div className="relative">
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                    className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                  <label className="absolute left-4 -top-2.5 text-xs text-[#FF6A00] bg-[#1A1A2E] px-1">
                    Visibility
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  min="0"
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Display Order
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Badge Text
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A1A]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Featured Service</p>
                    <p className="text-xs text-gray-500">Highlight this service</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    formData.featured ? 'bg-[#FF6A00]' : 'bg-[#2A2A4A]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      formData.featured ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Card 6: SEO */}
          <div id="seo" ref={seoRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <Globe className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">SEO</h2>
                <p className="text-xs text-gray-400 font-medium">Search engine optimization</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  SEO Title
                </label>
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  {formData.seoTitle.length}/60
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer resize-none"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  SEO Description
                </label>
                <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                  {formData.seoDescription.length}/160
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Keywords
                </label>
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  Auto-generated
                </div>
              </div>
            </div>
          </div>

          {/* Card 7: CTA */}
          <div id="publish" ref={publishRef} className="bg-[#1A1A2E]/60 backdrop-blur-xl border border-[#2A2A4A] rounded-2xl p-6 transition-all hover:border-[#FF6A00]/30 hover:shadow-xl hover:shadow-[#FF6A00]/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF6A00]/5 flex items-center justify-center border border-[#FF6A00]/20 shadow-lg shadow-[#FF6A00]/10">
                <ChevronRight className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Call to Action</h2>
                <p className="text-xs text-gray-400 font-medium">Button configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={formData.ctaButtonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Button Text
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.ctaLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#0A0A1A]/50 backdrop-blur-sm border border-[#2A2A4A] rounded-xl text-white focus:outline-none focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20 transition-all peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#FF6A00] peer-focus:bg-[#1A1A2E] peer-focus:px-1 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500">
                  Link
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className={`w-[35%] border-l border-[#2A2A4A] bg-[#0A0A1A]/30 backdrop-blur-sm p-6 overflow-y-auto transition-all duration-300 ${
          isPreviewMaximized ? 'fixed inset-0 z-50 w-full h-full border-l-0' : ''
        }`}>
          <div className="sticky top-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#FF6A00]" />
                <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Device Toggle */}
                <div className="flex items-center gap-1 bg-[#1A1A2E]/50 rounded-lg p-1 border border-[#2A2A4A]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-2 rounded-md transition-all ${
                      previewDevice === 'desktop' 
                        ? 'bg-[#FF6A00]/20 text-[#FF6A00]' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Desktop"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-2 rounded-md transition-all ${
                      previewDevice === 'tablet' 
                        ? 'bg-[#FF6A00]/20 text-[#FF6A00]' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Tablet"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-2 rounded-md transition-all ${
                      previewDevice === 'mobile' 
                        ? 'bg-[#FF6A00]/20 text-[#FF6A00]' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    title="Mobile"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>

                {/* Maximize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                  className="p-2 rounded-lg hover:bg-[#2A2A4A] text-gray-400 hover:text-white transition-all"
                  title={isPreviewMaximized ? 'Minimize' : 'Maximize'}
                >
                  {isPreviewMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Preview Container with Device Width */}
            <div className={`mx-auto transition-all duration-300 ${
              previewDevice === 'desktop' ? 'w-full' :
              previewDevice === 'tablet' ? 'w-[768px]' :
              'w-[375px]'
            }`}>
              {/* Preview Card */}
              <div className="relative bg-gradient-to-br from-[#1A1A2E] to-[#0A0A1A] border border-[#2A2A4A] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#FF6A00]/10 group">
                {/* Background Gradient */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{ background: colorScheme.gradient }}
                />

                {/* Card Content */}
                <div className="relative p-6">
                  {/* Badge */}
                  {formData.badge && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#FF6A00] text-white text-xs font-medium rounded-full">
                      {formData.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className="relative mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${colorScheme.primary}20, ${colorScheme.primary}05)`,
                        border: `1px solid ${colorScheme.primary}30`,
                        boxShadow: `0 0 30px ${colorScheme.primary}20`,
                      }}
                    >
                      <Icon
                        className="w-8 h-8 transition-all duration-300"
                        style={{ color: colorScheme.primary }}
                      />
                    </div>
                    {/* Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-60 blur-2xl transition-opacity duration-300"
                      style={{ background: colorScheme.glow }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300 group-hover:text-[#FF6A00]">
                    {formData.name || 'Service Name'}
                  </h3>

                  {/* Tagline */}
                  {formData.tagline && (
                    <p className="text-sm text-[#FF6A00] mb-3 font-medium">
                      {formData.tagline}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed line-clamp-3">
                    {formData.description || 'Service description will appear here...'}
                  </p>

                  {/* Features */}
                  {formData.features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {formData.features.slice(0, 4).map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-xs text-gray-400 transition-all duration-300"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: colorScheme.primary }}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {formData.features.length > 4 && (
                        <li className="text-xs text-gray-500">
                          +{formData.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  )}

                  {/* CTA Button */}
                  <button
                    className="w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      background: colorScheme.gradient,
                      boxShadow: `0 4px 20px ${colorScheme.primary}30`,
                    }}
                  >
                    {formData.ctaButtonText || 'Learn More'}
                  </button>

                  {/* Featured Star */}
                  {formData.featured && (
                    <div className="absolute top-4 left-4">
                      <Star className="w-5 h-5 text-[#FF6A00] fill-[#FF6A00]" />
                    </div>
                  )}
                </div>

                {/* Bottom Accent */}
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${colorScheme.primary}, transparent)`,
                  }}
                />
              </div>
            </div>

            {/* Preview Info */}
            <div className="mt-4 p-4 bg-[#1A1A2E]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                Preview updates in real-time as you type
              </p>
            </div>

            {/* Auto Branding Preview */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#1A1A2E]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme.primary}20, ${colorScheme.primary}05)`,
                    border: `1px solid ${colorScheme.primary}30`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: colorScheme.primary }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Auto Icon</p>
                  <p className="text-xs text-gray-500">Based on category</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#1A1A2E]/30 backdrop-blur-sm border border-[#2A2A4A] rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ background: colorScheme.gradient }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Auto Gradient</p>
                  <p className="text-xs text-gray-500">{colorScheme.primary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
