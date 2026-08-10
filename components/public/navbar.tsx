'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Menu, Shield, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from './settings-context'
import { BrandLogo } from '@/components/brand/brand-logo'
import { getPublicNavLinks } from '@/lib/modules'

const baseNavLinks = [
  { href: '/', label: 'Home', module: null },
  { href: '/services', label: 'Services', module: 'services' },
  { href: '/ai-agents', label: 'AI Agents', module: 'ai-agents' },
  { href: '/demo-models', label: 'Demo Models', module: 'demo-models' },
  { href: '/core-systems', label: 'Core Systems', module: 'core-systems' },
  { href: '/portfolio', label: 'Portfolio', module: 'portfolio' },
  { href: '/packages', label: 'Packages', module: 'packages' },
  { href: '/career-builder', label: 'Career Builder', module: 'career-builder' },
]

function getInstagramUsername(value?: string) {
  const fallback = 'phoenixai.studio'
  const normalized = (value || '')
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]

  return normalized || fallback
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { settings } = useSettings()
  const [moduleStates, setModuleStates] = useState<Record<string, any>>({})
  const [loadingModules, setLoadingModules] = useState(true)

  const instagramUsername = useMemo(
    () => getInstagramUsername(settings?.instagram_id),
    [settings?.instagram_id]
  )
  const instagramHref = `https://instagram.com/${instagramUsername}`

  // Fetch module states
  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        setModuleStates(data.modules || {})
        setLoadingModules(false)
      })
      .catch(() => setLoadingModules(false))
  }, [])

  // Filter nav links based on module states
  const navLinks = useMemo(() => {
    if (loadingModules) return baseNavLinks
    return baseNavLinks.filter(link => {
      if (!link.module) return true
      const module = moduleStates[link.module]
      return module && module.publicEnabled !== false
    })
  }, [moduleStates, loadingModules])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isActiveRoute = (href: string) =>
    href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const navItemClass = (isActive: boolean) =>
    cn(
      'group relative inline-flex h-9 items-center whitespace-nowrap text-sm font-medium transition-all duration-300',
      isActive
        ? 'text-[#FF8A33] drop-shadow-[0_0_10px_rgba(255,106,0,0.45)]'
        : 'text-gray-300 hover:text-[#FF8A33] hover:drop-shadow-[0_0_10px_rgba(255,106,0,0.35)]'
    )

  const mobileItemClass = (isActive: boolean) =>
    cn(
      'relative rounded-xl border px-3 py-3 text-xs font-medium transition-all duration-300',
      isActive
        ? 'border-[#FF6A00]/40 bg-[#FF6A00]/10 text-[#FF8A33] shadow-[0_0_18px_rgba(255,106,0,0.12)]'
        : 'border-white/10 bg-white/[0.03] text-gray-300 hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF8A33]'
    )

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full rounded-b-2xl border-b border-[#FF6A00]/20 bg-black/70 backdrop-blur-xl transition-all duration-300',
        scrolled
          ? 'shadow-[0_18px_48px_rgba(0,0,0,0.42),0_0_26px_rgba(249,115,22,0.12)]'
          : 'shadow-[0_10px_32px_rgba(249,115,22,0.08)]'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <BrandLogo size="small" glow className="transition-transform duration-300 group-hover:scale-105" />
          <span className="min-w-0 truncate text-lg font-semibold text-white transition-all duration-300 group-hover:text-[#FF8A33] group-hover:drop-shadow-[0_0_10px_rgba(255,106,0,0.35)]">
            PhoenixAI Studio
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center 2xl:flex">
          <div className="flex items-center justify-center gap-8">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={navItemClass(isActive)}
                >
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-[#FF8A33] to-transparent transition-transform duration-300',
                      isActive ? 'scale-x-100' : 'group-hover:scale-x-100'
                    )}
                  />
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FF8A33] shadow-[0_0_14px_rgba(255,138,51,0.95)]" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-4 2xl:flex">
          <a
            href={instagramHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#FF6A00]/20 bg-white/[0.03] text-gray-300 transition-all duration-300 hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF8A33] hover:shadow-[0_0_22px_rgba(255,106,0,0.16)]"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <Link
            href="/contact"
            className="phoenix-button h-10 px-4 py-2"
          >
            Contact
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#FF6A00]/30 bg-white/[0.03] px-4 text-sm font-medium text-gray-200 transition-all duration-300 hover:bg-[#FF6A00]/10 hover:text-white hover:shadow-[0_0_22px_rgba(255,106,0,0.14)]"
          >
            <Shield className="h-4 w-4 text-[#FF8A33]" />
            Admin Panel
          </Link>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={isOpen}
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FF6A00]/20 bg-white/[0.03] text-gray-200 transition-all duration-300 hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF8A33] 2xl:hidden',
            isOpen && 'border-[#FF6A00]/50 bg-[#FF6A00]/10 text-[#FF8A33] shadow-[0_0_22px_rgba(255,106,0,0.16)]'
          )}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className={cn('transition-all duration-300', isOpen ? 'rotate-90' : 'rotate-0')}>
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </span>
        </button>
      </div>

      <div
        aria-hidden={!isOpen}
        className={cn(
          'absolute left-0 right-0 top-full overflow-hidden rounded-b-2xl border-b border-[#FF6A00]/20 bg-black/[0.88] shadow-[0_24px_60px_rgba(0,0,0,0.55),0_0_28px_rgba(255,106,0,0.1)] backdrop-blur-xl transition-all duration-300 2xl:hidden',
          isOpen ? 'max-h-[620px] translate-y-0 opacity-100' : 'pointer-events-none max-h-0 -translate-y-3 opacity-0'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => setIsOpen(false)}
                  className={mobileItemClass(isActive)}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FF8A33] shadow-[0_0_12px_rgba(255,138,51,0.95)]" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-3 sm:gap-4">
            <a
              href={instagramHref}
              target="_blank"
              rel="noreferrer"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#FF6A00]/20 bg-white/[0.03] px-4 text-xs font-medium text-gray-200 transition-all duration-300 hover:border-[#FF6A00]/40 hover:bg-[#FF6A00]/10 hover:text-[#FF8A33]"
            >
              <Instagram className="h-3.5 w-3.5" />
              Instagram
            </a>
            <Link
              href="/contact"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              className="phoenix-button h-10 w-full px-4 py-2 text-xs"
            >
              Contact
            </Link>
            <Link
              href="/login"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#FF6A00]/30 bg-white/[0.03] px-4 text-xs font-medium text-gray-200 transition-all duration-300 hover:bg-[#FF6A00]/10 hover:text-white"
            >
              <Shield className="h-3.5 w-3.5 text-[#FF8A33]" />
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
