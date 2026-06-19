import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const levelDescriptions: Record<number, string> = {
  1: 'L1 基礎理解（知識として理解できる）',
  2: 'L2 実務遂行（指導のもとで実行できる）',
  3: 'L3 自律推進（自分で判断・実行できる）',
  4: 'L4 リード（チームをリードできる）',
  5: 'L5 高度化・標準化（組織の基準を作れる）',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'TM' && session.role !== 'MENTOR' && session.role !== 'ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { trainingContentId } = await request.json()
  if (!trainingContentId) return Response.json({ error: 'trainingContentId required' }, { status: 400 })

  const content = await prisma.trainingContent.findUnique({
    where: { id: trainingContentId },
    include: { skillElement: { include: { category: true } } },
  })
  if (!content) return Response.json({ error: 'Not found' }, { status: 404 })

  const prompt = `あなたはDXコンサルタント向けITスキル研修コンテンツを作成するAIです。
以下の研修コンテンツについて、学習テキストと確認クイズをJSON形式で生成してください。

【コンテンツ情報】
タイトル: ${content.title}
大分類: ${content.skillElement.category.name}
スキル要素: ${content.skillElement.name}
説明: ${content.description}
対象レベル: ${levelDescriptions[content.minLevel]}
タグ: ${content.tags}

【出力形式】
以下のJSONのみを出力してください（説明文やMarkdownは不要）：
{
  "learningText": "学習テキスト（300〜500文字。具体的な概念・実務での活用方法・ポイントを含むこと）",
  "quiz": [
    {
      "question": "問題文",
      "choices": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answer": 0,
      "explanation": "解説文（なぜこれが正解か）"
    }
  ]
}

【クイズの条件】
- 5問作成すること
- 各問4択
- 難易度は${levelDescriptions[content.minLevel]}相当
- 実務で役立つ実践的な問題にすること
- answerは正解の選択肢のインデックス（0〜3）`

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'AI生成に失敗しました' }, { status: 500 })

    const generated = JSON.parse(jsonMatch[0]) as { learningText: string; quiz: unknown[] }

    const updated = await prisma.trainingContent.update({
      where: { id: trainingContentId },
      data: {
        learningText: generated.learningText,
        quizJson: JSON.stringify(generated.quiz),
        isAiGenerated: true,
      },
    })

    return Response.json({ success: true, trainingContent: updated })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'AI生成エラー' }, { status: 500 })
  }
}
