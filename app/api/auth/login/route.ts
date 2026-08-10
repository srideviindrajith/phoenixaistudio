import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, generateToken, normalizeEmail } from '@/lib/auth'
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '@/lib/auth-cookie'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    console.log('Login attempt with email:', email, 'and password:', password)

    if (!email.trim() || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await authenticateAdmin(normalizeEmail(email), password)

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await generateToken({
      adminId: admin.id,
      email: admin.email,
    })

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    })

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
