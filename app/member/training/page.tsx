'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  icon: string
}

interface TrainingContent {
  id: number
  title: string
  description: string
  minGrade: number
  durationMinutes: number
  tags: string
  category: Category
}

const gradeLabels: Record<number, string> = { 1: '入門', 2: '基礎', 3: '応用', 4: '上級', 5: 'エキスパート' }
const gradeColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

export default function TrainingPage() {
  const [contents, setContents] = useState<TrainingContent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCategory, setFilterCategory] = useState<number | null>(null)
  const [filterGrade, setFilterGrade] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(setCategories)
    fetch('/api/training').then(r => r.json()).then(setContents)
  }, [])

  const filtered = contents.filter((c) => {
    if (filterCategory && c.category.id !== filterCategory) return false
    if (filterGrade && c.minGrade > filterGrade) return false
    return true
  })

  async function handleEnroll(content: TrainingContent) {
    setLoading(content.id)
    try {
      await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingContentId: content.id, durationMinutes: content.durationMinutes }),
      })
      setCompletedIds((prev) => new Set([...prev, content.id]))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">研修コンテンツ</h1>
        <p className="text-slate-500 mt-1">スキルを高めるための研修コンテンツ一覧</p>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterCategory ?? ''}
          onChange={(e) => setFilterCategory(e.target.value ? parseInt(e.target.value) : null)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>

        <select
          value={filterGrade ?? ''}
          onChange={(e) => setFilterGrade(e.target.value ? parseInt(e.target.value) : null)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべてのグレード</option>
          {[1, 2, 3, 4, 5].map((g) => (
            <option key={g} value={g}>G{g} {gradeLabels[g]}以下</option>
          ))}
        </select>

        <span className="ml-auto text-sm text-slate-400 self-center">{filtered.length}件</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map((content) => {
          const done = completedIds.has(content.id)
          return (
            <div key={content.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{content.category.icon}</span>
                    <span className="text-xs text-slate-500">{content.category.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gradeColors[content.minGrade]}`}>
                      G{content.minGrade} {gradeLabels[content.minGrade]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">{content.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{content.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {content.tags.split(',').map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-xs text-slate-400">⏱ {content.durationMinutes}分</span>
                {done ? (
                  <span className="text-xs text-green-600 font-medium">✓ 学習ログ記録済</span>
                ) : (
                  <button
                    onClick={() => handleEnroll(content)}
                    disabled={loading === content.id}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading === content.id ? '記録中...' : '受講する'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
