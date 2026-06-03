import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface QuizQuestion {
  question: string
  choices: string[]
  answer: number
  explanation: string
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { trainingContentId, answers } = await request.json() as {
    trainingContentId: number
    answers: number[]
  }

  const content = await prisma.trainingContent.findUnique({
    where: { id: trainingContentId },
    include: { category: true },
  })
  if (!content || !content.isAiGenerated) {
    return Response.json({ error: 'Not found or quiz not generated' }, { status: 404 })
  }

  const quiz: QuizQuestion[] = JSON.parse(content.quizJson)
  if (!Array.isArray(quiz) || quiz.length === 0) {
    return Response.json({ error: 'No quiz available' }, { status: 400 })
  }

  const totalCount = quiz.length
  let correctCount = 0
  const results = quiz.map((q, i) => {
    const chosen = answers[i] ?? -1
    const correct = chosen === q.answer
    if (correct) correctCount++
    return {
      question: q.question,
      choices: q.choices,
      chosen,
      answer: q.answer,
      correct,
      explanation: q.explanation,
    }
  })

  const score = Math.round((correctCount / totalCount) * 100)
  const assessedGrade = Math.max(1, Math.min(5, Math.ceil(score / 20)))

  await prisma.quizResult.create({
    data: {
      userId: session.id,
      trainingContentId,
      score,
      correctCount,
      totalCount,
      assessedGrade,
      answers: JSON.stringify(answers),
    },
  })

  await prisma.assessmentResult.create({
    data: {
      userId: session.id,
      categoryId: content.categoryId,
      score,
      grade: assessedGrade,
    },
  })

  return Response.json({ score, correctCount, totalCount, assessedGrade, results })
}
