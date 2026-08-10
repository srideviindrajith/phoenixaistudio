'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Building2, Clock, MapPin, Phone, Mail, CreditCard, Tag, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SalonSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    businessName: '',
    logo: '',
    whatsappNumber: '',
    email: '',
    address: '',
    openingHours: '',
    location: '',
    parkingInfo: '',
    paymentMethods: '',
    cancellationPolicy: '',
    offers: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/salon/business')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/salon/business', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: 'Settings Saved',
          description: 'Your salon settings have been updated successfully.',
        })
      } else {
        toast({
          title: 'Save Failed',
          description: 'Failed to save settings. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, you'd upload to a storage service
      // For now, we'll use a placeholder
      setSettings({ ...settings, logo: URL.createObjectURL(file) })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Salon Settings</h1>
          <p className="text-purple-200/70">Configure your salon business information and preferences</p>
        </motion.div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Business Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Business Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Enter business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {settings.logo && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSettings({ ...settings, logo: '' })}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                  <label className="flex-1">
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                      <span className="text-purple-200/70 text-sm">Upload logo</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Contact Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="contact@salon.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </motion.div>

          {/* Operating Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Operating Hours</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Opening Hours</label>
                <input
                  type="text"
                  value={settings.openingHours}
                  onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Mon-Sat: 9AM-7PM | Sun: 10AM-5PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Location Details</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="City Center Mall, Ground Floor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Parking Information</label>
                <input
                  type="text"
                  value={settings.parkingInfo}
                  onChange={(e) => setSettings({ ...settings, parkingInfo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Free parking available for 2 hours"
                />
              </div>
            </div>
          </motion.div>

          {/* Policies & Offers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Policies & Offers</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Methods
                </label>
                <input
                  type="text"
                  value={settings.paymentMethods}
                  onChange={(e) => setSettings({ ...settings, paymentMethods: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="Cash, Card, UPI, PayPal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Cancellation Policy</label>
                <textarea
                  value={settings.cancellationPolicy}
                  onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="24 hours notice required for cancellation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Special Offers</label>
                <textarea
                  value={settings.offers}
                  onChange={(e) => setSettings({ ...settings, offers: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                  placeholder="First visit: 20% off on all services"
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end"
          >
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
