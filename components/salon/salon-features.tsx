'use client'

import { motion } from 'framer-motion'
import { Clock, MessageCircle, Calendar as CalendarIcon, Zap, Shield, Smartphone } from 'lucide-react'

const features = [
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Never miss a booking with AI that works around the clock, handling appointments even when your salon is closed.'
  },
  {
    icon: MessageCircle,
    title: 'Natural Conversations',
    description: 'Advanced AI understands context and provides human-like responses for exceptional customer experience.'
  },
  {
    icon: CalendarIcon,
    title: 'Smart Booking',
    description: 'Intelligent scheduling that checks availability, suggests time slots, and manages calendar conflicts automatically.'
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'Get immediate answers to customer questions about services, pricing, and availability without any wait time.'
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade security protects customer information and booking data with end-to-end encryption.'
  },
  {
    icon: Smartphone,
    title: 'Mobile Optimized',
    description: 'Beautiful mobile experience ensures customers can book appointments from anywhere, at any time.'
  }
]

export function SalonFeatures() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-purple-200/70 max-w-2xl mx-auto">
            Everything you need to automate your salon's customer interactions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:border-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-purple-200/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
