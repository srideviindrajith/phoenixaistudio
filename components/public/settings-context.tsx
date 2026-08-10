'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Settings {
  site_name: string
  site_tagline: string
  hero_title: string
  hero_subtitle: string
  contact_email: string
  contact_phone: string
  instagram_id: string
  logo_url: string
  footer_text: string
  [key: string]: string
}

const defaultSettings: Settings = {
  site_name: 'PhoenixAI Studio',
  site_tagline: 'Build the Future with AI',
  hero_title: 'Build the Future with AI',
  hero_subtitle: 'We transform your ideas into intelligent, scalable applications powered by cutting-edge artificial intelligence technology.',
  contact_email: 'contact@phoenixai.studio',
  contact_phone: '+1 (555) 123-4567',
  instagram_id: '@phoenixai.studio',
  logo_url: '',
  hero_stats_projects: 'Accepting New Projects',
  hero_stats_clients: 'Growing Portfolio',
  hero_stats_experience: `Founded ${new Date().getFullYear()}`,
  hero_stats_satisfaction: 'New Startup',
  footer_text: 'Transforming ideas into intelligent solutions.',
  cta_button_text: 'Get Started',
}

const SettingsContext = createContext<{
  settings: Settings
  loading: boolean
  refreshSettings: (options?: { cacheBustLogo?: boolean }) => Promise<void>
}>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async (options?: { cacheBustLogo?: boolean }) => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        const logoUrl = data.settings.logo_url || ''
        const logo_url = logoUrl && options?.cacheBustLogo ? `${logoUrl}?t=${Date.now()}` : logoUrl
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
          instagram_id: data.settings.instagram_id || prev.instagram_id,
          logo_url,
        }))
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    }
  }

  useEffect(() => {
    setLoading(true)
    refreshSettings().finally(() => setLoading(false))
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
