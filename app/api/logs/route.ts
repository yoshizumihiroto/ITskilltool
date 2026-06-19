import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const targetUserId = userId ? parseInt(userId) : session.id

  const logs = await prisma.studyLog.findMany({
    where: { userId: targetUserId },
    include: { trainingContent: { include: { skillElement: { include: { category: true } } } } },
    orderBy: { loggedAt: 'desc' },
  })
  return Response.json(logs)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { durationMinutes, memo, trainingContentId } = await request.json()

  const log = await prisma.studyLog.create({
    data: {
      userId: session.id,
      durationMinutes: durationMinutes || 0,
      memo: memo || '',
      trainingContentId: trainingContentId || null,
    },
    include: { trainingContent: { include: { skillElement: { include: { category: true } } } } },
  })
  return Response.json(log, { status: 201 })
}
