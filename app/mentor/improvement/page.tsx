'use client'

import { useState, useEffect } from 'react'

interface Improvement {
  id: number
  issue: string
  action: string
  result: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  createdAt: string
  member: { name: string }
}

const statusConfig = {
  OPEN: { label: '未対応', color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-100' },
  IN_PROGRESS: { label: '対応中', color: 'bg-blue-100 text-blue-700', border: 'border-blue-100' },
  RESOLVED: { label: '解決済', color: 'bg-green-100 text-green-700', border: 'border-green-100' },
}

export default function ImprovementPage() {
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    fetch('/api/improvement').then(r => r.json()).then(setImprovements)
  }, [])

  async function updateStatus(id: number, status: string) {
    await fetch('/api/improvement', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setImprovements((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: status as Improvement['status'] } : i)
    )
  }

  const filtered = filterStatus ? improvements.filter((i) => i.status === filterStatus) : improvements

  const counts = {
    OPEN: improvements.filter(i => i.status === 'OPEN').length,
    IN_PROGRESS: improvements.filter(i => i.status === 'IN_PROGRESS').length,
    RESOLVED: improvements.filter(i => i.status === 'RESOLVED').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">改善プロセス管理</h1>
        <p className="text-slate-500 mt-1">全担当メンバーの改善サイクルを一覧で管理できます</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((status) => {
          const cfg = statusConfig[status]
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              className={`p-4 rounded-xl border text-left transition-all ${
                filterStatus === status ? `${cfg.border} ${cfg.color}` : 'bg-white border-slate-100 hover:border-slate-200'
              } shadow-sm`}
            >
              <p className="text-2xl font-bold text-slate-800">{counts[status]}</p>
              <p className={`text-sm font-medium ${cfg.color.split(' ')[1]}`}>{cfg.label}</p>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center text-slate-400">
            改善プロセスがありません
          </div>
        ) : filtered.map((imp) => {
          const cfg = statusConfig[imp.status]
          return (
            <div key={imp.id} className={`bg-white rounded-xl p-5 shadow-sm border ${cfg.border}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-sm font-medium text-slate-700">{imp.member.name}</span>
                    <span className="text-xs text-slate-400">{new Date(imp.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="font-medium text-slate-800 mb-2">{imp.issue}</p>
                  {imp.action && (
                    <p className="text-sm text-slate-600 mb-1"><span className="font-medium">対応策:</span> {imp.action}</p>
                  )}
                  {imp.result && (
                    <p className="text-sm text-green-700"><span className="font-medium">結果:</span> {imp.result}</p>
                  )}
                </div>
                <select
                  value={imp.status}
                  onChange={(e) => updateStatus(imp.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none shrink-0"
                >
                  <option value="OPEN">未対応</option>
                  <option value="IN_PROGRESS">対応中</option>
                  <option value="RESOLVED">解決済</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
