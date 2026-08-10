import { NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: {
        status: 'published',
        visibility: 'public'
      },
      orderBy: [
        { order: 'asc' },
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching public services:', error)
    return NextResponse.json({ error: 'Failed to fetch public services' }, { status: 500 })
  }
}
