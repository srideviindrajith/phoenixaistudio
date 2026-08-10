'use client'

import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { Check, Star, Cpu, ArrowRight, CalendarDays, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AI_AgentsClient } from '@/components/public/ai-agents-client'
import { useState, useEffect } from 'react'

export default function AI_AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getAgents() {
      try {
        const response = await fetch('/api/ai-agents/public', {
          cache: 'no-store'
        })
        const data = await response.json()
        
        // Simplify data to avoid serialization issues
        const simplifiedAgents = (data.agents || []).map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          longDescription: agent.longDescription,
          image: agent.image,
          price: agent.price,
          features: agent.features,
          category: agent.category,
          agentType: agent.agentType,
          tags: agent.tags,
          status: agent.status,
          isPublic: agent.isPublic,
          packageId: agent.packageId,
          package: agent.package,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt
        }))
        
        setAgents(simplifiedAgents)
      } catch (error) {
        console.error('[AI AGENTS PAGE] Error fetching agents:', error)
        setAgents([])
      } finally {
        setLoading(false)
      }
    }
    getAgents()
  }, [])

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.10),transparent_36%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Cpu className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Autonomous Workforce</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Intelligent </span>
            <span className="gradient-text">AI Agents</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Deploy specialized, production-ready AI agents trained to integrate seamlessly with your CRM, databases, and core workflows.
          </p>
        </div>
      </div>

      {/* Agents Section */}
      <section className="section-padding-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AI_AgentsClient agents={agents} />
      </section>

      {/* Redesigned AI Agent CTA Section */}
      <section className="section-padding max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-t border-white/5 relative z-10">
        <div className="glass-card relative overflow-hidden rounded-[20px] p-8 shadow-2xl md:p-12">
          {/* Background overlay radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.06),transparent_50%)]" />
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-heading">
              Explore Our <span className="gradient-text">AI Agent Solutions</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Discover enterprise-ready AI Agents built for automation, customer support, sales, HR, and business operations.
            </p>
            <div className="pt-2">
              <Link
                href="/packages?category=AI Agent"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.4)] hover:-translate-y-0.5"
              >
                <span>View AI Agent Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 border-t border-white/5">
        <div className="glass-card relative overflow-hidden rounded-[20px] p-8 shadow-2xl md:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,106,0,0.10),transparent_32%)]" />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6">Ready to Hire Your AI Workforce?</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Automate business logic, qualify leads, and run operations 24/7 without code failures. Schedule a custom consultation with our AI architects today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="btn-fire px-8 py-3.5 text-sm font-semibold">Consult an AI Architect</Link>
            <Link href="/services" className="px-8 py-3.5 text-sm font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">Explore Services</Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </PublicLayout>
  )
}
