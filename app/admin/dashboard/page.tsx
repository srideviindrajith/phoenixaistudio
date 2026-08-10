import { Users, Package, FolderKanban, MessageSquareQuote, Mail, Clock, ArrowRight, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { StatsCard } from '@/components/admin/stats-card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getStats() {
  try {
    const [leads, packages, projects, testimonials, contacts] = await Promise.all([
      prisma.lead.count(),
      prisma.package.count(),
      prisma.project.count(),
      prisma.testimonial.count({ where: { approved: true } }),
      prisma.contact.count({ where: { status: 'unread' } }),
    ])

    const newLeads = await prisma.lead.count({
      where: {
        status: 'new',
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })

    const convertedLeads = await prisma.lead.count({
      where: { status: 'converted' },
    })

    const pendingTestimonials = await prisma.testimonial.count({
      where: { approved: false },
    })

    return { leads, packages, projects, testimonials, contacts, newLeads, convertedLeads, pendingTestimonials }
  } catch {
    return { leads: 0, packages: 0, projects: 0, testimonials: 0, contacts: 0, newLeads: 0, convertedLeads: 0, pendingTestimonials: 0 }
  }
}

async function getRecentActivity() {
  try {
    const [recentLeads, recentContacts] = await Promise.all([
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contact.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return { recentLeads, recentContacts }
  } catch {
    return { recentLeads: [], recentContacts: [] }
  }
}

export const revalidate = 60

export default async function AdminDashboardPage() {
  const stats = await getStats()
  const { recentLeads, recentContacts } = await getRecentActivity()

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    contacted: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    qualified: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    converted: 'bg-green-500/10 text-green-400 border border-green-500/20',
    lost: 'bg-red-500/10 text-red-400 border border-red-500/20',
  }

  return (
    <div className="max-w-7xl space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Dashboard</h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link
          href="/admin/leads"
          className="phoenix-button"
        >
          View Leads
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.leads}
          icon={Users}
          trend={stats.newLeads > 0 ? `+${stats.newLeads} this week` : 'No new leads'}
          trendUp={stats.newLeads > 0}
          subtitle="All time"
        />
        <StatsCard
          title="Converted"
          value={stats.convertedLeads}
          icon={TrendingUp}
          trend={stats.leads > 0 ? `${Math.round((stats.convertedLeads / stats.leads) * 100)}% rate` : '0% rate'}
          trendUp={true}
          subtitle="Conversions"
        />
        <StatsCard
          title="Projects"
          value={stats.projects}
          icon={FolderKanban}
          subtitle="In portfolio"
        />
        <StatsCard
          title="Unread Messages"
          value={stats.contacts}
          icon={Mail}
          trend={stats.contacts > 0 ? 'Needs attention' : 'All read'}
          trendUp={stats.contacts === 0}
          subtitle="Contact forms"
        />
      </div>

      {/* Quick Actions */}
      {stats.pendingTestimonials > 0 && (
        <div className="glass-card rounded-[20px] border border-[#FF6A00]/20 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6A00]/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#FF6A00]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Pending Testimonials</p>
              <p className="text-sm text-gray-400">You have {stats.pendingTestimonials} testimonial(s) waiting for approval</p>
            </div>
            <Link
              href="/admin/testimonials"
            className="phoenix-button"
            >
              Review Now
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Leads - Takes 2 columns */}
        <div className="phoenix-table-wrap lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#FF6A00]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Recent Leads</h2>
                <p className="text-xs text-gray-500">Latest inquiries</p>
              </div>
            </div>
            <Link
              href="/admin/leads"
              className="flex items-center gap-1 text-sm text-[#FF8A33] transition-colors hover:text-white"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads?edit=${lead.id}`}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.035]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#CC4F00]/10 text-sm font-bold text-white">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate group-hover:text-[#FF6A00] transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{lead.email}</p>
                  </div>
                  <div className="hidden sm:block text-sm text-gray-500 truncate max-w-[150px]">
                    {lead.service || 'General inquiry'}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[lead.status] || 'bg-gray-500/10 text-gray-400'}`}
                  >
                    {lead.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p>No leads yet</p>
                <p className="text-sm mt-1">Leads will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="phoenix-table-wrap">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Messages</h2>
                <p className="text-xs text-gray-500">Contact forms</p>
              </div>
            </div>
            {stats.contacts > 0 && (
              <span className="px-2 py-1 rounded-lg bg-[#FF6A00]/10 text-[#FF6A00] text-xs font-medium">
                {stats.contacts} unread
              </span>
            )}
          </div>

          <div className="divide-y divide-white/5">
            {recentContacts.length > 0 ? (
              recentContacts.slice(0, 4).map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{contact.name}</p>
                      <p className="text-xs text-[#FF6A00] truncate mt-0.5">{contact.subject}</p>
                      <p className="text-xs text-gray-500 truncate mt-1">{contact.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p>No messages</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="phoenix-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#FF6A00]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.packages}</p>
              <p className="text-sm text-gray-400">Packages</p>
            </div>
          </div>
        </div>

        <div className="phoenix-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.projects}</p>
              <p className="text-sm text-gray-400">Projects</p>
            </div>
          </div>
        </div>

        <div className="phoenix-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MessageSquareQuote className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.testimonials}</p>
              <p className="text-sm text-gray-400">Testimonials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
