import { PublicLayout } from '@/components/public/public-layout'
import { Star, Quote, MessageSquareQuote } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const metadata = {
  title: 'Testimonials | PhoenixAI Studio',
  description: 'Read what our clients say about our AI solutions and services.',
}

export const dynamic = 'force-dynamic'

async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { order: 'asc' },
    })
    return testimonials
  } catch {
    return []
  }
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials()

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-8 pb-16 pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,106,0,0.10),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(204,79,0,0.08),transparent_30%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <MessageSquareQuote className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-sm font-medium text-gray-300">Client Stories</span>
          </div>

          <h1 className="mx-auto mb-6 max-w-5xl font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="text-white">Client </span>
            <span className="gradient-text">Testimonials</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[#A1A1AA] md:text-xl">
            Hear from businesses that have transformed their operations with our AI solutions.
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <section className="section-padding-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="phoenix-card flex h-full flex-col p-8">
                    {/* Quote icon */}
                    <div className="relative mb-6">
                      <Quote className="w-10 h-10 text-[#FF6A00]/20 transition-all duration-500 group-hover:text-[#FF6A00]/40" />
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`transition-all duration-300 ${
                            i < testimonial.rating ? 'scale-100' : 'scale-90'
                          }`}
                          style={{ transitionDelay: `${i * 30}ms` }}
                        >
                          <Star
                            className={`w-5 h-5 transition-colors duration-300 ${
                              i < testimonial.rating
                                ? 'text-[#FF6A00] fill-[#FF6A00]'
                                : 'text-gray-600 fill-gray-600'
                            }`}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Quote text */}
                    <blockquote className="text-gray-300 text-base leading-relaxed mb-8 flex-grow italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </blockquote>

                    {/* Author info */}
                    <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6A00] to-[#CC4F00] text-lg font-bold text-white shadow-lg shadow-[#FF6A00]/20">
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            testimonial.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {/* Glow effect */}
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#FF6A00]/30 to-[#CC4F00]/30 blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>

                      {/* Name and title */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-base truncate">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          {testimonial.role}
                          {testimonial.company && (
                            <span className="text-gray-500"> at </span>
                          )}
                          {testimonial.company && (
                            <span className="text-[#FF6A00]">{testimonial.company}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-[#FF6A00]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Testimonials Coming Soon
              </h3>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                Our clients&apos; success stories are being collected. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trust indicator section */}
      <section className="section-padding-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-[20px] p-8 text-center md:p-10">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              Join Our Success Stories
            </h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto leading-relaxed">
              Ready to transform your business? Let&apos;s discuss how we can help you achieve your goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact" className="btn-fire">
                Start Your Project
              </a>
              <a href="/portfolio" className="btn-fire-outline">
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
