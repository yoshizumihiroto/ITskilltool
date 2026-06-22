'use client'

import { useState, useEffect } from 'react'
import SkillRadarChart from '@/components/charts/SkillRadarChart'

interface SkillLevel {
  level: number
  name: string
  descriptor: string
}

interface SkillElement {
  id: number
  name: string
  icon: string
  definition: string
  levels: SkillLevel[]
}

interface SkillCategory {
  id: number
  name: string
  icon: string
  elements: SkillElement[]
}

interface AssessmentResult {
  id: number
  skillElementId: number
  score: number
  level: number
  createdAt: string
  skillElement: { id: number; name: string; icon: string; category: { name: string } }
}

const levelLabels = ['L0 未学習', 'L1 基礎理解', 'L2 実務遂行', 'L3 自律推進', 'L4 リード', 'L5 高度化・標準化']

export default function AssessmentPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [scores, setScores] = useState<Record<number, number>>({})
  const [history, setHistory] = useState<AssessmentResult[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(setCategories)
    fetch('/api/assessments').then(r => r.json()).then(setHistory)
  }, [])

  const allElements = categories.flatMap((cat) => cat.elements)

  const latestByElement: Record<number, AssessmentResult> = {}
  for (const a of history) {
    if (!latestByElement[a.skillElementId]) latestByElement[a.skillElementId] = a
  }

  const radarData = allElements.map((el) => ({
    category: el.name,
    score: latestByElement[el.id]?.score ?? 0,
    fullMark: 100,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Object.keys(scores).length === 0) return
    setLoading(true)
    try {
      const body = Object.entries(scores).map(([skillElementId, score]) => ({
        skillElementId: parseInt(skillElementId),
        score,
      }))
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const newResults: AssessmentResult[] = await res.json()
      setHistory((prev) => [...newResults, ...prev])
      setSubmitted(true)
      setScores({})
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">スキルアセスメント</h1>
        <p className="text-slate-500 mt-1">各スキル要素のスコアを自己評価して記録しましょう</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">現在のスキルマップ</h2>
          <SkillRadarChart data={radarData} />

          <div className="mt-4 space-y-4">
            {categories.map((cat) => (
              <div key={cat.id}>
                <p className="text-xs font-semibold text-slate-500 mb-1">{cat.icon} {cat.name}</p>
                <div className="space-y-1 pl-3">
                  {cat.elements.map((el) => {
                    const latest = latestByElement[el.id]
                    return (
                      <div key={el.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 text-xs">{el.icon} {el.name}</span>
                        {latest ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${latest.score}%` }} />
                            </div>
                            <span className="text-slate-500 w-20 text-right text-xs">{latest.score}点 / L{latest.level}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">未受検</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {submitted && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              アセスメントを記録しました！
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-4">新規アセスメント入力</h2>
            <p className="text-sm text-slate-500 mb-4">0〜100点でスコアを入力してください（20点刻みでレベルが決まります）</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <p className="text-xs font-semibold text-slate-500 mb-2">{cat.icon} {cat.name}</p>
                  <div className="space-y-3 pl-3">
                    {cat.elements.map((el) => (
                      <div key={el.id}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {el.icon} {el.name}
                          {scores[el.id] !== undefined && (
                            <span className="ml-2 text-blue-600 text-xs">
                              → {levelLabels[Math.min(5, scores[el.id] === 0 ? 0 : Math.ceil(scores[el.id] / 20))]}
                            </span>
                          )}
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={scores[el.id] ?? 0}
                            onChange={(e) => setScores((prev) => ({ ...prev, [el.id]: parseInt(e.target.value) }))}
                            className="flex-1"
                          />
                          <span className="w-10 text-right text-sm text-slate-600">{scores[el.id] ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading || Object.keys(scores).length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? '記録中...' : 'アセスメントを記録する'}
              </button>
            </form>
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-semibold text-slate-700 mb-4">受検履歴</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {history.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="text-slate-700 text-xs">{r.skillElement.icon} {r.skillElement.name}</span>
                    <span className="text-blue-600 font-medium text-xs">{r.score}点 (L{r.level})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
