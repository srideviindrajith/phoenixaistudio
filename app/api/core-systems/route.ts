import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const systems = await prisma.coreSystem.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ systems })
  } catch (error) {
    console.error('Error fetching core systems:', error)
    return NextResponse.json({ error: 'Failed to fetch core systems' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const system = await prisma.coreSystem.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        image: data.image,
        launchUrl: data.launchUrl,
        devUrl: data.devUrl,
        prodUrl: data.prodUrl,
        version: data.version,
        environment: data.environment,
        icon: data.icon,
        banner: data.banner,
        status: data.status !== undefined ? data.status : true,
      },
    })
    return NextResponse.json({ system })
  } catch (error) {
    console.error('Error creating core system:', error)
    return NextResponse.json({ error: 'Failed to create core system' }, { status: 500 })
  }
}
