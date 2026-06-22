import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.skillCategory.findMany({
    include: {
      elements: {
        include: { levels: { orderBy: { level: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  })
  return Response.json(categories)
}
