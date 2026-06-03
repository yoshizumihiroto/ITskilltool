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
  isAiGenerated: boolean
  learningText: string
  category: Category
}

const gradeLabels: Record<number, string> = { 1: 'L1', 2: 'L2', 3: 'L3', 4: 'L4', 5: 'L5' }
const gradeColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

export default function TMTrainingPage() {
  const [contents, setContents] = useState<TrainingContent[]>([])
  const [generating, setGenerating] = useState<number | null>(null)
  const [generated, setGenerated] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/training').then(r => r.json()).then((data: TrainingContent[]) => {
      setContents(data)
      const alreadyGenerated = new Set(data.filter(c => c.isAiGenerated).map(c => c.id))
      setGenerated(alreadyGenerated)
    })
  }, [])

  async function handleGenerate(content: TrainingContent) {
    setGenerating(content.id)
    setError(null)
    try {
      const res = await fetch('/api/training/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingContentId: content.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'AI生成に失敗しました')
        return
      }
      setGenerated(prev => new Set([...prev, content.id]))
      setContents(prev => prev.map(c => c.id === content.id ? { ...c, isAiGenerated: true } : c))
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">研修コンテンツ管理</h1>
        <p className="text-slate-500 mt-1">各コンテンツにAIで学習テキスト・クイズを生成できます</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {generating !== null && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 text-sm flex items-center gap-2">
          <span className="animate-spin">⟳</span>
          Claude AIが学習テキスト・クイズを生成中です（30秒ほどかかる場合があります）...
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {contents.map((content) => {
          const isGen = generated.has(content.id)
          const isLoading = generating === content.id
          return (
            <div key={content.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{content.category.icon}</span>
                    <span className="text-xs text-slate-500 truncate">{content.category.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${gradeColors[content.minGrade]}`}>
                      {gradeLabels[content.minGrade]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">{content.title}</h3>
                </div>
                {isGen && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full shrink-0 font-medium">
                    ✓ AI生成済
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{content.description}</p>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <span className="text-xs text-slate-400">⏱ {content.durationMinutes}分</span>
                <button
                  onClick={() => handleGenerate(content)}
                  disabled={isLoading || generating !== null}
                  className={`text-xs px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium ${
                    isGen
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isLoading ? '生成中...' : isGen ? '再生成する' : 'AIで生成する'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
