import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { AUTH_COOKIE_NAME } from '@/lib/auth-cookie'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)

    if (!payload) {
      const response = NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      response.cookies.delete(AUTH_COOKIE_NAME)
      return response
    }

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
      select: { id: true, email: true, name: true, createdAt: true },
    })

    if (!admin) {
      const response = NextResponse.json({ error: 'Admin not found' }, { status: 404 })
      response.cookies.delete(AUTH_COOKIE_NAME)
      return response
    }

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
