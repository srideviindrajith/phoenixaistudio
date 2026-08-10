import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const model = await prisma.demoModel.findUnique({
      where: { id },
    })
    if (!model) {
      return NextResponse.json({ error: 'Demo Model not found' }, { status: 404 })
    }
    return NextResponse.json({ model })
  } catch (error) {
    console.error('Error fetching demo model:', error)
    return NextResponse.json({ error: 'Failed to fetch demo model' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const model = await prisma.demoModel.update({
      where: { id },
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
    console.error('Error updating demo model:', error)
    return NextResponse.json({ error: 'Failed to update demo model' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.demoModel.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting demo model:', error)
    return NextResponse.json({ error: 'Failed to delete demo model' }, { status: 500 })
  }
}
