import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session || session.role === 'MEMBER') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const where =
    session.role === 'MENTOR'
      ? { mentorId: session.id }
      : session.teamId
        ? { teamId: session.teamId, role: 'MEMBER' as const }
        : { role: 'MEMBER' as const }

  const members = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      },
      studyLogs: {
        orderBy: { loggedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  })

  return Response.json(members)
}
