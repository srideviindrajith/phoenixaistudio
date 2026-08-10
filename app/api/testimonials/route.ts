import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const includeAll = request.nextUrl.searchParams.get('all') === 'true'
    const testimonials = await prisma.testimonial.findMany({
      where: includeAll ? undefined : { approved: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        role: data.role,
        company: data.company,
        content: data.content,
        rating: parseInt(data.rating) || 5,
        image: data.image,
        approved: data.approved || false,
        order: data.order || 0,
      },
    })
    return NextResponse.json({ testimonial })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
