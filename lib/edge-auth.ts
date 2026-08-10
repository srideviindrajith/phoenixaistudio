import { verifyJwtToken } from './jwt'

export async function verifyTokenEdge(token: string): Promise<{ adminId: string; email: string } | null> {
  const payload = await verifyJwtToken(token)

  if (!payload) {
    return null
  }

  return {
    adminId: payload.adminId as string,
    email: payload.email as string,
  }
}
