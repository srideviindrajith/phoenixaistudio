import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const system = await prisma.coreSystem.findUnique({
      where: { id },
    })
    if (!system) {
      return NextResponse.json({ error: 'Core System not found' }, { status: 404 })
    }
    return NextResponse.json({ system })
  } catch (error) {
    console.error('Error fetching core system:', error)
    return NextResponse.json({ error: 'Failed to fetch core system' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const system = await prisma.coreSystem.update({
      where: { id },
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
    console.error('Error updating core system:', error)
    return NextResponse.json({ error: 'Failed to update core system' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.coreSystem.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting core system:', error)
    return NextResponse.json({ error: 'Failed to delete core system' }, { status: 500 })
  }
}
