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

export async function GET() {
  try {
    const agents = await prisma.aiAgent.findMany({
      include: {
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Error fetching AI agents:', error)
    return NextResponse.json({ error: 'Failed to fetch AI agents' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { packageId, error } = await resolvePackageId(data.packageId)

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }
    
    const agent = await prisma.aiAgent.create({
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
        isPublic: data.isPublic || false,
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
    console.error('Error creating AI agent:', error)
    return NextResponse.json({ error: 'Failed to create AI agent' }, { status: 500 })
  }
}
