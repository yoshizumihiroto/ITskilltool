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

  const feedback = await prisma.feedback.findMany({
    where,
    include: {
      mentor: { select: { name: true } },
      member: { select: { name: true } },
      skillElement: { include: { category: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(feedback)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'MEMBER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { memberId, content, skillElementId } = await request.json()

  const fb = await prisma.feedback.create({
    data: {
      mentorId: session.id,
      memberId,
      content,
      skillElementId: skillElementId || null,
    },
    include: {
      mentor: { select: { name: true } },
      skillElement: { include: { category: true } },
    },
  })
  return Response.json(fb, { status: 201 })
}
