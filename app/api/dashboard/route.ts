import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session || !['TM', 'ADMIN'].includes(session.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const members = await prisma.user.findMany({
    where: {
      role: 'MEMBER',
      ...(session.teamId ? { teamId: session.teamId } : {}),
    },
    select: {
      id: true,
      name: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        include: { skillElement: { include: { category: true } } },
      },
      studyLogs: {
        select: { durationMinutes: true, loggedAt: true },
        orderBy: { loggedAt: 'desc' },
      },
    },
  })

  const skillElements = await prisma.skillElement.findMany({
    include: { category: true },
    orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
  })

  const memberStats = members.map((m) => {
    const latestByElement: Record<number, number> = {}
    for (const a of m.assessments) {
      if (latestByElement[a.skillElementId] === undefined) {
        latestByElement[a.skillElementId] = a.score
      }
    }

    const totalMinutes = m.studyLogs.reduce((s, l) => s + l.durationMinutes, 0)
    const avgScore =
      Object.values(latestByElement).length > 0
        ? Math.round(Object.values(latestByElement).reduce((a, b) => a + b, 0) / Object.values(latestByElement).length)
        : 0

    return {
      id: m.id,
      name: m.name,
      totalMinutes,
      avgScore,
      scoresByElement: latestByElement,
      lastLogAt: m.studyLogs[0]?.loggedAt || null,
    }
  })

  return Response.json({ members: memberStats, skillElements })
}
