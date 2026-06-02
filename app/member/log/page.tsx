'use client'

import { useState, useEffect } from 'react'

interface StudyLog {
  id: number
  durationMinutes: number
  memo: string
  loggedAt: string
  trainingContent: { id: number; title: string; category: { name: string; icon: string } } | null
}

export default function LogPage() {
  const [logs, setLogs] = useState<StudyLog[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ memo: '', durationMinutes: 30 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/logs').then(r => r.json()).then(setLogs)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const newLog = await res.json()
      setLogs((prev) => [newLog, ...prev])
      setForm({ memo: '', durationMinutes: 30 })
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  const totalMinutes = logs.reduce((s, l) => s + l.durationMinutes, 0)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">学習ログ</h1>
          <p className="text-slate-500 mt-1">総学習時間: {Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + 学習を記録する
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">学習ログを手動追加</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学習内容・メモ</label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="例: 達人プログラマー第4章を読んだ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学習時間（分）</label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value) }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
                max={480}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? '記録中...' : '記録する'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-600 hover:text-slate-800 text-sm px-4 py-2"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            まだ学習ログがありません。研修を受講するか、手動で記録してください。
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-5">
                <div className="text-center min-w-12">
                  <p className="text-xs text-slate-400">
                    {new Date(log.loggedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.loggedAt).getFullYear()}
                  </p>
                </div>
                <div className="flex-1">
                  {log.trainingContent ? (
                    <div>
                      <p className="font-medium text-sm text-slate-800">
                        {log.trainingContent.category.icon} {log.trainingContent.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.trainingContent.category.name}</p>
                    </div>
                  ) : (
                    <p className="font-medium text-sm text-slate-800">{log.memo || '自由学習'}</p>
                  )}
                  {log.memo && log.trainingContent && (
                    <p className="text-sm text-slate-500 mt-1">{log.memo}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-slate-700">{log.durationMinutes}分</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
