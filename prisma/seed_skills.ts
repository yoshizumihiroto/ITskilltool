
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

const skillData = [
  {
    name: '業務理解・論点構造化',
    description: '業務課題を理解し、IT論点に落とし込む前提となる論点・制約・関係者を整理する力',
    icon: '🗂️',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '業務背景・現行業務の流れ・主要ステークホルダーを理解できる' },
      { grade: 2, description: '実務遂行', criteria: 'ヒアリング結果を論点・前提・未決事項に整理できる' },
      { grade: 3, description: '自律推進', criteria: '任された領域の業務課題を構造化し、ITで扱うべき論点へ翻訳できる' },
      { grade: 4, description: 'リード', criteria: '複数部門の利害や制約を踏まえ、論点設定そのものをリードできる' },
      { grade: 5, description: '高度化・標準化', criteria: '全体方針・優先順位・論点整理の型を示し、他メンバーにも展開できる' },
    ],
    training: [
      { title: '業務ヒアリング基礎', description: 'ヒアリングの進め方と論点整理の基本を学ぶ', minGrade: 1, durationMinutes: 60, tags: '業務分析,ヒアリング' },
      { title: 'ロジカルシンキングと論点構造化', description: 'MECEを使った論点整理と課題構造化の実践手法', minGrade: 2, durationMinutes: 90, tags: '論点整理,ロジカルシンキング' },
      { title: '複数部門調整の実践', description: '複数ステークホルダーの利害調整と合意形成プロセス', minGrade: 3, durationMinutes: 120, tags: '利害調整,ステークホルダー管理' },
    ]
  },
  {
    name: '要件定義',
    description: '業務要件・システム要件・運用要件を整理し、関係者の合意形成につなげる力',
    icon: '📋',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '要件定義で扱うべき項目（業務、機能、データ、運用等）を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '決められたフォーマットで要件を整理し、抜け漏れを確認できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域の要件を具体化し、仕様差分・運用影響まで整理できる' },
      { grade: 4, description: 'リード', criteria: '複数論点が絡む要件について、選択肢比較と意思決定支援ができる' },
      { grade: 5, description: '高度化・標準化', criteria: '要件定義の進め方自体を設計し、品質を保って推進できる' },
    ],
    training: [
      { title: '要件定義の基本と進め方', description: '業務要件・機能要件・非機能要件の整理方法を学ぶ', minGrade: 1, durationMinutes: 90, tags: '要件定義,要件整理' },
      { title: '要件漏れ防止チェックリスト活用', description: '実務で使える要件確認の観点とチェック手法', minGrade: 2, durationMinutes: 60, tags: '品質管理,要件確認' },
      { title: '要件定義リードの実践', description: '複数領域の要件を統合し、意思決定を前に進める技術', minGrade: 3, durationMinutes: 120, tags: '要件統合,合意形成' },
    ]
  },
  {
    name: 'To-Be／Fit-Gap整理',
    description: '業務To-Be、パッケージ標準、現行制約の差分を整理し、現実的な実現案を作る力',
    icon: '🔍',
    grades: [
      { grade: 1, description: '基礎理解', criteria: 'To-Be、As-Is、Fit-Gapの基本概念を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '差分一覧や論点一覧を整備できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域のFit-Gapを整理し、優先度と対応方針を示せる' },
      { grade: 4, description: 'リード', criteria: '全体最適で実現案を比較し、関係者の合意形成を進められる' },
      { grade: 5, description: '高度化・標準化', criteria: '例外処理・運用・将来拡張まで見据えた方針を標準化できる' },
    ],
    training: [
      { title: 'Fit-Gap分析の基礎', description: 'パッケージ導入プロジェクトにおけるFit-Gap分析の進め方', minGrade: 1, durationMinutes: 90, tags: 'Fit-Gap,パッケージ導入' },
      { title: 'To-Be業務設計の実践', description: '業務改革の観点からTo-Beプロセスを設計する手法', minGrade: 2, durationMinutes: 120, tags: '業務設計,To-Be' },
      { title: 'Gapへの対応方針立案', description: 'Gap項目の優先度付けと現実的な対応方針の作り方', minGrade: 3, durationMinutes: 90, tags: 'Gap対応,優先度管理' },
    ]
  },
  {
    name: 'システム理解・アーキテクチャ',
    description: '対象システムの構成、役割分担、主要コンポーネントと依存関係を理解する力',
    icon: '🏗️',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '主要機能・利用者・主要システム・代表用語を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '対象領域のシステム構成とデータの流れを説明できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域の構成・制約・依存関係を踏まえて論点整理できる' },
      { grade: 4, description: 'リード', criteria: '複数システムをまたぐ設計論点を整理し、妥当性判断できる' },
      { grade: 5, description: '高度化・標準化', criteria: '全体アーキテクチャの観点から難所を解き、標準方針へ落とせる' },
    ],
    training: [
      { title: 'エンタープライズアーキテクチャ入門', description: '大規模システムの構成と主要コンポーネントの役割を学ぶ', minGrade: 1, durationMinutes: 90, tags: 'アーキテクチャ,システム設計' },
      { title: 'クラウドアーキテクチャの基礎', description: 'AWS/Azure/GCPを活用したシステム構成の設計手法', minGrade: 2, durationMinutes: 120, tags: 'クラウド,インフラ設計' },
      { title: 'マイクロサービス・API設計', description: 'サービス分割とAPI設計のベストプラクティス', minGrade: 3, durationMinutes: 120, tags: 'マイクロサービス,API' },
    ]
  },
  {
    name: 'データ・IF設計観点',
    description: 'マスタ、トランザクション、連携、権限、データ品質などの観点で設計を見られる力',
    icon: '🗄️',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '主要データや主要IFの存在を理解できる' },
      { grade: 2, description: '実務遂行', criteria: 'IF一覧・項目定義・データ流れの確認ができる' },
      { grade: 3, description: '自律推進', criteria: '担当領域のデータ/IF論点を整理し、不整合を指摘できる' },
      { grade: 4, description: 'リード', criteria: '領域横断のデータ整合・責任分界・例外処理まで見て調整できる' },
      { grade: 5, description: '高度化・標準化', criteria: 'データ/IF設計の標準観点を整備し、レビュー品質を引き上げられる' },
    ],
    training: [
      { title: 'データモデリング基礎', description: 'ER図の読み書きとマスタ/トランザクションデータの理解', minGrade: 1, durationMinutes: 90, tags: 'データモデル,ER図' },
      { title: 'システム間連携設計', description: 'IF仕様書の作成とAPI/バッチ連携設計の実践', minGrade: 2, durationMinutes: 120, tags: '連携設計,IF仕様' },
      { title: 'データ品質管理と統制', description: 'データ品質の観点と業務統制のための設計手法', minGrade: 3, durationMinutes: 90, tags: 'データ品質,統制' },
    ]
  },
  {
    name: '非機能・セキュリティ・統制',
    description: '性能、可用性、権限、監査、セキュリティ、統制などを要件/設計/運用へ反映する力',
    icon: '🔒',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '非機能要件・セキュリティの基本項目を理解できる' },
      { grade: 2, description: '実務遂行', criteria: 'レビュー観点に沿って確認漏れを防げる' },
      { grade: 3, description: '自律推進', criteria: '担当領域で必要な非機能・統制観点を整理できる' },
      { grade: 4, description: 'リード', criteria: '業務・運用・ベンダー制約を踏まえた現実的な落とし所を作れる' },
      { grade: 5, description: '高度化・標準化', criteria: '案件全体の統制・品質ゲートとして設計し、再現性を持たせられる' },
    ],
    training: [
      { title: '非機能要件定義の基礎', description: 'FURPS+を使った非機能要件の体系的な整理方法', minGrade: 1, durationMinutes: 90, tags: '非機能要件,FURPS' },
      { title: 'セキュリティ設計の実践', description: '認証・認可・監査ログの設計と実装のポイント', minGrade: 2, durationMinutes: 120, tags: 'セキュリティ,認証設計' },
      { title: '内部統制とIT統制', description: 'J-SOXとITGCを踏まえたシステム統制設計', minGrade: 3, durationMinutes: 120, tags: 'IT統制,ITGC,J-SOX' },
    ]
  },
  {
    name: '計画・推進管理',
    description: '作業計画、論点管理、依存関係整理、意思決定管理を通じて前に進める力',
    icon: '📅',
    grades: [
      { grade: 1, description: '基礎理解', criteria: 'プロジェクトの主要工程と成果物を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '自分のタスクの進捗・課題を管理できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域のWBS、論点、依存関係を管理しながら推進できる' },
      { grade: 4, description: 'リード', criteria: '複数領域の進め方を揃え、意思決定の場を設計できる' },
      { grade: 5, description: '高度化・標準化', criteria: '推進上の標準プロセスや管理フォーマットを整備できる' },
    ],
    training: [
      { title: 'プロジェクトマネジメント基礎', description: 'PMBOK準拠のプロジェクト計画と進捗管理の基本', minGrade: 1, durationMinutes: 120, tags: 'PM,PMBOK,WBS' },
      { title: 'WBS作成と依存関係管理', description: '実践的なWBS作成と依存関係・クリティカルパスの管理', minGrade: 2, durationMinutes: 90, tags: 'WBS,スケジュール管理' },
      { title: '意思決定管理とエスカレーション', description: '論点管理と適切なエスカレーションの技術', minGrade: 3, durationMinutes: 90, tags: '意思決定,論点管理' },
    ]
  },
  {
    name: '課題・リスク・変更管理',
    description: '課題、障害、変更要求を可視化し、優先度づけと収束までつなげる力',
    icon: '⚠️',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '課題・リスク・変更の違いを理解できる' },
      { grade: 2, description: '実務遂行', criteria: '発生した事象を事実ベースで報告・記録できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域で影響範囲を見積もり、対応案を整理できる' },
      { grade: 4, description: 'リード', criteria: '複数関係者を巻き込み、先回りした打ち手とエスカレーションができる' },
      { grade: 5, description: '高度化・標準化', criteria: 'プロジェクト全体の主要リスク構造を作り、未然防止に転換できる' },
    ],
    training: [
      { title: '課題管理台帳の作り方', description: '課題・リスク・変更要求の記録と優先度管理の実践', minGrade: 1, durationMinutes: 60, tags: '課題管理,リスク管理' },
      { title: 'リスク分析と対応計画', description: 'リスクの定量評価と対応計画（回避・軽減・転嫁・受容）の立案', minGrade: 2, durationMinutes: 90, tags: 'リスク分析,対応計画' },
      { title: '変更管理プロセスの設計', description: '変更要求のコントロールとスコープ管理の標準化', minGrade: 3, durationMinutes: 90, tags: '変更管理,スコープ管理' },
    ]
  },
  {
    name: 'テスト・移行・定着化',
    description: 'テスト計画、移行計画、切戻し、教育、運用引継ぎまで含めて実行性を担保する力',
    icon: '✅',
    grades: [
      { grade: 1, description: '基礎理解', criteria: 'テスト/移行の目的と主要工程を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '決められた手順で証跡を残しながら実行できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域のテスト観点・移行タスク・初動切り分けを整理できる' },
      { grade: 4, description: 'リード', criteria: '業務影響、切戻し、体制、教育を含めて計画の妥当性を判断できる' },
      { grade: 5, description: '高度化・標準化', criteria: 'Go/No-Go判断に必要な情報を統合し、定着化まで設計できる' },
    ],
    training: [
      { title: 'テスト計画と品質管理', description: 'テスト種別（単体・結合・UAT）の設計と品質基準の設定', minGrade: 1, durationMinutes: 90, tags: 'テスト計画,UAT,品質管理' },
      { title: 'データ移行計画の立案', description: 'データクレンジング・移行手順・リハーサルの進め方', minGrade: 2, durationMinutes: 120, tags: 'データ移行,移行計画' },
      { title: 'Go/No-Go判断と切戻し設計', description: '本番切替判断基準の設計と切戻しシナリオの作り方', minGrade: 3, durationMinutes: 90, tags: 'Go/No-Go,本番切替' },
    ]
  },
  {
    name: 'ファシリテーション・合意形成',
    description: '業務側、IT側、ベンダー、経営層の認識差を埋め、意思決定を前に進める力',
    icon: '🤝',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '会議の目的と論点を理解して参加できる' },
      { grade: 2, description: '実務遂行', criteria: '決めるべき論点・確認事項を整理して会議運営を支援できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域で認識差分を整理し、合意形成を進められる' },
      { grade: 4, description: 'リード', criteria: '対立する論点でも着地点を作り、意思決定をリードできる' },
      { grade: 5, description: '高度化・標準化', criteria: '難所の合意形成パターンを型化し、他メンバーにも展開できる' },
    ],
    training: [
      { title: 'ファシリテーション基礎', description: '会議設計・議題整理・発言促進の基本スキルを習得する', minGrade: 1, durationMinutes: 90, tags: 'ファシリテーション,会議運営' },
      { title: 'ステークホルダーマネジメント', description: 'ステークホルダーの分析と巻き込み戦略の立案', minGrade: 2, durationMinutes: 90, tags: 'ステークホルダー,合意形成' },
      { title: '難しい合意形成の技術', description: '対立構造の解消と意思決定をリードするための実践手法', minGrade: 3, durationMinutes: 120, tags: '交渉,意思決定リード' },
    ]
  },
  {
    name: 'ベンダー管理・協働',
    description: 'ベンダー成果物、進捗、課題、責任分界を適切に管理し、建設的に協働する力',
    icon: '🏢',
    grades: [
      { grade: 1, description: '基礎理解', criteria: 'ベンダーとの基本的な役割分担を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '定例・QA・レビューに必要な情報を整理できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域で責任分界と依存関係を明確にしながら協働できる' },
      { grade: 4, description: 'リード', criteria: 'ベンダー責任者と対等に議論し、品質・納期・現実性のバランスを取れる' },
      { grade: 5, description: '高度化・標準化', criteria: '複数ベンダー・複数チームの協働ルールや品質基準を設計できる' },
    ],
    training: [
      { title: 'ベンダーコントロール基礎', description: 'ベンダーとの役割分担と成果物レビューの基本を学ぶ', minGrade: 1, durationMinutes: 60, tags: 'ベンダー管理,役割分担' },
      { title: '責任分界点の設計', description: 'SLA・責任境界・エスカレーションルートの明確化', minGrade: 2, durationMinutes: 90, tags: '責任分界,SLA' },
      { title: 'マルチベンダー管理の実践', description: '複数ベンダー体制での協働設計と品質統制', minGrade: 3, durationMinutes: 120, tags: 'マルチベンダー,協働設計' },
    ]
  },
  {
    name: '成果物品質管理',
    description: '要件、設計、テスト、移行等の成果物をレビューし、品質を安定させる力',
    icon: '📝',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '成果物の基本レビュー観点を理解できる' },
      { grade: 2, description: '実務遂行', criteria: '誤字脱字や形式面だけでなく、論点漏れを確認できる' },
      { grade: 3, description: '自律推進', criteria: '担当領域の成果物品質を安定して担保できる' },
      { grade: 4, description: 'リード', criteria: 'メンバー/ベンダー成果物まで含めてレビュー観点を浸透できる' },
      { grade: 5, description: '高度化・標準化', criteria: '品質ゲートやレビュー標準を設計し、再現性ある品質管理にできる' },
    ],
    training: [
      { title: 'ドキュメントレビューの基本', description: '成果物レビューのチェックリストと観点の整理', minGrade: 1, durationMinutes: 60, tags: 'レビュー,品質管理' },
      { title: '成果物品質基準の設定', description: '工程ごとの品質基準とゲートレビューの設計', minGrade: 2, durationMinutes: 90, tags: '品質基準,ゲートレビュー' },
      { title: '品質管理体制の設計', description: 'プロジェクト全体の品質保証プロセスと体制の構築', minGrade: 3, durationMinutes: 120, tags: '品質保証,QA体制' },
    ]
  },
  {
    name: '業務定着・運用移管',
    description: '新業務・新システムが現場で回る状態まで見届ける力',
    icon: '🔄',
    grades: [
      { grade: 1, description: '基礎理解', criteria: '運用移管や教育が必要なことを理解できる' },
      { grade: 2, description: '実務遂行', criteria: 'FAQ、手順書、教育資料などの整備を支援できる' },
      { grade: 3, description: '自律推進', criteria: '運用設計・教育・現場定着の論点を整理し、改善につなげられる' },
      { grade: 4, description: 'リード', criteria: '定着阻害要因を見抜き、業務/IT/現場をまたいで対策を打てる' },
      { grade: 5, description: '高度化・標準化', criteria: '定着化の進め方を標準化し、横展開できる' },
    ],
    training: [
      { title: '運用設計の基礎', description: '業務フロー・操作手順書・問合せ対応フローの整備方法', minGrade: 1, durationMinutes: 60, tags: '運用設計,手順書' },
      { title: 'ユーザー教育・研修設計', description: '利用者向けトレーニング計画と教育コンテンツの作成', minGrade: 2, durationMinutes: 90, tags: 'ユーザー教育,トレーニング' },
      { title: '定着化推進と改善サイクル', description: '本番後のモニタリングと継続的改善のプロセス設計', minGrade: 3, durationMinutes: 120, tags: '定着化,改善サイクル' },
    ]
  },
]

async function main() {
  console.log('既存のスキルデータを削除中...')
  await prisma.learningPlanItem.deleteMany()
  await prisma.studyLog.deleteMany()
  await prisma.learningPlan.deleteMany()
  await prisma.assessmentResult.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.trainingContent.deleteMany()
  await prisma.skillGrade.deleteMany()
  await prisma.skillCategory.deleteMany()

  console.log('スキルカテゴリ・グレード・研修コンテンツを投入中...')

  for (const skill of skillData) {
    const category = await prisma.skillCategory.create({
      data: {
        name: skill.name,
        description: skill.description,
        icon: skill.icon,
      }
    })

    for (const grade of skill.grades) {
      await prisma.skillGrade.create({
        data: {
          categoryId: category.id,
          grade: grade.grade,
          description: grade.description,
          criteria: grade.criteria,
        }
      })
    }

    for (const t of skill.training) {
      await prisma.trainingContent.create({
        data: {
          categoryId: category.id,
          title: t.title,
          description: t.description,
          minGrade: t.minGrade,
          durationMinutes: t.durationMinutes,
          tags: t.tags,
          contentUrl: '',
        }
      })
    }

    console.log('  ✓', skill.name)
  }

  console.log('完了！')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
