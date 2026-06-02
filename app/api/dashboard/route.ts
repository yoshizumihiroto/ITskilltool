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
        include: { category: true },
      },
      studyLogs: {
        select: { durationMinutes: true, loggedAt: true },
        orderBy: { loggedAt: 'desc' },
      },
    },
  })

  const categories = await prisma.skillCategory.findMany({ orderBy: { id: 'asc' } })

  const memberStats = members.map((m) => {
    const latestByCategory: Record<number, number> = {}
    for (const a of m.assessments) {
      if (latestByCategory[a.categoryId] === undefined) {
        latestByCategory[a.categoryId] = a.score
      }
    }

    const totalMinutes = m.studyLogs.reduce((s, l) => s + l.durationMinutes, 0)
    const avgScore =
      Object.values(latestByCategory).length > 0
        ? Math.round(Object.values(latestByCategory).reduce((a, b) => a + b, 0) / Object.values(latestByCategory).length)
        : 0

    return {
      id: m.id,
      name: m.name,
      totalMinutes,
      avgScore,
      scoresByCategory: latestByCategory,
      lastLogAt: m.studyLogs[0]?.loggedAt || null,
    }
  })

  return Response.json({ members: memberStats, categories })
}
