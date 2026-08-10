'use client'

import { useState, useEffect } from 'react'
import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { PlayCircle, Star, Sparkles, Filter, ExternalLink, Activity, ArrowRight, MessageSquare, ShieldAlert, Cpu, X } from 'lucide-react'

interface ModelItem {
  id: string
  title: string
  description: string
  image: string | null
  liveUrl: string | null
  category: string
  status: boolean
}

const CATEGORIES = ['All', 'Language Processing', 'Computer Vision', 'Predictive Analytics', 'Voice Synthesis']

export default function DemoModelsPage() {
  const [models, setModels] = useState<ModelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activePreview, setActivePreview] = useState<ModelItem | null>(null)
  
  // Interactive NLP State
  const [nlpInput, setNlpInput] = useState('')
  const [nlpOutput, setNlpOutput] = useState<any>(null)
  const [nlpLoading, setNlpLoading] = useState(false)

  // Interactive CV State
  const [cvItems, setCvItems] = useState<{ name: string; conf: number; box: string }[]>([])
  const [cvLoading, setCvLoading] = useState(false)

  // Interactive Leads State
  const [leadBudget, setLeadBudget] = useState('5000')
  const [leadEmployees, setLeadEmployees] = useState('50')
  const [leadScore, setLeadScore] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/demo-models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models?.filter((m: any) => m.status) || [])
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filteredModels = models.filter(
    (m) => selectedCategory === 'All' || m.category === selectedCategory
  )

  // Simulate NLP intent model
  const runNlpDemo = () => {
    if (!nlpInput.trim()) return
    setNlpLoading(true)
    setNlpOutput(null)
    setTimeout(() => {
      const text = nlpInput.toLowerCase()
      let intent = 'General Inquiry'
      let confidence = 0.82
      let sentiment = 'Neutral'

      if (text.includes('refund') || text.includes('cancel') || text.includes('money back')) {
        intent = 'Billing & Cancellation'
        confidence = 0.96
        sentiment = 'Negative'
      } else if (text.includes('price') || text.includes('cost') || text.includes('quote') || text.includes('buy')) {
        intent = 'Sales Opportunity'
        confidence = 0.91
        sentiment = 'Positive'
      } else if (text.includes('bug') || text.includes('error') || text.includes('broken') || text.includes('crash')) {
        intent = 'Technical Support'
        confidence = 0.89
        sentiment = 'Negative'
      }

      setNlpOutput({ intent, confidence: (confidence * 100).toFixed(1) + '%', sentiment })
      setNlpLoading(false)
    }, 1000)
  }

  // Simulate Computer Vision shelf detection
  const runCvDemo = () => {
    setCvLoading(true)
    setCvItems([])
    setTimeout(() => {
      setCvItems([
        { name: 'Beverage Can', conf: 98.4, box: 'top-4 left-6 w-14 h-24' },
        { name: 'Snack Pack', conf: 92.1, box: 'top-10 right-8 w-20 h-16' },
        { name: 'Soda Bottle', conf: 95.7, box: 'bottom-4 left-20 w-16 h-28' }
      ])
      setCvLoading(false)
    }, 1200)
  }

  // Simulate Lead scoring logic
  const runLeadDemo = () => {
    const budget = parseFloat(leadBudget) || 0
    const employees = parseInt(leadEmployees) || 0
    let score = 40
    if (budget > 10000) score += 25
    else if (budget > 5000) score += 15
    if (employees > 100) score += 25
    else if (employees > 20) score += 15
    setLeadScore(Math.min(99, score + Math.floor(Math.random() * 10)))
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_0%,rgba(255,106,0,0.10),transparent_34%),radial-gradient(circle_at_20%_100%,rgba(204,79,0,0.08),transparent_30%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Activity className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Live AI Experiments</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Interactive </span>
            <span className="gradient-text">Demo Models</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Interact with our pre-trained language, vision, and tabular prediction neural networks in real-time.
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] text-white shadow-lg shadow-[#FF6A00]/20'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <section className="section-padding-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#FF6A00]/30 border-t-[#FF6A00] rounded-full animate-spin" />
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-16 text-center">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-white font-medium">No demo models available in this category</p>
            <p className="text-gray-400 text-sm mt-1">Please select another category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredModels.map((model) => (
              <div key={model.id} className="group relative">
                <div className="absolute -inset-px rounded-[20px] bg-gradient-to-b from-[#FF6A00]/15 to-transparent opacity-0 blur-sm transition-all duration-500 group-hover:opacity-100" />
                <div className="phoenix-card relative flex h-full flex-col overflow-hidden p-0">
                  
                  {/* Visual container */}
                  <div className="relative h-48 bg-[#0a0a0a]">
                    {model.image ? (
                      <img
                        src={model.image}
                        alt={model.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF6A00]/5 to-[#CC4F00]/5">
                        <PlayCircle className="w-16 h-16 text-[#FF6A00]/40" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 inline-block text-[10px] uppercase tracking-wider font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white">
                      {model.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">{model.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1">{model.description}</p>
                    
                    <button
                      onClick={() => setActivePreview(model)}
                      className="phoenix-button w-full"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Launch Interactive Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-card relative w-full max-w-2xl overflow-hidden rounded-[20px] shadow-2xl">
            <button
              onClick={() => {
                setActivePreview(null)
                setNlpInput('')
                setNlpOutput(null)
                setCvItems([])
                setLeadScore(null)
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all hover:bg-white/10 border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <span className="inline-block text-[10px] uppercase tracking-wider font-bold text-[#FF6A00] mb-1">
                  Interactive Lab
                </span>
                <h3 className="text-2xl font-bold text-white">{activePreview.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{activePreview.description}</p>
              </div>

              {/* Dynamic Interactive Demo Fields */}
              <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-6 min-h-[220px] flex flex-col justify-center">
                {activePreview.category === 'Language Processing' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Input Sentence</label>
                      <textarea
                        rows={2}
                        placeholder="e.g., I bought this system yesterday but it crashes on startup. Can I get a refund?"
                        value={nlpInput}
                        onChange={(e) => setNlpInput(e.target.value)}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FF6A00]/50 transition-all resize-none text-sm"
                      />
                    </div>
                    <button
                      onClick={runNlpDemo}
                      disabled={nlpLoading || !nlpInput.trim()}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      {nlpLoading ? 'Evaluating Neural Net...' : 'Run Inference'}
                    </button>
                    {nlpOutput && (
                      <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-medium">Classified Intent</span>
                          <span className="text-sm font-bold text-[#FF6A00]">{nlpOutput.intent}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-medium">Confidence</span>
                          <span className="text-sm font-bold text-white">{nlpOutput.confidence}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase font-medium">Sentiment</span>
                          <span className="text-sm font-bold text-white">{nlpOutput.sentiment}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activePreview.category === 'Computer Vision' && (
                  <div className="space-y-4 text-center">
                    <div className="relative w-full max-w-sm mx-auto h-48 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center">
                      {/* Grid background shelf */}
                      <div className="absolute inset-0 grid grid-cols-3 gap-2 p-4 opacity-30">
                        <div className="rounded border border-[#FF6A00]/20 bg-[#FF6A00]/10" />
                        <div className="bg-red-500/10 border border-red-500/20 rounded" />
                        <div className="rounded border border-[#FF8A33]/20 bg-[#FF8A33]/10" />
                      </div>
                      <span className="text-xs text-gray-500 relative z-10">Warehouse Rack CV Simulation</span>

                      {/* Mock bounding boxes */}
                      {cvItems.map((item, i) => (
                        <div
                          key={i}
                          className={`absolute border border-green-500 bg-green-500/10 rounded flex flex-col justify-start items-start p-1 ${item.box}`}
                        >
                          <span className="text-[8px] font-bold text-white bg-green-600 px-1 rounded-sm leading-none">
                            {item.name} ({item.conf}%)
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={runCvDemo}
                      disabled={cvLoading}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      {cvLoading ? 'Running Edge Detect...' : 'Scan Image Frame'}
                    </button>
                  </div>
                )}

                {activePreview.category === 'Predictive Analytics' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Deal Budget ($)</label>
                        <input
                          type="number"
                          value={leadBudget}
                          onChange={(e) => setLeadBudget(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6A00]/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Employee Count</label>
                        <input
                          type="number"
                          value={leadEmployees}
                          onChange={(e) => setLeadEmployees(e.target.value)}
                          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF6A00]/50 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={runLeadDemo}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all"
                    >
                      Calculate Purchase Probability
                    </button>
                    {leadScore !== null && (
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-400">AI Regression Probability Score:</span>
                        <span className="text-2xl font-bold text-green-400">{leadScore}% score</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Default preview or custom url redirects */}
                {activePreview.category !== 'Language Processing' &&
                  activePreview.category !== 'Computer Vision' &&
                  activePreview.category !== 'Predictive Analytics' && (
                    <div className="text-center py-6">
                      <Cpu className="w-12 h-12 text-[#FF6A00] mx-auto mb-3 animate-pulse" />
                      <p className="text-sm text-gray-300">Bespoke model running in virtual container sandbox.</p>
                      {activePreview.liveUrl && (
                        <a
                          href={activePreview.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-4 text-[#FF6A00] hover:text-[#FF8A33] text-sm font-semibold"
                        >
                          <span>Open in External Tab</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
              </div>

              {/* Action buttons footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setActivePreview(null)
                    setNlpInput('')
                    setNlpOutput(null)
                    setCvItems([])
                    setLeadScore(null)
                  }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                >
                  Close Demo
                </button>
                {activePreview.liveUrl && (
                  <a
                    href={activePreview.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                          className="phoenix-button"
                  >
                    <span>View Production Deployment</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ContactSection />
    </PublicLayout>
  )
}
