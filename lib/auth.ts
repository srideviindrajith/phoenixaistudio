import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { generateJwtToken, verifyJwtToken } from './jwt'
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from './auth-cookie'

export interface JwtPayload {
  adminId: string
  email: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export { getAuthCookieOptions } from './auth-cookie'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(payload: JwtPayload): Promise<string> {
  return generateJwtToken({ adminId: payload.adminId, email: payload.email })
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const payload = await verifyJwtToken(token)

  if (!payload) {
    return null
  }

  return {
    adminId: payload.adminId as string,
    email: payload.email as string,
  }
}

export async function createAdmin(email: string, password: string, name: string) {
  const normalizedEmail = normalizeEmail(email)
  const hashedPassword = await hashPassword(password)
  return prisma.admin.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name,
    },
  })
}

export async function authenticateAdmin(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email)
  console.log('Authenticate Admin - Normalized Email:', normalizedEmail)

  const admin = await prisma.admin.findFirst({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
    },
  })

  console.log('Authenticate Admin - Prisma Result (admin found):', !!admin)

  if (!admin) {
    console.log('Authenticate Admin - No admin found for email:', normalizedEmail)
    return null
  }

  console.log('Authenticate Admin - Stored Hash:', admin.password.substring(0, 10) + '...') // Log partial hash for security
  const isValid = await verifyPassword(password, admin.password)
  console.log('Authenticate Admin - bcrypt.compare result:', isValid)
  if (!isValid) {
    return null
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  }
}
