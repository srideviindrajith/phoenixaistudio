import { NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      category,
      tagline,
      description,
      features,
      benefits,
      technologies,
      ctaButtonText,
      ctaLink,
      icon,
      gradient,
      accentColor,
      thumbnail,
      coverImage,
      backgroundGradient,
      status,
      visibility,
      featured,
      order,
      badge,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        category,
        tagline,
        description,
        features: Array.isArray(features) ? features.join('\n') : features,
        benefits: benefits ? (Array.isArray(benefits) ? benefits.join('\n') : benefits) : null,
        technologies: technologies ? (Array.isArray(technologies) ? technologies.join('\n') : technologies) : null,
        ctaButtonText,
        ctaLink,
        icon,
        gradient,
        accentColor,
        thumbnail,
        coverImage,
        backgroundGradient,
        status: status || 'draft',
        visibility: visibility || 'private',
        featured: featured || false,
        order: order || 0,
        badge,
        seoTitle,
        seoDescription,
        seoKeywords
      }
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
