'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import SkillRadarChart from '@/components/charts/SkillRadarChart'

interface SkillElement {
  id: number
  name: string
  icon: string
  category: { name: string; icon: string }
}

interface SkillCategory {
  id: number
  name: string
  icon: string
  elements: SkillElement[]
}

interface Feedback {
  id: number
  content: string
  createdAt: string
  mentor: { name: string }
  skillElement: { name: string; icon: string; category: { name: string } } | null
}

interface Improvement {
  id: number
  issue: string
  action: string
  result: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  createdAt: string
}

interface StudyLog {
  id: number
  durationMinutes: number
  memo: string
  loggedAt: string
  trainingContent: { title: string; skillElement: { name: string } } | null
}

interface Assessment {
  skillElementId: number
  score: number
  level: number
  skillElement: SkillElement
}

const statusConfig = {
  OPEN: { label: '未対応', color: 'bg-yellow-100 text-yellow-700' },
  IN_PROGRESS: { label: '対応中', color: 'bg-blue-100 text-blue-700' },
  RESOLVED: { label: '解決済', color: 'bg-green-100 text-green-700' },
}

export default function MentorMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const memberId = parseInt(id)

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [logs, setLogs] = useState<StudyLog[]>([])
  const [memberName, setMemberName] = useState('')

  const [fbForm, setFbForm] = useState({ content: '', skillElementId: '' })
  const [impForm, setImpForm] = useState({ issue: '', action: '' })
  const [submittingFb, setSubmittingFb] = useState(false)
  const [submittingImp, setSubmittingImp] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/skills').then(r => r.json()),
      fetch(`/api/assessments?userId=${memberId}`).then(r => r.json()),
      fetch(`/api/feedback?memberId=${memberId}`).then(r => r.json()),
      fetch(`/api/improvement?memberId=${memberId}`).then(r => r.json()),
      fetch(`/api/logs?userId=${memberId}`).then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
    ]).then(([cats, assess, fb, imp, studyLogs, members]) => {
      setCategories(cats)
      setAssessments(assess)
      setFeedback(fb)
      setImprovements(imp)
      setLogs(studyLogs)
      const member = members.find((m: { id: number; name: string }) => m.id === memberId)
      if (member) setMemberName(member.name)
    })
  }, [memberId])

  const allElements = categories.flatMap((cat) => cat.elements)

  const latestByElement: Record<number, Assessment> = {}
  for (const a of assessments) {
    if (!latestByElement[a.skillElementId]) latestByElement[a.skillElementId] = a
  }

  const radarData = allElements.map((el) => ({
    category: el.name,
    score: latestByElement[el.id]?.score ?? 0,
    fullMark: 100,
  }))

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingFb(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, content: fbForm.content, skillElementId: fbForm.skillElementId ? parseInt(fbForm.skillElementId) : null }),
      })
      const newFb = await res.json()
      setFeedback((prev) => [newFb, ...prev])
      setFbForm({ content: '', skillElementId: '' })
    } finally {
      setSubmittingFb(false)
    }
  }

  async function submitImprovement(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingImp(true)
    try {
      const res = await fetch('/api/improvement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, issue: impForm.issue, action: impForm.action }),
      })
      const newImp = await res.json()
      setImprovements((prev) => [newImp, ...prev])
      setImpForm({ issue: '', action: '' })
    } finally {
      setSubmittingImp(false)
    }
  }

  async function updateImprovementStatus(impId: number, status: string) {
    await fetch('/api/improvement', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: impId, status }),
    })
    setImprovements((prev) => prev.map((i) => i.id === impId ? { ...i, status: status as Improvement['status'] } : i))
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/mentor" className="text-slate-400 hover:text-slate-600 text-sm">← 一覧へ</Link>
        <h1 className="text-2xl font-bold text-slate-800">{memberName || 'メンバー詳細'}</h1>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">スキルマップ</h2>
          <SkillRadarChart data={radarData} />
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-slate-700">スキル詳細</h2>
          {categories.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-slate-500 mb-1">{cat.icon} {cat.name}</p>
              <div className="space-y-1 pl-3">
                {cat.elements.map((el) => {
                  const latest = latestByElement[el.id]
                  return (
                    <div key={el.id} className="flex items-center gap-2 text-sm">
                      <span className="text-xs w-4">{el.icon}</span>
                      <span className="text-slate-700 text-xs w-32 truncate">{el.name}</span>
                      {latest ? (
                        <>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${latest.score}%` }} />
                          </div>
                          <span className="text-slate-500 text-xs w-16 text-right">{latest.score}点 / L{latest.level}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs">未受検</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">最近の学習</h3>
            {logs.slice(0, 3).map((log) => (
              <div key={log.id} className="text-xs text-slate-500 flex justify-between py-1">
                <span className="line-clamp-1 flex-1">{log.trainingContent?.title ?? log.memo}</span>
                <span className="ml-2 shrink-0">{new Date(log.loggedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">フィードバックを送る</h2>
            <form onSubmit={submitFeedback} className="space-y-3">
              <select
                value={fbForm.skillElementId}
                onChange={(e) => setFbForm((p) => ({ ...p, skillElementId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">スキル要素なし</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                    {cat.elements.map((el) => (
                      <option key={el.id} value={el.id}>{el.icon} {el.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <textarea
                value={fbForm.content}
                onChange={(e) => setFbForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="フィードバック内容を入力..."
                required
              />
              <button
                type="submit"
                disabled={submittingFb}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submittingFb ? '送信中...' : 'フィードバックを送る'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">フィードバック履歴</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {feedback.length === 0 ? (
                <p className="text-sm text-slate-400">フィードバックはありません</p>
              ) : feedback.map((fb) => (
                <div key={fb.id} className="border-b border-slate-50 pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    {fb.skillElement && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {fb.skillElement.icon} {fb.skillElement.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="text-sm text-slate-700">{fb.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">改善サイクルを追加</h2>
            <form onSubmit={submitImprovement} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">課題</label>
                <input
                  value={impForm.issue}
                  onChange={(e) => setImpForm((p) => ({ ...p, issue: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="解決すべき課題"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">対応策</label>
                <textarea
                  value={impForm.action}
                  onChange={(e) => setImpForm((p) => ({ ...p, action: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="具体的な対応策"
                />
              </div>
              <button
                type="submit"
                disabled={submittingImp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submittingImp ? '追加中...' : '改善サイクルを追加'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">改善プロセス一覧</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {improvements.length === 0 ? (
                <p className="text-sm text-slate-400">改善プロセスはありません</p>
              ) : improvements.map((imp) => {
                const cfg = statusConfig[imp.status]
                return (
                  <div key={imp.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                      <select
                        value={imp.status}
                        onChange={(e) => updateImprovementStatus(imp.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="OPEN">未対応</option>
                        <option value="IN_PROGRESS">対応中</option>
                        <option value="RESOLVED">解決済</option>
                      </select>
                    </div>
                    <p className="text-sm font-medium text-slate-800 mb-1">{imp.issue}</p>
                    {imp.action && <p className="text-xs text-slate-500">対応: {imp.action}</p>}
                    {imp.result && <p className="text-xs text-green-600 mt-1">結果: {imp.result}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
