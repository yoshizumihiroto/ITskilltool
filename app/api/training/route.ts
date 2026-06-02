import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const minGrade = searchParams.get('minGrade')

  const contents = await prisma.trainingContent.findMany({
    where: {
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
      ...(minGrade ? { minGrade: { lte: parseInt(minGrade) } } : {}),
    },
    include: { category: true },
    orderBy: [{ categoryId: 'asc' }, { minGrade: 'asc' }],
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
    include: { trainingContent: { include: { category: true } } },
  })
  return Response.json(log, { status: 201 })
}
