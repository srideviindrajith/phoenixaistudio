'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, User, Phone, Mail, Scissors, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SalonBookingFormProps {
  onClose: () => void
  onComplete: (data: any) => void
}

export function SalonBookingForm({ onClose, onComplete }: SalonBookingFormProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    stylist: '',
    specialNotes: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/salon/services')
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/salon/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: 'Booking Confirmed!',
          description: 'Your appointment has been successfully booked.',
        })
        onComplete(data.appointment)
      } else {
        toast({
          title: 'Booking Failed',
          description: 'Failed to create booking. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast({
        title: 'Booking Failed',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM'
  ]

  const stylists = ['Any Stylist', 'Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson']

  return (
    <div className="bg-gradient-to-br from-purple-900 to-violet-900 rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Book Appointment</h2>
            <p className="text-purple-200/60 text-sm">Step {step} of 4</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-purple-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Select Service
              </label>
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setFormData({ ...formData, service: service.name })}
                    className={`p-4 rounded-xl border transition-all ${
                      formData.service === service.name
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-medium text-sm">{service.name}</div>
                    <div className="text-purple-300/60 text-xs mt-1">₹{service.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Select Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Select Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setFormData({ ...formData, time })}
                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                      formData.time === time
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-purple-200/70 hover:bg-white/10'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Preferred Stylist (Optional)</label>
              <select
                value={formData.stylist}
                onChange={(e) => setFormData({ ...formData, stylist: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              >
                {stylists.map((stylist) => (
                  <option key={stylist} value={stylist === 'Any Stylist' ? '' : stylist}>
                    {stylist}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Special Notes (Optional)</label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 resize-none focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Any special requests or notes..."
              />
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Name:</span>
                  <span className="text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Email:</span>
                  <span className="text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Phone:</span>
                  <span className="text-white">{formData.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Service:</span>
                  <span className="text-white">{formData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Date:</span>
                  <span className="text-white">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/70">Time:</span>
                  <span className="text-white">{formData.time}</span>
                </div>
                {formData.stylist && (
                  <div className="flex justify-between">
                    <span className="text-purple-200/70">Stylist:</span>
                    <span className="text-white">{formData.stylist}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-purple-500/20 flex justify-between">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-2 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 4 ? (
          <button
            onClick={nextStep}
            disabled={
              (step === 1 && (!formData.name || !formData.email || !formData.phone)) ||
              (step === 2 && !formData.service) ||
              (step === 3 && (!formData.date || !formData.time))
            }
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
