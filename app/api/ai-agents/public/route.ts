import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const agents = await prisma.aiAgent.findMany({
      where: { 
        status: true,
        isPublic: true,
      },
      include: {
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error fetching public AI agents:', error)
    return NextResponse.json({ error: 'Failed to fetch AI agents' }, { status: 500 })
  }
}
