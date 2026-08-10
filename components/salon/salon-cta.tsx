'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function SalonCTA() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative p-12 md:p-20 rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-600" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-violet-600/90 backdrop-blur-sm" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Limited Time Offer</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Salon?
            </h2>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of salons already using AI to automate bookings and delight customers.
              Get started with a free demo today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/salon-booking/chat"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300"
              >
                Try Free Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/salon-booking/chat"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold text-lg hover:bg-white/30 transition-all duration-300"
              >
                Book Appointment
              </Link>
            </div>

            <p className="mt-8 text-white/60 text-sm">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
