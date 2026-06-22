'use client'

import { useState, useEffect } from 'react'

interface TrainingContent {
  id: number
  title: string
  durationMinutes: number
  category: { name: string; icon: string }
}

interface PlanItem {
  id: number
  order: number
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE'
  trainingContent: TrainingContent
}

interface Plan {
  id: number
  shortTermGoal: string
  midTermGoal: string
  status: string
  items: PlanItem[]
  createdBy: { name: string }
}

const statusConfig = {
  PENDING: { label: '未着手', color: 'bg-slate-100 text-slate-600', icon: '○' },
  IN_PROGRESS: { label: '進行中', color: 'bg-blue-100 text-blue-700', icon: '◎' },
  DONE: { label: '完了', color: 'bg-green-100 text-green-700', icon: '✓' },
}

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then((data) => {
      setPlan(data)
      setLoading(false)
    })
  }, [])

  async function handleStatusChange(itemId: number, newStatus: PlanItem['status']) {
    await fetch('/api/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, status: newStatus }),
    })
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        ),
      }
    })
  }

  if (loading) return <div className="text-slate-400 text-sm">読み込み中...</div>

  if (!plan) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-8">学習プラン</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400">メンターが学習プランを作成するまでお待ちください</p>
        </div>
      </div>
    )
  }

  const done = plan.items.filter((i) => i.status === 'DONE').length
  const total = plan.items.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">学習プラン</h1>
        <p className="text-slate-500 mt-1">作成者: {plan.createdBy.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500 mb-2">短期目標（3ヶ月）</h2>
          <p className="text-slate-800">{plan.shortTermGoal}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500 mb-2">中長期目標（6ヶ月〜）</h2>
          <p className="text-slate-800">{plan.midTermGoal}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">学習ステップ</h2>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-slate-100 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-slate-600">{done}/{total} 完了 ({progress}%)</span>
          </div>
        </div>

        <div className="space-y-3">
          {plan.items.map((item) => {
            const cfg = statusConfig[item.status]
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  item.status === 'DONE' ? 'border-green-100 bg-green-50' : 'border-slate-100'
                }`}
              >
                <span className="text-slate-400 text-sm w-6 text-center">{item.order}</span>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${item.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {item.trainingContent.category.icon} {item.trainingContent.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.trainingContent.category.name} • {item.trainingContent.durationMinutes}分
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as PlanItem['status'])}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PENDING">未着手</option>
                    <option value="IN_PROGRESS">進行中</option>
                    <option value="DONE">完了</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
