'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, Shield, Brain, Rocket, Users, Calendar, Star } from 'lucide-react'
import { useSettings } from './settings-context'

interface AnimatedCounterProps {
  value: string
}

function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [displayVal, setDisplayVal] = useState('0')

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/)
    if (!match) {
      setDisplayVal(value)
      return
    }

    const targetNum = parseInt(match[1], 10)
    const suffix = match[2] || ''

    const duration = 1200 // ms
    const startTime = performance.now()

    let animationFrameId: number

    const updateCounter = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const easeProgress = progress * (2 - progress) // Ease out quad
      const currentNum = Math.floor(easeProgress * targetNum)
      
      setDisplayVal(`${currentNum}${suffix}`)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCounter)
      }
    }

    animationFrameId = requestAnimationFrame(updateCounter)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [value])

  return <>{displayVal}</>
}

export function HeroSection() {
  const { settings } = useSettings()
  const heroTitle = settings.hero_title || 'Build the Future with AI'
  const heroSubtitle =
    settings.hero_subtitle ||
    'We transform your ideas into intelligent, scalable applications powered by cutting-edge artificial intelligence technology.'

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden px-8 pb-24 pt-32">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,106,0,0.10),transparent_36%)]" />

      <div className="container-phoenix relative z-10 text-center">
        {/* Badge */}
        <div className="badge-phoenix mb-10 animate-fade-in-up">
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#FF8A33]" />
            <div className="absolute inset-0 animate-glow-pulse">
              <Sparkles className="w-4 h-4 text-[#FF8A33] blur-sm" />
            </div>
          </div>
          <span>AI-Powered Innovation</span>
        </div>

        {/* Main Heading */}
        <h1 className="hero-title mx-auto mb-8 max-w-5xl animate-fade-in-up stagger-1">
          {/\swith AI\s*$/i.test(heroTitle) ? (
            <>
              {heroTitle.replace(/\s*with AI\s*$/i, '')}{' '}
              <span className="gradient-text">with AI</span>
            </>
          ) : (
            heroTitle
          )}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-12 max-w-3xl animate-fade-in-up text-lg leading-relaxed text-[#A1A1AA] stagger-3 md:text-xl">
          {heroSubtitle}
        </p>

        {/* CTA Buttons */}
        <div className="mb-20 flex flex-col items-center justify-center gap-4 animate-fade-in-up stagger-4 sm:flex-row">
          <Link href="/contact" className="group btn-fire">
            <span>{settings.cta_button_text || 'Get Started'}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="/portfolio" className="btn-fire-outline">
            View Our Work
          </Link>
        </div>

        {/* Stats */}
        {(() => {
          const currentYear = new Date().getFullYear()
          const yearsActive = currentYear - 2026
          
          const projectValue = settings.hero_stats_projects || '150+'
          
          const clientValue = settings.hero_stats_clients || '50+'
          const clientLabel = clientValue === 'Growing Portfolio' ? 'Active Clients' : 'Growing Portfolio'
          
          const yearsValue = yearsActive > 0 ? `${yearsActive}+ Years` : '2026'
          const yearsLabel = yearsActive > 0 ? 'Years Active' : 'Founded 2026'
          
          const isSatisfactionNumeric = settings.hero_stats_satisfaction && /\d+%?/.test(settings.hero_stats_satisfaction)
          const satisfactionValue = isSatisfactionNumeric ? settings.hero_stats_satisfaction : 'Building long-term relationships.'

          const stats = [
            {
              icon: Rocket,
              value: projectValue,
              label: 'Projects Delivered',
              description: 'Delivering innovative digital solutions.'
            },
            {
              icon: Users,
              value: clientValue,
              label: clientLabel,
              description: 'Building trust with every client.'
            },
            {
              icon: Calendar,
              value: yearsValue,
              label: yearsLabel,
              description: 'A new journey towards innovation.'
            },
            {
              icon: Star,
              value: satisfactionValue,
              label: 'Client Satisfaction',
              description: 'Focused on quality and client success.'
            }
          ]

          const getFontSizeClass = (val: string) => {
            if (val.length > 20) return 'text-base md:text-lg font-bold leading-snug'
            if (val.length > 8) return 'text-xl md:text-2xl font-bold'
            return 'text-3xl md:text-4xl font-extrabold'
          }

          return (
            <div className="mx-auto mb-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0c0c0e]/95 via-[#08080a]/98 to-[#040405]/95 border border-white/5 p-8 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.36),_inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-[#FF6A00]/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,106,0,0.12),_0_0_30px_rgba(255,106,0,0.06)] transition-all duration-500 animate-fade-in-up stagger-${index + 1}`}
                >
                  {/* Subtle background glow */}
                  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(255,106,0,0.04),transparent_60%)]" />
                  
                  {/* Subtle dot pattern */}
                  <div className="absolute inset-0 -z-10 opacity-[0.02] mix-blend-overlay bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />

                  <div>
                    {/* Large circular icon container */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#FF6A00]/20 bg-gradient-to-br from-[#FF6A00]/15 to-[#CC4F00]/5 text-[#FF8A33] transition-all duration-300 group-hover:scale-110 group-hover:border-[#FF6A00]/40 group-hover:bg-[#FF6A00]/25 group-hover:text-white">
                      <stat.icon className="h-6 w-6" />
                    </div>

                    {/* Premium Typography & Counter */}
                    <div className={`gradient-text mb-1 font-heading ${getFontSizeClass(stat.value)} tracking-tight`}>
                      <AnimatedCounter value={stat.value} />
                    </div>
                    
                    <div className="text-sm font-semibold tracking-wide text-[#A1A1AA] uppercase group-hover:text-white transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>

                  <div>
                    {/* Thin accent divider */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF6A00]/20 to-transparent my-4" />

                    {/* Small description text */}
                    <p className="text-xs leading-relaxed text-[#71717A] group-hover:text-[#A1A1AA] transition-colors duration-300">
                      {stat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Features */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Optimized performance for seamless user experiences that scales.',
            },
            {
              icon: Shield,
              title: 'Secure by Design',
              description: 'Enterprise-grade security built into every layer of your solution.',
            },
            {
              icon: Brain,
              title: 'AI-First Approach',
              description: 'Leveraging the latest in artificial intelligence and machine learning.',
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className={`card-phoenix text-left group animate-fade-in-up stagger-${index + 4}`}
            >
              <div className="phoenix-icon-box mb-5 h-14 w-14 transition-all duration-300 group-hover:scale-110">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="card-title mb-3 transition-colors duration-300 group-hover:text-[#FF8A33]">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-[#A1A1AA]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
