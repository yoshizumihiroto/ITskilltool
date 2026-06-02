import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { createToken, COOKIE_NAME_EXPORT } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return Response.json({ error: 'メールアドレスとパスワードを入力してください' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return Response.json({ error: 'メールアドレスまたはパスワードが正しくありません' }, { status: 401 })
  }

  const token = await createToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as 'MEMBER' | 'MENTOR' | 'TM' | 'ADMIN',
    teamId: user.teamId,
  })

  const response = Response.json({ ok: true, role: user.role })
  response.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME_EXPORT}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${8 * 3600}`
  )
  return response
}
