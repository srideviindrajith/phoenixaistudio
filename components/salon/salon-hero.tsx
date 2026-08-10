'use client'

import { motion } from 'framer-motion'
import { Sparkles, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export function SalonHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-slate-900/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">AI-Powered Beauty Experience</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your 24/7 AI
            <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              {' '}Salon Receptionist
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-200/80 mb-8 max-w-3xl mx-auto">
            Transform your salon booking experience with intelligent AI that handles appointments, 
            answers questions, and provides exceptional customer service around the clock.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/salon-booking/chat"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full text-white font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Try Demo
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            </Link>

            <Link
              href="/salon-booking/chat"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-purple-300/70 text-sm">Availability</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10+</div>
              <div className="text-purple-300/70 text-sm">Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-purple-300/70 text-sm">Automated</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
