import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const skillElementId = searchParams.get('skillElementId')
  const minLevel = searchParams.get('minLevel')

  const contents = await prisma.trainingContent.findMany({
    where: {
      ...(skillElementId ? { skillElementId: parseInt(skillElementId) } : {}),
      ...(minLevel ? { minLevel: { lte: parseInt(minLevel) } } : {}),
    },
    include: { skillElement: { include: { category: true } } },
    orderBy: [{ skillElementId: 'asc' }, { minLevel: 'asc' }],
  })
  return Response.json(contents)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { trainingContentId, durationMinutes, memo } = await request.json()

  const log = await prisma.studyLog.create({
    data: {
      userId: session.id,
      trainingContentId,
      durationMinutes: durationMinutes || 0,
      memo: memo || '',
    },
    include: { trainingContent: { include: { skillElement: { include: { category: true } } } } },
  })
  return Response.json(log, { status: 201 })
}
