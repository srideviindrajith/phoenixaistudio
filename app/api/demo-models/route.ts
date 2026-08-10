import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.demoModel.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching demo models:', error)
    return NextResponse.json({ error: 'Failed to fetch demo models' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const model = await prisma.demoModel.create({
      data: {
        title: data.title,
        description: data.description,
        image: data.image,
        liveUrl: data.liveUrl,
        category: data.category,
        status: data.status !== undefined ? data.status : true,
      },
    })
    return NextResponse.json({ model })
  } catch (error) {
    console.error('Error creating demo model:', error)
    return NextResponse.json({ error: 'Failed to create demo model' }, { status: 500 })
  }
}
