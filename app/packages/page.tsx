import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { Star } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PackagesListClient } from '@/components/public/packages-list-client'

export const metadata = {
  title: 'Packages | PhoenixAI Studio',
  description: 'Choose the perfect package for your project needs.',
}

export const revalidate = 60

async function getPackages() {
  try {
    const packages = await prisma.package.findMany({
      where: {
        status: 'Active',
        visibility: 'Public',
      },
      orderBy: [
        { popular: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        agents: {
          where: {
            isPublic: true,
            status: true,
          },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
          },
        },
        _count: {
          select: {
            agents: true,
          },
        },
      },
    })
    // Serialize Prisma decimal/date fields to match PackageItem interface
    return packages.map(pkg => ({
      ...pkg,
      price: Number(pkg.price),
      createdAt: pkg.createdAt.toISOString()
    }))
  } catch (error) {
    console.error('Error loading initial packages from DB:', error)
    return []
  }
}

async function getCareerBuilderVisibility() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'careerBuilderCategoryVisible' }
    })
    return setting?.value !== 'false'
  } catch (error) {
    console.error('Error fetching Career Builder visibility:', error)
    return true // Default to visible
  }
}

export default async function PackagesPage() {
  const packages = await getPackages()
  const careerBuilderVisible = await getCareerBuilderVisibility()

  // Filter out Career Builder packages if setting is OFF
  const filteredPackages = careerBuilderVisible 
    ? packages 
    : packages.filter(pkg => pkg.category !== 'Career Builder')

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.10),transparent_36%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Star className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Pricing Plans</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Our </span>
            <span className="gradient-text">Packages</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Choose the perfect package for your project. All packages include our premium support and quality guarantee.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="section-padding-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PackagesListClient initialPackages={filteredPackages} careerBuilderVisible={careerBuilderVisible} />
        </div>
      </section>

      {/* FAQ or Trust Section */}
      <section className="section-padding-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[20px] p-8 text-center md:p-10">
            <h3 className="text-2xl font-bold text-white mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto leading-relaxed">
              Every project is unique. If our packages don&apos;t fit your needs, we&apos;ll create a tailored solution that perfectly matches your requirements and budget.
            </p>
            <a href="/contact" className="btn-fire-outline inline-block">
              Request Custom Quote
            </a>
          </div>
        </div>
      </section>

      <ContactSection />
    </PublicLayout>
  )
}
