'use client'

import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { Check, Cpu, ArrowRight, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface AgentDetail {
  id: string
  name: string
  description: string
  longDescription?: string
  image: string | null
  price: number
  features: string
  category: string
  agentType?: string
  tags?: string
  isPublic: boolean
  packageId?: string
  package?: any
  aiInstructions?: string
  businessKnowledge?: string
  systemPrompt?: string
  createdAt: string
  updatedAt: string
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [agent, setAgent] = useState<AgentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgent() {
      try {
        const response = await fetch(`/api/ai-agents/${params.id}`)
        if (!response.ok) {
          router.push('/ai-agents')
          return
        }
        const data = await response.json()
        if (!data.agent || !data.agent.isPublic) {
          router.push('/ai-agents')
          return
        }
        setAgent(data.agent)
      } catch (error) {
        console.error('Error fetching agent:', error)
        router.push('/ai-agents')
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [params.id, router])

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
        </div>
      </PublicLayout>
    )
  }

  if (!agent) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400">Agent not found</p>
        </div>
      </PublicLayout>
    )
  }

  const parts = (agent.features || '').split('\n\n[METADATA]\n')
  const cleanFeaturesText = parts[0] || ''
  let metadata: any = {}
  if (parts[1]) {
    try {
      metadata = JSON.parse(parts[1])
    } catch {
      metadata = {}
    }
  }

  const currencySymbol = metadata.currency === 'INR' ? '₹' : metadata.currency === 'EUR' ? '€' : metadata.currency === 'GBP' ? '£' : '$'
  const formattedPrice = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(agent.price)
  const featuresList = cleanFeaturesText.split('\n').filter((f: string) => f.trim() !== '')
  const tagsList = agent.tags ? agent.tags.split(',').map((t: string) => t.trim()) : []

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.10),transparent_36%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Banner Image */}
          {metadata.bannerImage && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={metadata.bannerImage}
                alt={`${agent.name} banner`}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Agent Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block text-xs uppercase tracking-wider font-semibold text-[#FF6A00] bg-[#FF6A00]/10 px-3 py-1 rounded-full">
                  {agent.category}
                </span>
                {agent.agentType && (
                  <span className="inline-block text-xs uppercase tracking-wider font-semibold text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                    {agent.agentType}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{agent.name}</h1>
              <p className="text-lg text-gray-400 mb-6">{agent.description}</p>

              {agent.longDescription && (
                <p className="text-gray-300 leading-relaxed mb-8">{agent.longDescription}</p>
              )}

              {/* Tags */}
              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {tagsList.map((tag: string, i: number) => (
                    <span key={i} className="text-xs font-medium text-gray-400 bg-white/5 px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-8 h-14 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.4)] hover:-translate-y-0.5"
                >
                  <span>Get This AI Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {metadata.liveDemoUrl ? (
                  <a
                    href={metadata.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-8 h-14 text-sm font-semibold text-white transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 h-14 text-sm font-semibold text-gray-500 cursor-not-allowed"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo is not available</span>
                  </button>
                )}
              </div>

              {/* URL Links */}
              <div className="flex flex-wrap gap-3">
                {metadata.launchUrl && (
                  <a
                    href={metadata.launchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Launch</span>
                  </a>
                )}
                {metadata.docUrl && (
                  <a
                    href={metadata.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Documentation</span>
                  </a>
                )}
                {metadata.githubUrl && (
                  <a
                    href={metadata.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {metadata.apiEndpoint && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-sm text-[#FF6A00]">
                    <Cpu className="w-4 h-4" />
                    <span>API Available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pricing Card */}
            <div className="w-full lg:w-96">
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                {agent.package ? (
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 mb-1">Package</div>
                    <div className="text-xl font-bold text-white mb-1">{agent.package.name}</div>
                    <div className="text-sm text-gray-400">{agent.package.description}</div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-xs text-gray-500 mb-1">Monthly Subscription</div>
                    <div className="text-3xl font-bold text-white">
                      {currencySymbol} {formattedPrice}
                      <span className="text-lg font-normal text-gray-400">/mo</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {featuresList.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#FF6A00] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/contact"
                  className="block w-full text-center rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9F1A] px-6 h-12 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_35px_rgba(255,122,0,0.4)]"
                >
                  Subscribe Monthly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* API Reference */}
      {metadata.apiEndpoint && (
        <section className="section-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">API Reference</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#FF6A00] mb-2">API Endpoint</h3>
                <code className="block bg-black/30 rounded-lg px-4 py-3 text-sm text-gray-300 font-mono break-all">
                  {metadata.apiEndpoint}
                </code>
              </div>
              {metadata.supportedModels && metadata.supportedModels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#FF6A00] mb-2">Supported Models</h3>
                  <div className="flex flex-wrap gap-2">
                    {metadata.supportedModels.map((model: string, i: number) => (
                      <span key={i} className="text-xs font-medium text-gray-300 bg-white/5 px-3 py-1.5 rounded-full">
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {metadata.deploymentType && (
                <div>
                  <h3 className="text-sm font-semibold text-[#FF6A00] mb-2">Deployment Type</h3>
                  <p className="text-gray-300 text-sm">{metadata.deploymentType}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <ContactSection />
    </PublicLayout>
  )
}

