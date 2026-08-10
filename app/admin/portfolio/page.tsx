import { Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ModuleToggle } from '@/components/admin/module-toggle'

export default function AdminPortfolioPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Portfolio</h1>
          <p className="mt-1 text-sm text-gray-400">Manage featured work and portfolio highlights.</p>
        </div>
        <Link href="/admin/projects" className="phoenix-button">
          View Projects
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Module Toggle */}
      <div className="mb-6">
        <ModuleToggle moduleKey="portfolio" moduleName="Portfolio" />
      </div>

      <div className="glass-card rounded-[20px] border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6A00]/15 text-[#FF8A33]">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Portfolio management</h2>
            <p className="text-sm text-gray-400">The portfolio section is ready for your featured projects and case studies.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
