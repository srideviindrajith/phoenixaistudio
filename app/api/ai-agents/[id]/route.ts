import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function resolvePackageId(packageId: unknown) {
  const normalizedPackageId =
    typeof packageId === 'string' && packageId.trim()
      ? packageId.trim()
      : null

  if (!normalizedPackageId) {
    return { packageId: null, error: null as string | null }
  }

  const existingPackage = await prisma.package.findUnique({
    where: { id: normalizedPackageId },
    select: { id: true },
  })

  if (!existingPackage) {
    return { packageId: null, error: 'Selected package does not exist' }
  }

  return { packageId: existingPackage.id, error: null as string | null }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const agent = await prisma.aiAgent.findUnique({
      where: { id },
      include: {
        package: true,
      },
    })
    if (!agent) {
      return NextResponse.json({ error: 'AI Agent not found' }, { status: 404 })
    }
    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Error fetching AI agent:', error)
    return NextResponse.json({ error: 'Failed to fetch AI agent' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const { packageId, error } = await resolvePackageId(data.packageId)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    const agent = await prisma.aiAgent.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        longDescription: data.longDescription,
        image: data.image,
        price: parseFloat(data.price) || 0,
        features: data.features,
        category: data.category,
        agentType: data.agentType,
        tags: data.tags,
        status: data.status !== undefined ? data.status : true,
        isPublic: data.isPublic !== undefined ? data.isPublic : false,
        packageId,
        aiInstructions: data.aiInstructions,
        businessKnowledge: data.businessKnowledge,
        systemPrompt: data.systemPrompt,
      },
      include: {
        package: true,
      },
    })
    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Error updating AI agent:', error)
    return NextResponse.json({ error: 'Failed to update AI agent' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.aiAgent.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting AI agent:', error)
    return NextResponse.json({ error: 'Failed to delete AI agent' }, { status: 500 })
  }
}
