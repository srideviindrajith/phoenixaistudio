import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, normalizeEmail } from '@/lib/auth'

export async function GET() {
  try {
    const existingAdmin = await prisma.admin.findFirst({
      select: { id: true },
    })

    return NextResponse.json({ needsSetup: !existingAdmin })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const existingAdmin = await prisma.admin.findFirst()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists. Please login.' },
        { status: 400 }
      )
    }

    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = normalizeEmail(email)
    const existingEmail = await prisma.admin.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'An admin with this email already exists.' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const admin = await prisma.admin.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name,
      },
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
