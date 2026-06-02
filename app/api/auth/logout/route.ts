import { COOKIE_NAME_EXPORT } from '@/lib/auth'

export async function POST() {
  const response = Response.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME_EXPORT}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  )
  return response
}
