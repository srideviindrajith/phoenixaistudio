import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/prisma/generated-client-v2'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const services = await prisma.salonService.findMany({
      where: {
        status: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Services API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, price, duration, category, image, order } = await req.json()

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const service = await prisma.salonService.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        duration: duration || 30,
        category: category || null,
        image: image || null,
        order: order || 0
      }
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
