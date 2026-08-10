import { NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const service = await prisma.service.update({
      where: { id: params.id },
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
        status,
        visibility,
        featured,
        order,
        badge,
        seoTitle,
        seoDescription,
        seoKeywords
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 })
  }
}
