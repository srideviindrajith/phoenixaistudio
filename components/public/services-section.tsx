'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { getServiceIcon } from '@/lib/service-icon-engine'
import { getServiceColorScheme } from '@/lib/service-color-engine'

interface Service {
  id: string
  name: string
  slug?: string
  category: string
  tagline?: string
  description: string
  features: string
  benefits?: string
  technologies?: string
  ctaButtonText?: string
  ctaLink?: string
  icon?: string
  gradient?: string
  accentColor?: string
  thumbnail?: string
  coverImage?: string
  backgroundGradient?: string
  status: string
  visibility: string
  featured: boolean
  order: number
  badge?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  createdAt: string
  updatedAt: string
}

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services/public')
      
      if (!response.ok) {
        console.error('API returned error status:', response.status)
        setServices([])
        return
      }
      
      const data = await response.json()
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setServices(data)
      } else {
        console.error('API did not return an array:', data)
        setServices([])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }
  return (
    <section id="services" className="section-padding relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,106,0,0.08),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(204,79,0,0.07),transparent_30%)]" />
      </div>

      <div className="container-phoenix relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">What We Offer</span>
          </div>

          <h2 className="section-title mb-6">
            <span className="text-white">Our </span>
            <span className="gradient-text">Services</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Comprehensive solutions to transform your digital presence and drive business growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">Loading services...</div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">No services available yet.</div>
          ) : (
            services.map((service, index) => {
              const Icon = getServiceIcon(service.name, service.category, service.description);
              const colorScheme = getServiceColorScheme(service.category, service.name, service.description);
              const featuresList = service.features ? service.features.split('\n').filter((f: string) => f.trim()) : [];
              
              return (
                <div
                  key={service.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-phoenix h-full flex flex-col">
                    {/* Icon container */}
                    <div className="relative mb-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${colorScheme.primary}15, ${colorScheme.primary}05)`,
                          border: `1px solid ${colorScheme.primary}20`,
                        }}
                      >
                        <Icon
                          className="w-8 h-8 transition-all duration-500"
                          style={{ color: colorScheme.primary }}
                        />
                      </div>
                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                        style={{ background: colorScheme.glow }}
                      />
                    </div>

                    {/* Title */}
                    <h3 className="card-title mb-3 transition-colors duration-300 group-hover:text-[#FF8A33]">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 flex-grow leading-relaxed text-[#A1A1AA]">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2.5">
                      {featuresList.map((feature: string, featureIndex: number) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-150"
                            style={{ background: colorScheme.primary }}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colorScheme.primary}50, transparent)`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/services"
            className="group btn-fire inline-flex items-center gap-3"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
