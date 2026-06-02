import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const results = await prisma.assessmentResult.findMany({
    where: { userId: session.id },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(results)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body: Array<{ categoryId: number; score: number }> = await request.json()

  const results = await Promise.all(
    body.map(({ categoryId, score }) => {
      const grade = Math.ceil(score / 20)
      return prisma.assessmentResult.create({
        data: { userId: session.id, categoryId, score, grade },
        include: { category: true },
      })
    })
  )

  return Response.json(results, { status: 201 })
}
