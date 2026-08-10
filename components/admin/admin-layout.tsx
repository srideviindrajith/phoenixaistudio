'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Package,
  FolderKanban,
  MessageSquareQuote,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  Cpu,
  PlayCircle,
  Layers,
  Briefcase,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/brand/brand-logo'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/modules', label: 'Modules', icon: Layers },
  { href: '/admin/core-systems', label: 'Core Systems', icon: Layers },
  { href: '/admin/ai-agents', label: 'AI Agents', icon: Cpu },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/services', label: 'Services', icon: Sparkles },
  { 
    href: '/admin/career-builder', 
    label: 'Career Builder', 
    icon: Briefcase,
    submenu: [
      { href: '/admin/career-builder', label: 'Dashboard' },
      { href: '/admin/packages', label: 'Packages' },
      { href: '/admin/career-builder/resume-templates', label: 'Resume Templates' },
      { href: '/admin/career-builder/portfolio-templates', label: 'Portfolio Templates' },
      { href: '/admin/career-builder/cover-letter-templates', label: 'Cover Letter Templates' },
      { href: '/admin/career-builder/resume-services', label: 'Resume Services' },
      { href: '/admin/career-builder/portfolio-services', label: 'Portfolio Services' },
      { href: '/admin/career-builder/cover-letter-services', label: 'Cover Letter Services' },
      { href: '/admin/career-builder/ai-generator', label: 'AI Generator' },
      { href: '/admin/career-builder/ats-analysis', label: 'ATS Analysis' },
      { href: '/admin/career-builder/export-center', label: 'Export Center' },
      { href: '/admin/career-builder/orders', label: 'Orders' },
      { href: '/admin/career-builder/analytics', label: 'Analytics' },
    ]
  },
  { href: '/admin/demo-models', label: 'Demo Models', icon: PlayCircle },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/portfolio', label: 'Portfolio', icon: FolderKanban },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/login', label: 'Logout', icon: LogOut, isLogout: true },
]

interface AdminInfo {
  id: string
  name: string
  email: string
}

interface NotificationInfo {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
  link?: string
}

const notificationIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<AdminInfo | null>(null)
  const [notifications, setNotifications] = useState<NotificationInfo[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{type: string; item: any}[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [moduleStates, setModuleStates] = useState<Record<string, any>>({})
  const notificationRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fetch admin info
  useEffect(() => {
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'
    if (isAuthRoute) return
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          setAdmin(data.admin)
        } else {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
        }
      })
      .catch(() => router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`))
  }, [router, pathname])

  // Fetch notifications
  const fetchNotifications = useCallback(() => {
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'
    if (isAuthRoute) return
    fetch('/api/notifications', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {})
  }, [pathname])

  // Fetch module states
  const fetchModuleStates = useCallback(() => {
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'
    if (isAuthRoute) return
    fetch('/api/modules')
      .then((res) => res.json())
      .then((data) => setModuleStates(data.modules || {}))
      .catch(() => {})
  }, [pathname])

  useEffect(() => {
    const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'
    if (isAuthRoute) return
    fetchNotifications()
    fetchModuleStates()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchModuleStates, pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearch(false)
      return
    }
    setShowSearch(true)

    const q = query.toLowerCase()
    const results: {type: string; item: any}[] = []

    // Search all entities
    try {
      const [
        leadsRes,
        packagesRes,
        projectsRes,
        testimonialsRes,
        agentsRes,
        modelsRes,
        systemsRes,
      ] = await Promise.all([
        fetch('/api/leads').then(r => r.json()),
        fetch('/api/packages').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/testimonials?all=true').then(r => r.json()),
        fetch('/api/ai-agents').then(r => r.json()),
        fetch('/api/demo-models').then(r => r.json()),
        fetch('/api/core-systems').then(r => r.json()),
      ])

      leadsRes.leads?.forEach((lead: any) => {
        if (lead.name?.toLowerCase().includes(q) || lead.email?.toLowerCase().includes(q)) {
          results.push({ type: 'lead', item: lead })
        }
      })

      packagesRes.packages?.forEach((pkg: any) => {
        if (pkg.name?.toLowerCase().includes(q)) {
          results.push({ type: 'package', item: pkg })
        }
      })

      projectsRes.projects?.forEach((project: any) => {
        if (project.title?.toLowerCase().includes(q) || project.category?.toLowerCase().includes(q)) {
          results.push({ type: 'project', item: project })
        }
      })

      testimonialsRes.testimonials?.forEach((testimonial: any) => {
        if (testimonial.name?.toLowerCase().includes(q)) {
          results.push({ type: 'testimonial', item: testimonial })
        }
      })

      agentsRes.agents?.forEach((agent: any) => {
        if (agent.name?.toLowerCase().includes(q) || agent.category?.toLowerCase().includes(q)) {
          results.push({ type: 'agent', item: agent })
        }
      })

      modelsRes.models?.forEach((model: any) => {
        if (model.title?.toLowerCase().includes(q) || model.category?.toLowerCase().includes(q)) {
          results.push({ type: 'model', item: model })
        }
      })

      systemsRes.systems?.forEach((system: any) => {
        if (system.name?.toLowerCase().includes(q) || system.category?.toLowerCase().includes(q)) {
          results.push({ type: 'system', item: system })
        }
      })
    } catch (e) {
      console.error('Search error:', e)
    }

    setSearchResults(results.slice(0, 8))
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      console.error(e)
    }
    router.replace('/logout')
    router.refresh()
  }

  const markNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PUT' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllRead = async () => {
    await Promise.all(
      notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: 'PUT' }))
    )
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNotificationClick = async (notification: NotificationInfo) => {
    if (!notification.read) {
      await markNotificationRead(notification.id)
    }
    setShowNotifications(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getSearchResultUrl = (type: string, id: string) => {
    switch (type) {
      case 'lead': return `/admin/leads?edit=${id}`
      case 'package': return `/admin/packages?edit=${id}`
      case 'project': return `/admin/projects?edit=${id}`
      case 'testimonial': return `/admin/testimonials?edit=${id}`
      case 'agent': return `/admin/ai-agents?edit=${id}`
      case 'model': return `/admin/demo-models?edit=${id}`
      case 'system': return `/admin/core-systems?edit=${id}`
      default: return '#'
    }
  }

  // Filter nav items based on module states
  const filteredNavItems = navItems.filter(item => {
    // Always show Dashboard, Settings, and Logout
    if (item.href === '/admin' || item.href === '/admin/settings' || item.isLogout) {
      return true
    }

    // Map href to module key
    const moduleKeyMap: Record<string, string> = {
      '/admin/modules': 'modules',
      '/admin/core-systems': 'core-systems',
      '/admin/ai-agents': 'ai-agents',
      '/admin/packages': 'packages',
      '/admin/services': 'services',
      '/admin/career-builder': 'career-builder',
      '/admin/demo-models': 'demo-models',
      '/admin/projects': 'projects',
      '/admin/portfolio': 'portfolio',
      '/admin/leads': 'leads',
      '/admin/testimonials': 'testimonials',
    }

    const moduleKey = moduleKeyMap[item.href]
    if (!moduleKey) return true

    const module = moduleStates[moduleKey]
    return module && module.adminEnabled !== false
  })

  const currentNavItem =
    filteredNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ||
    filteredNavItems[0]

  const isAuthRoute = pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'
  if (isAuthRoute) {
    return <div className="phoenix-shell dashboard-bg min-h-screen">{children}</div>
  }

  return (
    <div className="phoenix-shell dashboard-bg min-h-screen overflow-x-hidden">
      {/* Sidebar - Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-300',
          sidebarOpen ? 'bg-black/60 opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex w-72 flex-col overflow-hidden border-r border-white/[0.06] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_36px_rgba(255,106,0,0.08)] transition-transform duration-300 ease-out',
          'glass-strong',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <BrandLogo size="medium" glow className="transition-transform duration-300 group-hover:scale-105" />
            <div>
              <span className="text-sm font-bold text-white block leading-tight">PhoenixAI Studio</span>
              <span className="text-xs text-gray-500 block">Admin Panel</span>
            </div>
          </Link>
          <button
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-phoenix flex-1 space-y-1.5 overflow-y-auto px-1 py-4">
          {filteredNavItems.map((item, index) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            if (item.isLogout) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false)
                    handleLogout()
                  }}
                  className="group relative flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-left text-gray-400 transition-all duration-300 hover:border-[#FF6A00]/25 hover:bg-white/[0.045] hover:shadow-[0_0_24px_rgba(255,106,0,0.12)] hover:text-white"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10">
                    <item.icon className="w-4 h-4 group-hover:text-white" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            }

            const hasSubmenu = !!item.submenu
            const isSubmenuActive = hasSubmenu ? pathname.startsWith(item.href) : false

            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 transition-all duration-300 hover:border-[#FF6A00]/25 hover:bg-white/[0.045] hover:shadow-[0_0_24px_rgba(255,106,0,0.12)]',
                    isActive && !hasSubmenu
                      ? 'border-[#FF6A00]/30 bg-gradient-to-r from-[#FF6A00]/16 to-[#CC4F00]/8 text-[#FF8A33] shadow-[0_0_28px_rgba(255,106,0,0.12)]'
                      : (isSubmenuActive ? 'text-[#FF8A33]' : 'text-gray-400 hover:text-white')
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300',
                    (isActive && !hasSubmenu) || isSubmenuActive ? 'bg-[#FF6A00]/18' : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    <item.icon className={cn('w-4 h-4', (isActive && !hasSubmenu) || isSubmenuActive ? 'text-[#FF8A33]' : 'group-hover:text-white')} />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && !hasSubmenu && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>

                {item.submenu && isSubmenuActive && (
                  <div className="pl-12 space-y-1 relative before:absolute before:left-[27px] before:top-0 before:bottom-0 before:w-px before:bg-white/[0.06]">
                    {item.submenu.map((sub) => {
                      const isSubActive = pathname === sub.href
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            'block py-2 text-xs font-semibold tracking-wide transition-colors relative',
                            isSubActive 
                              ? 'text-[#FF8A33] drop-shadow-[0_0_8px_rgba(255,122,0,0.3)]' 
                              : 'text-gray-500 hover:text-gray-300'
                          )}
                        >
                          <span className={cn(
                            'absolute -left-[18px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-black transition-colors',
                            isSubActive ? 'bg-[#FF7A00] border-[#FF7A00]' : 'bg-zinc-800'
                          )}></span>
                          {sub.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-white/[0.06] px-1 pt-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-gray-400 transition-all duration-300 hover:border-[#FF6A00]/25 hover:bg-[#FF6A00]/10 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.04] p-3 lg:p-4">
          <div className="glass flex h-16 items-center justify-between gap-4 rounded-2xl px-4 lg:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
            {/* Left side */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>

              <Link href="/admin" className="hidden items-center md:inline-flex lg:hidden">
                <BrandLogo size="small" glow />
              </Link>

              <div className="min-w-0 flex-shrink-0">
                <p className="truncate font-heading text-base font-semibold text-white">{currentNavItem.label}</p>
                <p className="hidden sm:block text-xs text-gray-500 truncate">PhoenixAI Studio admin</p>
              </div>

              {/* Search */}
              <div ref={searchRef} className="relative flex-1 max-w-xl hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search leads, projects, packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="phoenix-input w-full py-2.5 pl-10 pr-4"
                />

                {/* Search Results Dropdown */}
                {showSearch && (
                  <div className="glass-strong absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl shadow-xl">
                    {searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((result) => {
                          const Icon =
                            result.type === 'lead' ? Users :
                              result.type === 'package' ? Package :
                                result.type === 'project' ? FolderKanban :
                                  result.type === 'agent' ? Cpu :
                                    result.type === 'model' ? PlayCircle :
                                      result.type === 'system' ? Layers :
                                        MessageSquareQuote
                          return (
                            <Link
                              key={`${result.type}-${result.item.id}`}
                              href={getSearchResultUrl(result.type, result.item.id)}
                              onClick={() => {
                                setShowSearch(false)
                                setSearchQuery('')
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Icon className="w-4 h-4 text-[#FF6A00]" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">
                                  {result.item.name || result.item.title}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{result.type}</p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        No results found for &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl p-2.5 text-gray-400 transition-all hover:bg-white/5 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="glass-strong absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl shadow-xl sm:w-96">
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#FF6A00] hover:text-[#FF8A33] transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 6).map((notification) => {
                          const Icon = notificationIcons[notification.type] || Info
                          const bgColors: Record<string, string> = {
                            info: 'from-[#3b82f6]/20 to-transparent',
                            success: 'from-[#22c55e]/20 to-transparent',
                            warning: 'from-[#f59e0b]/20 to-transparent',
                            error: 'from-[#ef4444]/20 to-transparent',
                          }
                          return (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={cn(
                                'p-4 border-b border-white/5 transition-all duration-300 hover:bg-white/5 cursor-pointer',
                                !notification.read && 'bg-gradient-to-r ' + (bgColors[notification.type] || 'from-[#FF6A00]/10')
                              )}
                            >
                              <div className="flex gap-3">
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                  notification.type === 'success' ? 'bg-[#10B981]/20' : notification.type === 'warning' ? 'bg-[#F59E0B]/20' : notification.type === 'error' ? 'bg-[#EF4444]/20' : 'bg-[#FF6A00]/20'
                                )}>
                                  <Icon className={cn('w-4 h-4', notification.type === 'success' ? 'text-[#10B981]' : notification.type === 'warning' ? 'text-[#F59E0B]' : notification.type === 'error' ? 'text-[#EF4444]' : 'text-[#FF6A00]')} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white mb-1">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {!notification.read && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          markNotificationRead(notification.id)
                                        }}
                                        className="text-xs text-[#FF6A00] hover:underline"
                                      >
                                        Mark as read
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id)
                                      }}
                                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 lg:gap-3 p-1.5 lg:px-3 lg:py-2 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#CC4F00] font-bold text-white shadow-lg shadow-[#FF6A00]/20">
                    {admin?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">{admin?.email}</p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 hidden lg:block transition-transform', showProfileMenu && 'rotate-180')} />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="glass-strong absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl shadow-xl">
                    <div className="p-4 border-b border-white/5">
                      <p className="font-medium text-white">{admin?.name}</p>
                      <p className="text-sm text-gray-400">{admin?.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto flex-1 w-full max-w-7xl px-4 pb-8 pt-3 lg:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  )
}
