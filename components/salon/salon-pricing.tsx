'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '₹2,499',
    period: '/month',
    description: 'Perfect for small salons',
    features: [
      'Up to 100 bookings/month',
      'Basic AI chat',
      'Email support',
      'Mobile app access',
      'Basic analytics'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: '₹4,999',
    period: '/month',
    description: 'Most popular for growing salons',
    features: [
      'Unlimited bookings',
      'Advanced AI with context',
      'Priority support',
      'WhatsApp integration',
      'Advanced analytics',
      'Custom branding',
      'Multiple locations'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '₹9,999',
    period: '/month',
    description: 'For salon chains',
    features: [
      'Everything in Professional',
      'White-label solution',
      'Dedicated account manager',
      'Custom AI training',
      'API access',
      'Advanced integrations',
      'Staff training',
      'SLA guarantee'
    ],
    popular: false
  }
]

export function SalonPricing() {
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-purple-200/70 max-w-2xl mx-auto">
            Choose the perfect plan for your salon's needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl backdrop-blur-lg border ${
                plan.popular
                  ? 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-500/50 scale-105'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-1 rounded-full text-white text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-purple-200/70 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-purple-200/70">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-purple-400" />
                    </div>
                    <span className="text-purple-200/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
