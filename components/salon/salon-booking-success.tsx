'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Calendar, Clock, MapPin, Phone, X, Share2, Download } from 'lucide-react'

interface SalonBookingSuccessProps {
  bookingData: any
  onClose: () => void
}

export function SalonBookingSuccess({ bookingData, onClose }: SalonBookingSuccessProps) {
  const formattedDate = new Date(bookingData.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="bg-gradient-to-br from-purple-900 to-violet-900 rounded-2xl border border-purple-500/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Booking Confirmed!</h2>
            <p className="text-purple-200/60 text-sm">Your appointment has been scheduled</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
          <p className="text-purple-200/70">
            Your booking has been confirmed. We'll send you a reminder before your appointment.
          </p>
        </motion.div>

        {/* Booking Details */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
          <h4 className="text-white font-semibold mb-4">Booking Details</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-purple-200/50 text-xs">Date & Time</div>
                <div className="text-white">{formattedDate} at {bookingData.time}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-purple-200/50 text-xs">Service</div>
                <div className="text-white">{bookingData.service?.name}</div>
                <div className="text-purple-300/60 text-sm">₹{bookingData.service?.price}</div>
              </div>
            </div>

            {bookingData.stylist && (
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 text-xs">S</span>
                </div>
                <div>
                  <div className="text-purple-200/50 text-xs">Stylist</div>
                  <div className="text-white">{bookingData.stylist}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-purple-200/50 text-xs">Contact</div>
                <div className="text-white">{bookingData.customer?.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-purple-200/50 text-xs">Location</div>
              <div className="text-white">City Center Mall, Ground Floor</div>
              <div className="text-purple-300/60 text-sm">Free parking available for 2 hours</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex-1 py-3 px-4 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-500/20 text-center">
        <p className="text-purple-200/50 text-sm">
          Need to reschedule? Contact us at{' '}
          <span className="text-purple-300">+1234567890</span>
        </p>
      </div>
    </div>
  )
}
