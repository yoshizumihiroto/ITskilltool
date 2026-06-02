import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get('memberId')

  const where =
    session.role === 'MEMBER'
      ? { memberId: session.id }
      : memberId
        ? { memberId: parseInt(memberId) }
        : { mentorId: session.id }

  const cycles = await prisma.improvementCycle.findMany({
    where,
    include: {
      member: { select: { name: true } },
      mentor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(cycles)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'MEMBER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { memberId, issue, action } = await request.json()

  const cycle = await prisma.improvementCycle.create({
    data: { mentorId: session.id, memberId, issue, action: action || '' },
    include: { member: { select: { name: true } } },
  })
  return Response.json(cycle, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'MEMBER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, action, result, status } = await request.json()

  const cycle = await prisma.improvementCycle.update({
    where: { id },
    data: {
      ...(action !== undefined ? { action } : {}),
      ...(result !== undefined ? { result } : {}),
      ...(status !== undefined ? { status } : {}),
    },
  })
  return Response.json(cycle)
}
