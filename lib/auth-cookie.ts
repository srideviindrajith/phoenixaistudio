export const AUTH_COOKIE_NAME = 'admin_token'

export function getAuthCookieOptions() {
  const isSecure = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }
}
