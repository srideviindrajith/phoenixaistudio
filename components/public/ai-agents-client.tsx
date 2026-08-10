'use client'

import { Check, Cpu, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface AgentItem {
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
  status: boolean
  isPublic: boolean
  packageId?: string
  package?: any
  aiInstructions?: string
  businessKnowledge?: string
  systemPrompt?: string
  createdAt: string
  updatedAt: string
}

interface AI_AgentsClientProps {
  agents: AgentItem[]
}

export function AI_AgentsClient({ agents }: AI_AgentsClientProps) {
  const agentsArray = Array.isArray(agents) ? agents : []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {agentsArray.length > 0 ? (
        agentsArray.map((agent) => {
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

          return (
            <Link key={agent.id} href={`/ai-agents/${agent.id}`} className="group relative block">
              <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-[#FF6A00]/15 to-transparent opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />
              <div className="phoenix-card relative flex h-full flex-col p-6">
                {/* Image/Icon container */}
                <div className="flex gap-4 items-start mb-6">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={agent.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-zinc-900 border border-white/10"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Cpu className="w-8 h-8 text-[#FF6A00]" />
                    </div>
                  )}
                  <div>
                    <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-[#FF6A00] mb-1">
                      {agent.category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight">{agent.name}</h3>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 flex-1">{agent.description}</p>

                {/* Features list */}
                {featuresList.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs uppercase font-semibold text-gray-500 mb-3 tracking-wider">Capabilities</h4>
                    <ul className="space-y-2">
                      {featuresList.slice(0, 3).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-[#FF6A00] mt-0.5 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pricing / Action */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div>
                    {agent.package ? (
                      <>
                        <span className="text-xs text-gray-500 block">{agent.package.name}</span>
                        <span className="text-xl font-bold text-white">
                          {agent.package.currency}{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(agent.package.price)}
                          <span className="text-sm font-normal text-gray-400">/mo</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-gray-500 block">Pricing Starts At</span>
                        <span className="text-xl font-bold text-white">
                          {currencySymbol} {formattedPrice}
                          <span className="text-sm font-normal text-gray-400">/mo</span>
                        </span>
                      </>
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 border border-[#FF6A00]/30 hover:border-[#FF6A00]/5 rounded-xl transition-all">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })
      ) : (
        <div className="col-span-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-12 text-center">
          <Cpu className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-white font-medium">No active AI agents at the moment</p>
          <p className="text-gray-400 text-sm mt-1">Please check back later or contact us to build a custom agent.</p>
        </div>
      )}
    </div>
  )
}
