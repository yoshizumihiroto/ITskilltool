import { PrismaClient, Role, PlanStatus, PlanItemStatus, ImprovementStatus } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const team = await prisma.team.create({ data: { name: '開発チームA' } })

  const hash = (pw: string) => bcrypt.hashSync(pw, 10)

  await prisma.user.create({
    data: { name: '高橋 部長', email: 'tm@example.com', passwordHash: hash('pass123'), role: Role.TM, teamId: team.id },
  })

  const mentor = await prisma.user.create({
    data: { name: '鈴木 一郎', email: 'mentor@example.com', passwordHash: hash('pass123'), role: Role.MENTOR, teamId: team.id },
  })

  const member1 = await prisma.user.create({
    data: { name: '田中 太郎', email: 'member1@example.com', passwordHash: hash('pass123'), role: Role.MEMBER, teamId: team.id, mentorId: mentor.id },
  })

  const member2 = await prisma.user.create({
    data: { name: '佐藤 花子', email: 'member2@example.com', passwordHash: hash('pass123'), role: Role.MEMBER, teamId: team.id, mentorId: mentor.id },
  })

  await prisma.user.create({
    data: { name: '管理者', email: 'admin@example.com', passwordHash: hash('admin123'), role: Role.ADMIN, teamId: team.id },
  })

  const categories = await Promise.all([
    prisma.skillCategory.create({ data: { name: 'インフラ', description: 'サーバー・クラウド・OS等のインフラ技術', icon: '🖥️' } }),
    prisma.skillCategory.create({ data: { name: 'プログラミング', description: 'コーディング・設計・アーキテクチャ', icon: '💻' } }),
    prisma.skillCategory.create({ data: { name: 'セキュリティ', description: '情報セキュリティ・脆弱性管理', icon: '🔒' } }),
    prisma.skillCategory.create({ data: { name: 'データベース', description: 'DB設計・SQL・パフォーマンスチューニング', icon: '🗄️' } }),
    prisma.skillCategory.create({ data: { name: 'ネットワーク', description: 'TCP/IP・ルーティング・DNS等', icon: '🌐' } }),
  ])

  for (const cat of categories) {
    await prisma.skillGrade.createMany({
      data: [
        { categoryId: cat.id, grade: 1, description: '入門', criteria: '基本概念を知っている' },
        { categoryId: cat.id, grade: 2, description: '基礎', criteria: '基本的な操作ができる' },
        { categoryId: cat.id, grade: 3, description: '応用', criteria: '実務で独力対応できる' },
        { categoryId: cat.id, grade: 4, description: '上級', criteria: 'チームをリードできる' },
        { categoryId: cat.id, grade: 5, description: 'エキスパート', criteria: '社内外で教育・指導できる' },
      ],
    })
  }

  const [infra, prog, sec, db, net] = categories

  const contents = await Promise.all([
    prisma.trainingContent.create({ data: { title: 'Linux基礎コマンド入門', categoryId: infra.id, minGrade: 1, durationMinutes: 90, description: 'ls, cd, cp等の基本コマンドを学ぶ', tags: 'Linux,CLI,入門' } }),
    prisma.trainingContent.create({ data: { title: 'AWSクラウド実践入門', categoryId: infra.id, minGrade: 2, durationMinutes: 120, description: 'EC2, S3, RDSの基本操作を習得する', tags: 'AWS,クラウド,EC2' } }),
    prisma.trainingContent.create({ data: { title: 'Dockerコンテナ技術', categoryId: infra.id, minGrade: 3, durationMinutes: 180, description: 'Dockerfileの作成からcompose構成まで', tags: 'Docker,コンテナ,DevOps' } }),
    prisma.trainingContent.create({ data: { title: 'Python基礎プログラミング', categoryId: prog.id, minGrade: 1, durationMinutes: 120, description: '変数・関数・クラスの基礎を学ぶ', tags: 'Python,入門,基礎' } }),
    prisma.trainingContent.create({ data: { title: 'Webアプリケーション開発', categoryId: prog.id, minGrade: 2, durationMinutes: 240, description: 'REST API設計とフロントエンド連携', tags: 'Web,API,React' } }),
    prisma.trainingContent.create({ data: { title: 'クリーンアーキテクチャ実践', categoryId: prog.id, minGrade: 4, durationMinutes: 180, description: '保守性の高いコード設計手法', tags: '設計,アーキテクチャ,上級' } }),
    prisma.trainingContent.create({ data: { title: '情報セキュリティ基礎', categoryId: sec.id, minGrade: 1, durationMinutes: 60, description: 'OWASP Top10と基本的な脅威の概要', tags: 'セキュリティ,OWASP,入門' } }),
    prisma.trainingContent.create({ data: { title: '脆弱性診断入門', categoryId: sec.id, minGrade: 2, durationMinutes: 120, description: 'Webアプリの脆弱性テスト手法', tags: '脆弱性,診断,セキュリティ' } }),
    prisma.trainingContent.create({ data: { title: 'ゼロトラストセキュリティ', categoryId: sec.id, minGrade: 4, durationMinutes: 90, description: 'ゼロトラストモデルの設計と実装', tags: 'ゼロトラスト,上級,設計' } }),
    prisma.trainingContent.create({ data: { title: 'SQL基礎とデータ操作', categoryId: db.id, minGrade: 1, durationMinutes: 90, description: 'SELECT, INSERT, UPDATE, DELETEの基礎', tags: 'SQL,入門,基礎' } }),
    prisma.trainingContent.create({ data: { title: 'DBパフォーマンスチューニング', categoryId: db.id, minGrade: 3, durationMinutes: 120, description: 'インデックス設計とクエリ最適化', tags: 'DB,チューニング,性能' } }),
    prisma.trainingContent.create({ data: { title: 'TCP/IPネットワーク基礎', categoryId: net.id, minGrade: 1, durationMinutes: 90, description: 'IPアドレス・サブネット・ルーティング基礎', tags: 'ネットワーク,TCP/IP,入門' } }),
    prisma.trainingContent.create({ data: { title: 'DNS・HTTP・HTTPS詳解', categoryId: net.id, minGrade: 2, durationMinutes: 120, description: 'Webの通信プロトコルを深掘りする', tags: 'DNS,HTTP,HTTPS' } }),
  ])

  for (const d of [
    { categoryId: infra.id, score: 70, grade: 3 },
    { categoryId: prog.id, score: 80, grade: 4 },
    { categoryId: sec.id, score: 40, grade: 2 },
    { categoryId: db.id, score: 60, grade: 3 },
    { categoryId: net.id, score: 50, grade: 2 },
  ]) {
    await prisma.assessmentResult.create({ data: { userId: member1.id, ...d } })
  }

  for (const d of [
    { categoryId: infra.id, score: 30, grade: 1 },
    { categoryId: prog.id, score: 60, grade: 3 },
    { categoryId: sec.id, score: 55, grade: 2 },
    { categoryId: db.id, score: 75, grade: 3 },
    { categoryId: net.id, score: 40, grade: 2 },
  ]) {
    await prisma.assessmentResult.create({ data: { userId: member2.id, ...d } })
  }

  await prisma.studyLog.createMany({
    data: [
      { userId: member1.id, trainingContentId: contents[0].id, durationMinutes: 90, memo: 'Linux基礎を一通り学習した', loggedAt: new Date('2026-05-10') },
      { userId: member1.id, trainingContentId: contents[3].id, durationMinutes: 120, memo: 'Python関数とクラスを練習', loggedAt: new Date('2026-05-12') },
      { userId: member1.id, trainingContentId: contents[6].id, durationMinutes: 60, memo: 'OWASPを読んだ', loggedAt: new Date('2026-05-15') },
      { userId: member1.id, trainingContentId: contents[1].id, durationMinutes: 120, memo: 'AWS EC2を起動して動作確認', loggedAt: new Date('2026-05-18') },
      { userId: member1.id, durationMinutes: 30, memo: '書籍: 達人プログラマー 第3章', loggedAt: new Date('2026-05-20') },
    ],
  })

  await prisma.studyLog.createMany({
    data: [
      { userId: member2.id, trainingContentId: contents[9].id, durationMinutes: 90, memo: 'SQL基礎を復習', loggedAt: new Date('2026-05-11') },
      { userId: member2.id, trainingContentId: contents[3].id, durationMinutes: 120, memo: 'Pythonを初めて学習', loggedAt: new Date('2026-05-14') },
      { userId: member2.id, trainingContentId: contents[11].id, durationMinutes: 90, memo: 'ネットワーク基礎を学んだ', loggedAt: new Date('2026-05-19') },
    ],
  })

  const plan1 = await prisma.learningPlan.create({
    data: {
      userId: member1.id, createdById: mentor.id,
      shortTermGoal: '3ヶ月以内にセキュリティグレード3を達成する',
      midTermGoal: '半年以内にAWS認定資格を取得し、インフラグレード4を目指す',
      status: PlanStatus.ACTIVE,
    },
  })

  await prisma.learningPlanItem.createMany({
    data: [
      { planId: plan1.id, trainingContentId: contents[6].id, order: 1, status: PlanItemStatus.DONE },
      { planId: plan1.id, trainingContentId: contents[7].id, order: 2, status: PlanItemStatus.IN_PROGRESS },
      { planId: plan1.id, trainingContentId: contents[1].id, order: 3, status: PlanItemStatus.DONE },
      { planId: plan1.id, trainingContentId: contents[2].id, order: 4, status: PlanItemStatus.PENDING },
    ],
  })

  const plan2 = await prisma.learningPlan.create({
    data: {
      userId: member2.id, createdById: mentor.id,
      shortTermGoal: '3ヶ月でインフラ基礎を習得してグレード2を達成する',
      midTermGoal: '1年以内にフルスタックエンジニアとして独立対応できるレベルを目指す',
      status: PlanStatus.ACTIVE,
    },
  })

  await prisma.learningPlanItem.createMany({
    data: [
      { planId: plan2.id, trainingContentId: contents[0].id, order: 1, status: PlanItemStatus.PENDING },
      { planId: plan2.id, trainingContentId: contents[4].id, order: 2, status: PlanItemStatus.IN_PROGRESS },
      { planId: plan2.id, trainingContentId: contents[10].id, order: 3, status: PlanItemStatus.PENDING },
    ],
  })

  await prisma.feedback.createMany({
    data: [
      { mentorId: mentor.id, memberId: member1.id, categoryId: sec.id, content: 'セキュリティの理解が進んでいます。次はXSSとSQLインジェクションの実践演習に取り組んでみましょう。' },
      { mentorId: mentor.id, memberId: member1.id, categoryId: infra.id, content: 'AWS環境の構築お疲れ様でした。次のステップとしてTerraformによるIaCを学ぶと良いと思います。' },
      { mentorId: mentor.id, memberId: member2.id, categoryId: infra.id, content: 'インフラ基礎から着実に取り組んでいますね。Linux操作に慣れてきたらDockerに挑戦してみましょう。' },
    ],
  })

  await prisma.improvementCycle.createMany({
    data: [
      {
        mentorId: mentor.id, memberId: member1.id,
        issue: 'セキュリティ知識が実務レベルに達していない',
        action: 'OWASPの学習とCTF（Capture The Flag）への参加を推奨',
        result: 'OWASPの基礎は習得。次は脆弱性診断の実践に進む',
        status: ImprovementStatus.IN_PROGRESS,
      },
      {
        mentorId: mentor.id, memberId: member2.id,
        issue: 'インフラ経験が少なく、案件対応で不安を感じている',
        action: 'Linux基礎コマンド研修とAWS環境での実践演習を実施',
        result: '',
        status: ImprovementStatus.OPEN,
      },
    ],
  })

  console.log('シードデータの投入が完了しました')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
