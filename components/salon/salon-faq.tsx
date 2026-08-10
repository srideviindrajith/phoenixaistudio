'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'What are your opening hours?',
    answer: 'We are open Monday to Saturday from 9AM to 7PM, and Sunday from 10AM to 5PM. Our AI receptionist is available 24/7 for booking and inquiries.'
  },
  {
    question: 'Where are you located?',
    answer: 'We are located at City Center Mall, Ground Floor. Free parking is available for 2 hours. Our AI can provide detailed directions when you book.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept cash, card, UPI, and PayPal payments. You can also pay online when booking through our AI system.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We require 24 hours notice for cancellations. Late cancellations may incur a fee. Our AI can help you reschedule or cancel appointments easily.'
  },
  {
    question: 'Do you offer any special deals?',
    answer: 'Yes! First-time visitors get 20% off on all services. We also have seasonal offers and loyalty programs. Ask our AI about current promotions.'
  },
  {
    question: 'How do I book an appointment?',
    answer: 'Simply use our AI chat interface to book. The AI will guide you through selecting a service, choosing a time, and confirming your appointment in minutes.'
  }
]

export function SalonFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-purple-200/70 max-w-2xl mx-auto">
            Everything you need to know about our salon services
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-semibold">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-400 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-purple-200/70">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
