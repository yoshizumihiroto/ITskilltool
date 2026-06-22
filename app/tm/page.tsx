'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SkillElement {
  id: number
  name: string
  icon: string
  category: { name: string; icon: string }
}

interface MemberStat {
  id: number
  name: string
  totalMinutes: number
  avgScore: number
  scoresByElement: Record<number, number>
  lastLogAt: string | null
}

interface DashboardData {
  members: MemberStat[]
  skillElements: SkillElement[]
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#ef4444', '#14b8a6', '#f43f5e']

export default function TMDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData)
  }, [])

  if (!data) return <div className="text-slate-400 text-sm">読み込み中...</div>

  const { members, skillElements } = data

  const teamAvgScore = members.length > 0
    ? Math.round(members.reduce((s, m) => s + m.avgScore, 0) / members.length)
    : 0

  const totalTeamMinutes = members.reduce((s, m) => s + m.totalMinutes, 0)

  const elementAvgs = skillElements.map((el) => {
    const scores = members
      .map((m) => m.scoresByElement[el.id])
      .filter((s) => s !== undefined)
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    return { name: el.name, avg, icon: el.icon, gap: avg < 60 }
  })

  const learningData = members.map((m) => ({
    name: m.name.split(' ')[0],
    hours: Math.round(m.totalMinutes / 60 * 10) / 10,
    score: m.avgScore,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">チームダッシュボード</h1>
        <p className="text-slate-500 mt-1">チーム全体の学習・スキル状況を確認できます</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">チーム平均スコア</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{teamAvgScore}<span className="text-lg font-normal text-slate-500">点</span></p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">チーム総学習時間</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{Math.floor(totalTeamMinutes / 60)}<span className="text-lg font-normal text-slate-500">時間</span></p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">メンバー数</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{members.length}<span className="text-lg font-normal text-slate-500">名</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">スキル要素別平均スコア</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={elementAvgs} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(value) => [`${value}点`, '平均スコア']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {elementAvgs.map((entry, index) => (
                  <Cell key={index} fill={entry.gap ? '#f87171' : COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-500"></span> 通常</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-400"></span> 要強化（60点未満）</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">メンバー別学習時間</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={learningData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(value) => [`${value}時間`, '学習時間']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-50">
          <h2 className="font-semibold text-slate-700">メンバー別進捗テーブル</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">名前</th>
                {skillElements.map((el) => (
                  <th key={el.id} className="text-center px-3 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {el.icon} {el.name}
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">学習時間</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">平均スコア</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 whitespace-nowrap">最終学習日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {member.name[0]}
                      </div>
                      <span className="font-medium text-slate-800">{member.name}</span>
                    </div>
                  </td>
                  {skillElements.map((el) => {
                    const score = member.scoresByElement[el.id]
                    return (
                      <td key={el.id} className="text-center px-3 py-4">
                        {score !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-medium text-xs ${score < 60 ? 'text-red-600' : 'text-slate-700'}`}>
                              {score}点
                            </span>
                            <div className="w-10 bg-slate-100 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${score < 60 ? 'bg-red-400' : 'bg-blue-400'}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="text-center px-4 py-4 text-slate-600 whitespace-nowrap">{Math.floor(member.totalMinutes / 60)}時間</td>
                  <td className="text-center px-4 py-4 whitespace-nowrap">
                    <span className={`font-medium ${member.avgScore < 60 ? 'text-red-600' : 'text-slate-700'}`}>
                      {member.avgScore}点
                    </span>
                  </td>
                  <td className="text-right px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                    {member.lastLogAt ? new Date(member.lastLogAt).toLocaleDateString('ja-JP') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
