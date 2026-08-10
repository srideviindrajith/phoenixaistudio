'use client'

import Link from 'next/link'
import { Mail, Phone, ArrowUpRight, Twitter, Linkedin, Github, Instagram } from 'lucide-react'

import { useSettings } from './settings-context'
import { BrandLogo } from '@/components/brand/brand-logo'

const footerLinks = {
  services: [
    { label: 'AI Development', href: '/services' },
    { label: 'Web Applications', href: '/services' },
    { label: 'Mobile Apps', href: '/services' },
    { label: 'Cloud Solutions', href: '/services' },
    { label: 'Data Analytics', href: '/services' },
  ],
  company: [
    { label: 'About Us', href: '/' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Contact', href: '/contact' },
    { label: 'Admin Portal', href: '/login' },
  ],
}

export function Footer() {
  const { settings } = useSettings()
  const siteName = settings.site_name || 'PhoenixAI Studio'
  const email = settings.contact_email || 'contact@phoenixai.studio'
  const phone = settings.contact_phone || '+1 (555) 123-4567'
  const instagram = settings.instagram_id || '@phoenixai.studio'
  const instagramUsername = instagram.replace('@', '')
  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/phoenixai', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/phoenixai', label: 'LinkedIn' },
    { icon: Github, href: 'https://github.com/phoenixai', label: 'GitHub' },
    { icon: Instagram, href: `https://instagram.com/${instagramUsername}`, label: 'Instagram' },
  ]

  return (
    <footer className="relative bg-[#030303] border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#FF6A00]/5 to-transparent blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="md:col-span-5">
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <BrandLogo size="medium" glow className="transition-transform duration-300 group-hover:scale-105" />
              </Link>

              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed text-base">
                {settings.footer_text || 'Transforming ideas into intelligent solutions. We build cutting-edge AI-powered applications that drive innovation and business growth.'}
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF6A00]/10 group-hover:scale-110">
                    <Mail className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <span className="text-sm">{email}</span>
                </a>
                <a
                  href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF6A00]/10 group-hover:scale-110">
                    <Phone className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <span className="text-sm">{phone}</span>
                </a>
                <a
                  href={`https://instagram.com/${instagramUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FF6A00]/10 group-hover:scale-110">
                    <Instagram className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <span className="text-sm">{instagram}</span>
                </a>
              </div>
            </div>

            {/* Services Column */}
            <div className="md:col-span-3">
              <h3 className="text-white font-semibold mb-6 text-lg">Services</h3>
              <ul className="space-y-3.5">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                    >
                      <span className="text-sm">{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#FF6A00]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="md:col-span-2">
              <h3 className="text-white font-semibold mb-6 text-lg">Company</h3>
              <ul className="space-y-3.5">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                    >
                      <span className="text-sm">{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#FF6A00]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Column */}
            <div className="md:col-span-2">
              <h3 className="text-white font-semibold mb-6 text-lg">Connect</h3>
              <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-all duration-500 hover:bg-[#FF6A00]/10 hover:border-[#FF6A00]/30 border border-transparent"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-[#FF6A00] transition-colors duration-300" />
                    {/* Glow on hover */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm bg-[#FF6A00]/20" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </div>
            </div>

            {/* Back to top button (optional decorative) */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF6A00] transition-colors duration-300"
            >
              <span>Back to top</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
