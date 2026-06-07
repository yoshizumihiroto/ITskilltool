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
  quizJson: string
  category: Category
}

interface QuizQuestion {
  question: string
  choices: string[]
  answer: number
  explanation: string
}

interface QuizResultItem {
  question: string
  choices: string[]
  chosen: number
  answer: number
  correct: boolean
  explanation: string
}

interface QuizResult {
  score: number
  correctCount: number
  totalCount: number
  assessedGrade: number
  results: QuizResultItem[]
}

const gradeLabels: Record<number, string> = { 1: 'L1 基礎理解', 2: 'L2 実務遂行', 3: 'L3 自律推進', 4: 'L4 リード', 5: 'L5 高度化' }
const gradeColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

type ModalStep = 'learning' | 'quiz' | 'result'

export default function TrainingPage() {
  const [contents, setContents] = useState<TrainingContent[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filterCategory, setFilterCategory] = useState<number | null>(null)
  const [filterGrade, setFilterGrade] = useState<number | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<number | null>(null)

  // Quiz modal state
  const [quizContent, setQuizContent] = useState<TrainingContent | null>(null)
  const [modalStep, setModalStep] = useState<ModalStep>('learning')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

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

  function openQuiz(content: TrainingContent) {
    const parsedQuiz: QuizQuestion[] = JSON.parse(content.quizJson || '[]')
    setQuizContent(content)
    setQuiz(parsedQuiz)
    setAnswers({})
    setQuizResult(null)
    setModalStep('learning')
  }

  function closeModal() {
    setQuizContent(null)
    setQuizResult(null)
  }

  async function handleSubmitQuiz() {
    if (!quizContent) return
    setSubmitting(true)
    try {
      const answersArray = quiz.map((_, i) => answers[i] ?? -1)
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainingContentId: quizContent.id, answers: answersArray }),
      })
      const result: QuizResult = await res.json()
      setQuizResult(result)
      setModalStep('result')
    } finally {
      setSubmitting(false)
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
          <option value="">すべてのレベル</option>
          {[1, 2, 3, 4, 5].map((g) => (
            <option key={g} value={g}>L{g}以下</option>
          ))}
        </select>

        <span className="ml-auto text-sm text-slate-400 self-center">{filtered.length}件</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {gradeLabels[content.minGrade]}
                    </span>
                    {content.isAiGenerated && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm">{content.title}</h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">{content.description}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {content.tags.split(',').filter(t => t.trim()).map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 gap-2">
                <span className="text-xs text-slate-400">⏱ {content.durationMinutes}分</span>
                <div className="flex gap-2">
                  {content.isAiGenerated && (
                    <button
                      onClick={() => openQuiz(content)}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      AIクイズに挑戦
                    </button>
                  )}
                  {done ? (
                    <span className="text-xs text-green-600 font-medium self-center">✓ 学習ログ記録済</span>
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
            </div>
          )
        })}
      </div>

      {/* Quiz Modal */}
      {quizContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{quizContent.category.icon}</span>
                  <span className="text-xs text-slate-500">{quizContent.category.name}</span>
                </div>
                <h2 className="font-bold text-slate-800">{quizContent.title}</h2>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none">×</button>
            </div>

            <div className="p-6">
              {/* Step: Learning Text */}
              {modalStep === 'learning' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">STEP 1</span>
                    <span className="text-sm font-semibold text-slate-700">まず学習テキストを読みましょう</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5 mb-6 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {quizContent.learningText}
                  </div>
                  <button
                    onClick={() => setModalStep('quiz')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    クイズに進む →
                  </button>
                </div>
              )}

              {/* Step: Quiz */}
              {modalStep === 'quiz' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">STEP 2</span>
                    <span className="text-sm font-semibold text-slate-700">確認クイズ（{quiz.length}問）</span>
                  </div>
                  <div className="space-y-6">
                    {quiz.map((q, qi) => (
                      <div key={qi} className="border border-slate-100 rounded-xl p-4">
                        <p className="text-sm font-medium text-slate-800 mb-3">
                          <span className="text-purple-600 font-bold">Q{qi + 1}.</span> {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.choices.map((choice, ci) => (
                            <button
                              key={ci}
                              onClick={() => setAnswers(prev => ({ ...prev, [qi]: ci }))}
                              className={`w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-colors ${
                                answers[qi] === ci
                                  ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][ci]}.</span>
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setModalStep('learning')}
                      className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-colors text-sm"
                    >
                      ← 学習テキストに戻る
                    </button>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(answers).length < quiz.length || submitting}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                    >
                      {submitting ? '採点中...' : `解答する（${Object.keys(answers).length}/${quiz.length}問回答済）`}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Result */}
              {modalStep === 'result' && quizResult && (
                <div>
                  <div className="text-center mb-6">
                    <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-full mb-3 ${
                      quizResult.score >= 80 ? 'bg-green-100' : quizResult.score >= 60 ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      <span className={`text-4xl font-bold ${
                        quizResult.score >= 80 ? 'text-green-700' : quizResult.score >= 60 ? 'text-blue-700' : 'text-orange-700'
                      }`}>{quizResult.score}</span>
                      <span className="text-xs text-slate-500 mt-0.5">点</span>
                    </div>
                    <p className="text-slate-700 font-semibold">
                      {quizResult.correctCount}/{quizResult.totalCount}問正解
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="text-sm text-slate-500">アセスメント結果:</span>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${gradeColors[quizResult.assessedGrade]}`}>
                        {gradeLabels[quizResult.assessedGrade]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">スキルアセスメントに自動反映されました</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {quizResult.results.map((r, i) => (
                      <div key={i} className={`rounded-xl p-4 border ${r.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`text-sm font-bold shrink-0 ${r.correct ? 'text-green-600' : 'text-red-600'}`}>
                            {r.correct ? '✓' : '✗'}
                          </span>
                          <p className="text-sm font-medium text-slate-800">{r.question}</p>
                        </div>
                        {!r.correct && (
                          <p className="text-xs text-slate-600 mb-1 ml-5">
                            あなたの答え: <span className="text-red-600 font-medium">{r.choices[r.chosen] ?? '未回答'}</span>
                            　正解: <span className="text-green-600 font-medium">{r.choices[r.answer]}</span>
                          </p>
                        )}
                        <p className="text-xs text-slate-500 ml-5 bg-white/70 rounded-lg px-3 py-2 mt-1">{r.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
