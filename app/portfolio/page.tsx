import { PublicLayout } from '@/components/public/public-layout'
import { ContactSection } from '@/components/public/contact-section'
import { ExternalLink, ArrowUpRight, Sparkles, FolderKanban } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Portfolio | PhoenixAI Studio',
  description: 'Explore our portfolio of successful AI-powered projects and solutions.',
}

export const revalidate = 60

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return projects
  } catch {
    return []
  }
}

const categoryColors: Record<string, string> = {
  'AI Solution': '#FF6A00',
  'Web Application': '#CC4F00',
  'Mobile App': '#FF8A33',
  'Data Analytics': '#F59E0B',
  'Cloud Solution': '#3B82F6',
}

export default async function PortfolioPage() {
  const projects = await getProjects()

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_0%,rgba(255,106,0,0.10),transparent_34%),radial-gradient(circle_at_20%_100%,rgba(204,79,0,0.08),transparent_30%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <FolderKanban className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Our Work</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Our </span>
            <span className="gradient-text">Portfolio</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Explore our collection of successful projects spanning AI, web, and mobile development.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="section-padding-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {projects.map((project, index) => {
                const categoryColor = categoryColors[project.category] || '#FF6A00'

                return (
                  <div
                    key={project.id}
                    className="group relative"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="phoenix-card flex h-full flex-col overflow-hidden p-0">
                      {/* Image Container */}
                      <div className="relative h-56 overflow-hidden bg-[#0a0a0a]">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#FF6A00]/5 to-[#CC4F00]/5">
                            <span className="text-8xl font-bold text-[#FF6A00]/20">
                              {project.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
                            style={{
                              background: `${categoryColor}20`,
                              backdropFilter: 'blur(8px)',
                              border: `1px solid ${categoryColor}40`,
                            }}
                          >
                            {project.category}
                          </span>
                        </div>

                        {/* Featured badge */}
                        {project.featured && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#CC4F00] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                              <Sparkles className="w-3 h-3" />
                              Featured
                            </span>
                          </div>
                        )}

                        {/* External link button */}
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-[#FF6A00]/30 hover:scale-110"
                          >
                            <ExternalLink className="w-4 h-4 text-white" />
                          </a>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-semibold text-white mb-3 transition-colors duration-300 group-hover:text-[#FF6A00]">
                          {project.title}
                        </h3>

                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2 flex-grow">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies && (
                          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                            {project.technologies.split(',').slice(0, 4).map((tech, i) => (
                              <span
                                key={i}
                                className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg transition-colors duration-300 group-hover:bg-[#FF6A00]/10 group-hover:text-[#FF6A00]"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
                <ArrowUpRight className="w-12 h-12 text-[#FF6A00]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Projects Coming Soon
              </h3>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                Our portfolio is being updated with our latest work. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <ContactSection />
    </PublicLayout>
  )
}
