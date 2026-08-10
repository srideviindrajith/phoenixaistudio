import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { Layers, CheckCircle2, Cpu, Sparkles, Server, Receipt, BarChart3, Database } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { CoreSystemsGrid } from '@/components/public/core-systems-grid'

export const metadata = {
  title: 'Core Systems | PhoenixAI Studio',
  description: 'Robust, enterprise-grade core operational software suites built with built-in artificial intelligence.',
}

export const revalidate = 60

async function getCoreSystems() {
  try {
    const systems = await prisma.coreSystem.findMany({
      where: { status: true },
      orderBy: { createdAt: 'desc' }
    })
    return systems
  } catch {
    return []
  }
}

// Icon mappings for categories
const categoryIcons: Record<string, string> = {
  CRM: 'Cpu',
  ERP: 'Server',
  Billing: 'Receipt',
  Automation: 'Database',
  Analytics: 'BarChart3'
}

const categoryColors: Record<string, string> = {
  CRM: '#FF6A00',
  ERP: '#CC4F00',
  Billing: '#FF8A33',
  Automation: '#F59E0B',
  Analytics: '#3B82F6'
}

export default async function CoreSystemsPage() {
  const systems = await getCoreSystems()

  // Group systems by category
  const categoriesList = ['CRM', 'ERP', 'Billing', 'Automation', 'Analytics']

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.10),transparent_36%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Layers className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Enterprise Orchestration</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Core </span>
            <span className="gradient-text">Systems</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Scalable CRM, ERP, billing pipelines, and custom dashboards built specifically to unify your SaaS operations.
          </p>
        </div>
      </div>

      {/* Core Systems Modules Grid */}
      <section className="section-padding-sm max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CoreSystemsGrid
          systems={systems}
          categoriesList={categoriesList}
          categoryIcons={categoryIcons}
          categoryColors={categoryColors}
        />
      </section>

      {/* Trust factors / Features section */}
      <section className="section-padding max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">Why Choose Core Systems</h2>
          <p className="text-gray-400">High-reliability modules backed by AI logic verification servers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="phoenix-card p-6">
            <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">99.99% Operational SLA</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              We deploy containerized replicas of database synchronization scripts to ensure near-zero downtime.
            </p>
          </div>
          <div className="phoenix-card p-6">
            <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Edge Verification</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our networks monitor payment ledgers, qualifying leads, and ERP assets against transaction anomaly engines.
            </p>
          </div>
          <div className="phoenix-card p-6">
            <CheckCircle2 className="w-8 h-8 text-[#FF6A00] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Zero-Code API Integration</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect external billing tools like Stripe, Salesforce CRM, or SAP ERP with absolute zero custom hooks.
            </p>
          </div>
        </div>
      </section>

      <ContactSection />
    </PublicLayout>
  )
}
