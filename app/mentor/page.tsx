'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AssessmentResult {
  categoryId: number
  score: number
  grade: number
  category: { name: string; icon: string }
}

interface StudyLog {
  loggedAt: string
}

interface Member {
  id: number
  name: string
  email: string
  assessments: AssessmentResult[]
  studyLogs: StudyLog[]
}

export default function MentorPage() {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    fetch('/api/members').then(r => r.json()).then(setMembers)
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">担当メンバー一覧</h1>
        <p className="text-slate-500 mt-1">メンバーをクリックして詳細・フィードバックを確認できます</p>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center text-slate-400">
          担当メンバーがいません
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {members.map((member) => {
            const latestByCategory: Record<number, AssessmentResult> = {}
            for (const a of member.assessments) {
              if (!latestByCategory[a.categoryId]) latestByCategory[a.categoryId] = a
            }
            const latestScores = Object.values(latestByCategory)
            const avgScore = latestScores.length > 0
              ? Math.round(latestScores.reduce((s, a) => s + a.score, 0) / latestScores.length)
              : null
            const lastLog = member.studyLogs[0]

            return (
              <Link
                key={member.id}
                href={`/mentor/members/${member.id}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  {avgScore !== null && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{avgScore}</p>
                      <p className="text-xs text-slate-400">平均スコア</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {Object.values(latestByCategory).slice(0, 3).map((a) => (
                    <div key={a.categoryId} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 w-4">{a.category.icon}</span>
                      <span className="text-slate-600 w-20 truncate">{a.category.name}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${a.score}%` }} />
                      </div>
                      <span className="text-slate-500 w-12 text-right">G{a.grade}</span>
                    </div>
                  ))}
                  {Object.values(latestByCategory).length === 0 && (
                    <p className="text-xs text-slate-400">アセスメント未受検</p>
                  )}
                </div>

                {lastLog && (
                  <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
                    最終学習: {new Date(lastLog.loggedAt).toLocaleDateString('ja-JP')}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
