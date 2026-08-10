'use client'

import { useState } from 'react'
import { Mail, Phone, Instagram, Send, CheckCircle, MessageCircle } from 'lucide-react'
import { useSettings } from './settings-context'

export function ContactSection() {
  const { settings } = useSettings()
  
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
      value: settings.contact_phone || '+1 (555) 123-4567',
      subtext: 'Mon-Fri, 9am-6pm PST',
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
        setFormState({ name: '', email: '', subject: '', message: '' })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_30%,rgba(255,106,0,0.08),transparent_35%),radial-gradient(circle_at_100%_80%,rgba(204,79,0,0.07),transparent_30%)]" />
      </div>

      <div className="container-phoenix relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <MessageCircle className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Get in Touch</span>
          </div>

          <h2 className="section-title mb-6">
            <span className="text-white">Get in </span>
            <span className="gradient-text">Touch</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Ready to start your project? Reach out and let&apos;s discuss how we can help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((info, index) => (
              <a
                key={info.title}
                href={info.title === 'Email Us' ? `mailto:${info.value}` : info.title === 'Call Us' ? `tel:${info.value.replace(/[^+\d]/g, '')}` : `https://instagram.com/${info.value.replace('@', '')}`}
                target={info.title === 'Instagram' ? '_blank' : undefined}
                rel={info.title === 'Instagram' ? 'noopener noreferrer' : undefined}
                className="phoenix-card block cursor-pointer p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: `${info.color}15`,
                      border: `1px solid ${info.color}20`,
                    }}
                  >
                    <info.icon className="w-6 h-6" style={{ color: info.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {info.title}
                    </h3>
                    <p className="text-white/90 font-medium">{info.value}</p>
                    <p className="text-gray-500 text-sm">{info.subtext}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="glass-card rounded-[20px] p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6A00]/20 to-[#CC4F00]/20 flex items-center justify-center mb-6 shadow-lg shadow-[#FF6A00]/20">
                  <CheckCircle className="w-10 h-10 text-[#FF6A00]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-gray-400 max-w-sm leading-relaxed">
                  Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-phoenix">
                      Name <span className="text-[#FF6A00]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input-phoenix"
                      placeholder="John Doe"
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="label-phoenix">
                      Email <span className="text-[#FF6A00]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="input-phoenix"
                      placeholder="john@example.com"
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="label-phoenix">
                    Subject <span className="text-[#FF6A00]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="input-phoenix"
                    placeholder="Project inquiry"
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label-phoenix">
                    Message <span className="text-[#FF6A00]">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="input-phoenix resize-none"
                    placeholder="Tell us about your project..."
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-fire w-full flex items-center justify-center gap-3 py-4"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
