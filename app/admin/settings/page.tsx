'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, AlertCircle, CheckCircle, Globe, Mail, Sparkles, UploadCloud, Trash2 } from 'lucide-react'
import { useSettings } from '@/components/public/settings-context'
import { BrandLogo } from '@/components/brand/brand-logo'

interface Settings {
  [key: string]: string
}

const settingGroups = [
  {
    title: 'Site Information',
    icon: Globe,
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'PhoenixAI Studio' },
      { key: 'site_tagline', label: 'Site Tagline', type: 'text', placeholder: 'Build the Future with AI' },
      { key: 'footer_text', label: 'Footer Text', type: 'text', placeholder: 'Short description for footer' },
    ],
  },
  {
    title: 'Hero Section',
    icon: Sparkles,
    fields: [
      { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Build the Future with AI' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Your main call to action...' },
      { key: 'cta_button_text', label: 'CTA Button Text', type: 'text', placeholder: 'Get Started' },
    ],
  },
  {
    title: 'Contact Information',
    icon: Mail,
    fields: [
      { key: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'contact@phoenixai.studio' },
      { key: 'contact_phone', label: 'Contact Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
      { key: 'instagram_id', label: 'Instagram ID', type: 'text', placeholder: '@phoenixai.studio' },
    ],
  },
]

const statsFields = [
  { key: 'hero_stats_projects', label: 'Projects', placeholder: '150+' },
  { key: 'hero_stats_clients', label: 'Clients', placeholder: '50+' },
  { key: 'hero_stats_experience', label: 'Experience', placeholder: '5+' },
  { key: 'hero_stats_satisfaction', label: 'Satisfaction', placeholder: '99%' },
]

export default function AdminSettingsPage() {
  const { refreshSettings } = useSettings()
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeGroup, setActiveGroup] = useState(0)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      const incoming = data.settings || {}
      setSettings({
        ...incoming,
        instagram_id: incoming.instagram_id || '',
      })
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const settingsToSave = Object.fromEntries(
        Object.entries(settings).filter(
          ([key]) => !['logo_url', 'siteName'].includes(key)
        )
      )

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave, type: 'text' }),
      })

      if (!res.ok) {
        throw new Error('Settings request failed')
      }

      await refreshSettings()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure your website settings</p>
        </div>
      </div>

      {/* Status Messages */}
      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-green-400 text-sm">Settings saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Brand Logo Section */}
      <div className="glass-card mb-6 rounded-[20px] p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="phoenix-icon-box h-10 w-10">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Brand Logo</h3>
            <p className="text-sm text-[#A1A1AA]">One logo source for public, login, and admin surfaces.</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-[20px] border border-[#FF6A00]/20 bg-[#050505]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <BrandLogo src={settings.logo_url} size="large" glow />
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="brand-logo-upload"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const form = new FormData();
                form.append('logo', file);
                const res = await fetch('/api/settings/logo', { method: 'POST', body: form });
                const data = await res.json();
                if (data.success) {
                  const cacheBustedUrl = `${data.logo_url}?v=${Date.now()}`;
                  setSettings((prev) => ({ ...prev, logo_url: cacheBustedUrl }));
                  await refreshSettings({ cacheBustLogo: true });
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="brand-logo-upload"
              className="phoenix-button cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Logo
            </label>

            <button
              type="button"
              onClick={async () => {
                const res = await fetch('/api/settings/logo', { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                  setSettings((prev) => ({ ...prev, logo_url: '' }));
                  await refreshSettings();
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 text-sm font-semibold text-red-300 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Settings Groups - Mobile Tabs */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {settingGroups.map((group, index) => (
            <button
              key={group.title}
              onClick={() => setActiveGroup(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeGroup === index
                  ? 'bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20'
                  : 'bg-[#0a0a0a] text-gray-400 border border-white/5 hover:border-[#FF6A00]/20'
              }`}
            >
              <group.icon className="w-4 h-4" />
              {group.title}
            </button>
          ))}
        </div>

        {settingGroups.map((group, index) => (
          activeGroup === index && (
            <div key={group.title} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 space-y-4">
              {group.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A00]/50 transition-all resize-none"
                      placeholder={field.placeholder}
                      value={settings[field.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A00]/50 transition-all"
                      placeholder={field.placeholder}
                      value={settings[field.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block space-y-6">
        {settingGroups.map((group) => (
          <div key={group.title} className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                <group.icon className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <h2 className="text-lg font-semibold text-white">{group.title}</h2>
            </div>
            <div className="p-5 grid grid-cols-2 gap-6">
              {group.fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A00]/50 transition-all resize-none"
                      placeholder={field.placeholder}
                      value={settings[field.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A00]/50 transition-all"
                      placeholder={field.placeholder}
                      value={settings[field.key] || ''}
                      onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hero Stats */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#FF6A00]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Hero Statistics</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsFields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
              <input
                type="text"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF6A00]/50 transition-all"
                placeholder={field.placeholder}
                value={settings[field.key] || ''}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] text-white font-medium hover:shadow-lg hover:shadow-[#FF6A00]/20 disabled:opacity-70 transition-all"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save All Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
