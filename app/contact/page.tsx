'use client'

import { useState } from 'react'
import {
  Mail,
  Phone,
  Send,
  CheckCircle,
  Clock,
  MessageCircle,
} from 'lucide-react'
import { Instagram } from 'lucide-react'
import { PublicLayout } from '@/components/public/public-layout'

import { useSettings } from '@/components/public/settings-context'

export default function ContactPage() {
  const { settings } = useSettings()
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: settings.contact_email || 'contact@phoenixai.studio',
      subtext: 'We reply within 24 hours',
      color: '#FF6A00',
    },
    {
      icon: Phone,
      title: 'Call Us',
      value: settings.contact_phone || '+91 9876543210',
      subtext: 'Available anytime',
      color: '#CC4F00',
    },
    {
      icon: Instagram,
      title: 'Instagram',
      value: settings.instagram_id || '@phoenixai.studio',
      subtext: 'Follow us for updates',
      color: '#FF8A33',
    },
  ]

  return (
    <PublicLayout>
      <div className="px-8 pb-24 pt-32">
        <div className="container-phoenix">

          {/* Heading */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <MessageCircle className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-sm text-gray-300">Get in Touch</span>
            </div>

            <h1 className="mx-auto mb-6 max-w-4xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
              <span className="text-white">Contact </span>
              <span className="gradient-text">Us</span>
            </h1>

            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
              Let&apos;s build something amazing together.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">

            {/* Contact cards */}
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.title}
                  href={info.title === 'Email Us' ? `mailto:${info.value}` : info.title === 'Call Us' ? `tel:${info.value.replace(/[^+\d]/g, '')}` : `https://instagram.com/${info.value.replace('@', '')}`}
                  target={info.title === 'Instagram' ? '_blank' : undefined}
                  rel={info.title === 'Instagram' ? 'noopener noreferrer' : undefined}
                  className="phoenix-card block cursor-pointer p-5"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${info.color}20`,
                      }}
                    >
                      <info.icon
                        className="w-5 h-5"
                        style={{ color: info.color }}
                      />
                    </div>

                    <div>
                      <h3 className="text-white text-lg font-semibold">
                        {info.title}
                      </h3>
                      <p className="text-gray-300">{info.value}</p>
                      <p className="text-gray-500 text-sm">{info.subtext}</p>
                    </div>
                  </div>
                </a>
              ))}

              <div className="phoenix-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-[#FF8A33]" />
                  <span className="text-white font-semibold">
                    Quick Response
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  We reply within 24 hours.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="glass-card rounded-[20px] p-6">
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-14 h-14 text-[#FF8A33] mx-auto mb-4" />
                  <h3 className="text-2xl text-white font-bold mb-2">
                    Message Sent
                  </h3>
                  <p className="text-gray-400">
                    We will contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  <input
                    type="text"
                    placeholder="Name"
                    className="input-phoenix"
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    className="input-phoenix"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Subject"
                    className="input-phoenix"
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                  />

                  <textarea
                    rows={5}
                    placeholder="Your message"
                    className="input-phoenix resize-none"
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-fire w-full flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-4 h-4" />
                  </button>

                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
