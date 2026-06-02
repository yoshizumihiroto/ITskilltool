import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SkillRadarChart from '@/components/charts/SkillRadarChart'

export default async function MemberDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [assessments, logs, plan, categories] = await Promise.all([
    prisma.assessmentResult.findMany({
      where: { userId: session.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studyLog.findMany({
      where: { userId: session.id },
      include: { trainingContent: { include: { category: true } } },
      orderBy: { loggedAt: 'desc' },
      take: 5,
    }),
    prisma.learningPlan.findFirst({
      where: { userId: session.id, status: 'ACTIVE' },
      include: {
        items: { include: { trainingContent: true }, orderBy: { order: 'asc' } },
      },
    }),
    prisma.skillCategory.findMany({ orderBy: { id: 'asc' } }),
  ])

  const latestByCategory: Record<number, { score: number; grade: number }> = {}
  for (const a of assessments) {
    if (!latestByCategory[a.categoryId]) {
      latestByCategory[a.categoryId] = { score: a.score, grade: a.grade }
    }
  }

  const radarData = categories.map((cat) => ({
    category: cat.name,
    score: latestByCategory[cat.id]?.score ?? 0,
    fullMark: 100,
  }))

  const totalMinutes = (await prisma.studyLog.findMany({ where: { userId: session.id } }))
    .reduce((s, l) => s + l.durationMinutes, 0)

  const planDone = plan?.items.filter((i) => i.status === 'DONE').length ?? 0
  const planTotal = plan?.items.length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">ダッシュボード</h1>
        <p className="text-slate-500 mt-1">こんにちは、{session.name}さん</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">総学習時間</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{Math.floor(totalMinutes / 60)}<span className="text-lg font-normal text-slate-500">時間</span></p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">プラン進捗</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{planTotal > 0 ? Math.round((planDone / planTotal) * 100) : 0}<span className="text-lg font-normal text-slate-500">%</span></p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">アセスメント受検数</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{new Set(assessments.map(a => a.categoryId)).size}<span className="text-lg font-normal text-slate-500">/ {categories.length}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">スキルマップ</h2>
            <Link href="/member/assessment" className="text-xs text-blue-600 hover:underline">アセスメント受検 →</Link>
          </div>
          <SkillRadarChart data={radarData} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">学習プラン</h2>
              <Link href="/member/plan" className="text-xs text-blue-600 hover:underline">詳細 →</Link>
            </div>
            {plan ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${planTotal > 0 ? (planDone / planTotal) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600">{planDone}/{planTotal}</span>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{plan.shortTermGoal}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">プランが設定されていません</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-700">最近の学習ログ</h2>
              <Link href="/member/log" className="text-xs text-blue-600 hover:underline">すべて →</Link>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400">学習ログがありません</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-400 shrink-0 text-xs mt-0.5">
                      {new Date(log.loggedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </span>
                    <div>
                      <p className="text-slate-700 line-clamp-1">{log.trainingContent?.title ?? log.memo}</p>
                      <p className="text-xs text-slate-400">{log.durationMinutes}分</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
