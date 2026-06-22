import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await prisma.learningPlan.findFirst({
    where: { userId: session.id, status: 'ACTIVE' },
    include: {
      items: {
        include: { trainingContent: { include: { skillElement: { include: { category: true } } } } },
        orderBy: { order: 'asc' },
      },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(plan)
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, status } = await request.json()

  const item = await prisma.learningPlanItem.update({
    where: { id: itemId },
    data: { status },
  })
  return Response.json(item)
}
