import { PrismaClient, Role, PlanStatus, PlanItemStatus, ImprovementStatus } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

// -----------------------------------------------------------------------
// スキル体系：5大分類 / 13小分類 / L0-L5記述子
// -----------------------------------------------------------------------
const taxonomy = [
  {
    name: '業務×IT接続',
    description: 'ITプロジェクトを業務目線で捉え、論点・要件・Gap整理を担う領域',
    icon: '🔗',
    order: 1,
    elements: [
      {
        name: '業務理解・論点構造化',
        icon: '🗂️',
        definition: '業務課題を理解し、IT論点に落とし込む前提となる論点・制約・関係者を整理する力',
        evalNote: 'ヒアリング・業務フロー整理・論点リストの品質で評価する',
        order: 1,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '業務背景・現行業務の流れ・主要ステークホルダーを理解できる' },
          { level: 2, name: '実務遂行', descriptor: 'ヒアリング結果を論点・前提・未決事項に整理できる' },
          { level: 3, name: '自律推進', descriptor: '任された領域の業務課題を構造化し、ITで扱うべき論点へ翻訳できる' },
          { level: 4, name: 'リード', descriptor: '複数部門の利害や制約を踏まえ、論点設定そのものをリードできる' },
          { level: 5, name: '高度化・標準化', descriptor: '全体方針・優先順位・論点整理の型を示し、他メンバーにも展開できる' },
        ],
        training: [
          { title: '業務ヒアリング基礎', description: 'ヒアリングの進め方と論点整理の基本を学ぶ', minLevel: 1, durationMinutes: 60, tags: '業務分析,ヒアリング' },
          { title: 'ロジカルシンキングと論点構造化', description: 'MECEを使った論点整理と課題構造化の実践手法', minLevel: 2, durationMinutes: 90, tags: '論点整理,ロジカルシンキング' },
          { title: '複数部門調整の実践', description: '複数ステークホルダーの利害調整と合意形成プロセス', minLevel: 3, durationMinutes: 120, tags: '利害調整,ステークホルダー管理' },
        ],
      },
      {
        name: '要件定義',
        icon: '📋',
        definition: '業務要件・システム要件・運用要件を整理し、関係者の合意形成につなげる力',
        evalNote: '要件定義書・議事録・レビュー観点の網羅性で評価する',
        order: 2,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '要件定義で扱うべき項目（業務、機能、データ、運用等）を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '決められたフォーマットで要件を整理し、抜け漏れを確認できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域の要件を具体化し、仕様差分・運用影響まで整理できる' },
          { level: 4, name: 'リード', descriptor: '複数論点が絡む要件について、選択肢比較と意思決定支援ができる' },
          { level: 5, name: '高度化・標準化', descriptor: '要件定義の進め方自体を設計し、品質を保って推進できる' },
        ],
        training: [
          { title: '要件定義の基本と進め方', description: '業務要件・機能要件・非機能要件の整理方法を学ぶ', minLevel: 1, durationMinutes: 90, tags: '要件定義,要件整理' },
          { title: '要件漏れ防止チェックリスト活用', description: '実務で使える要件確認の観点とチェック手法', minLevel: 2, durationMinutes: 60, tags: '品質管理,要件確認' },
          { title: '要件定義リードの実践', description: '複数領域の要件を統合し、意思決定を前に進める技術', minLevel: 3, durationMinutes: 120, tags: '要件統合,合意形成' },
        ],
      },
      {
        name: 'To-Be／Fit-Gap整理',
        icon: '🔍',
        definition: '業務To-Be、パッケージ標準、現行制約の差分を整理し、現実的な実現案を作る力',
        evalNote: 'Fit-Gap一覧・対応方針の具体性・関係者への説明品質で評価する',
        order: 3,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: 'To-Be、As-Is、Fit-Gapの基本概念を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '差分一覧や論点一覧を整備できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域のFit-Gapを整理し、優先度と対応方針を示せる' },
          { level: 4, name: 'リード', descriptor: '全体最適で実現案を比較し、関係者の合意形成を進められる' },
          { level: 5, name: '高度化・標準化', descriptor: '例外処理・運用・将来拡張まで見据えた方針を標準化できる' },
        ],
        training: [
          { title: 'Fit-Gap分析の基礎', description: 'パッケージ導入プロジェクトにおけるFit-Gap分析の進め方', minLevel: 1, durationMinutes: 90, tags: 'Fit-Gap,パッケージ導入' },
          { title: 'To-Be業務設計の実践', description: '業務改革の観点からTo-Beプロセスを設計する手法', minLevel: 2, durationMinutes: 120, tags: '業務設計,To-Be' },
          { title: 'Gapへの対応方針立案', description: 'Gap項目の優先度付けと現実的な対応方針の作り方', minLevel: 3, durationMinutes: 90, tags: 'Gap対応,優先度管理' },
        ],
      },
    ],
  },
  {
    name: '技術リテラシー',
    description: 'システム構成・データ・非機能・セキュリティを設計・レビュー観点で扱う領域',
    icon: '💡',
    order: 2,
    elements: [
      {
        name: 'システム理解・アーキテクチャ',
        icon: '🏗️',
        definition: '対象システムの構成、役割分担、主要コンポーネントと依存関係を理解する力',
        evalNote: 'システム構成図の読解・説明・設計観点の指摘精度で評価する',
        order: 1,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '主要機能・利用者・主要システム・代表用語を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '対象領域のシステム構成とデータの流れを説明できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域の構成・制約・依存関係を踏まえて論点整理できる' },
          { level: 4, name: 'リード', descriptor: '複数システムをまたぐ設計論点を整理し、妥当性判断できる' },
          { level: 5, name: '高度化・標準化', descriptor: '全体アーキテクチャの観点から難所を解き、標準方針へ落とせる' },
        ],
        training: [
          { title: 'エンタープライズアーキテクチャ入門', description: '大規模システムの構成と主要コンポーネントの役割を学ぶ', minLevel: 1, durationMinutes: 90, tags: 'アーキテクチャ,システム設計' },
          { title: 'クラウドアーキテクチャの基礎', description: 'AWS/Azure/GCPを活用したシステム構成の設計手法', minLevel: 2, durationMinutes: 120, tags: 'クラウド,インフラ設計' },
          { title: 'マイクロサービス・API設計', description: 'サービス分割とAPI設計のベストプラクティス', minLevel: 3, durationMinutes: 120, tags: 'マイクロサービス,API' },
        ],
      },
      {
        name: 'データ・IF設計観点',
        icon: '🗄️',
        definition: 'マスタ、トランザクション、連携、権限、データ品質などの観点で設計を見られる力',
        evalNote: 'データモデル・IF仕様のレビュー観点の網羅性と的確さで評価する',
        order: 2,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '主要データや主要IFの存在を理解できる' },
          { level: 2, name: '実務遂行', descriptor: 'IF一覧・項目定義・データ流れの確認ができる' },
          { level: 3, name: '自律推進', descriptor: '担当領域のデータ/IF論点を整理し、不整合を指摘できる' },
          { level: 4, name: 'リード', descriptor: '領域横断のデータ整合・責任分界・例外処理まで見て調整できる' },
          { level: 5, name: '高度化・標準化', descriptor: 'データ/IF設計の標準観点を整備し、レビュー品質を引き上げられる' },
        ],
        training: [
          { title: 'データモデリング基礎', description: 'ER図の読み書きとマスタ/トランザクションデータの理解', minLevel: 1, durationMinutes: 90, tags: 'データモデル,ER図' },
          { title: 'システム間連携設計', description: 'IF仕様書の作成とAPI/バッチ連携設計の実践', minLevel: 2, durationMinutes: 120, tags: '連携設計,IF仕様' },
          { title: 'データ品質管理と統制', description: 'データ品質の観点と業務統制のための設計手法', minLevel: 3, durationMinutes: 90, tags: 'データ品質,統制' },
        ],
      },
      {
        name: '非機能・セキュリティ・統制',
        icon: '🔒',
        definition: '性能、可用性、権限、監査、セキュリティ、統制などを要件/設計/運用へ反映する力',
        evalNote: '非機能要件の網羅性・セキュリティ観点の指摘精度・統制設計の実用性で評価する',
        order: 3,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '非機能要件・セキュリティの基本項目を理解できる' },
          { level: 2, name: '実務遂行', descriptor: 'レビュー観点に沿って確認漏れを防げる' },
          { level: 3, name: '自律推進', descriptor: '担当領域で必要な非機能・統制観点を整理できる' },
          { level: 4, name: 'リード', descriptor: '業務・運用・ベンダー制約を踏まえた現実的な落とし所を作れる' },
          { level: 5, name: '高度化・標準化', descriptor: '案件全体の統制・品質ゲートとして設計し、再現性を持たせられる' },
        ],
        training: [
          { title: '非機能要件定義の基礎', description: 'FURPS+を使った非機能要件の体系的な整理方法', minLevel: 1, durationMinutes: 90, tags: '非機能要件,FURPS' },
          { title: 'セキュリティ設計の実践', description: '認証・認可・監査ログの設計と実装のポイント', minLevel: 2, durationMinutes: 120, tags: 'セキュリティ,認証設計' },
          { title: '内部統制とIT統制', description: 'J-SOXとITGCを踏まえたシステム統制設計', minLevel: 3, durationMinutes: 120, tags: 'IT統制,ITGC,J-SOX' },
        ],
      },
    ],
  },
  {
    name: '案件推進',
    description: '計画・課題・テスト・移行を含む案件全体を前に進める管理・実行力の領域',
    icon: '📊',
    order: 3,
    elements: [
      {
        name: '計画・推進管理',
        icon: '📅',
        definition: '作業計画、論点管理、依存関係整理、意思決定管理を通じて前に進める力',
        evalNote: 'WBS・議事録・論点管理の精度と案件進捗への貢献度で評価する',
        order: 1,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: 'プロジェクトの主要工程と成果物を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '自分のタスクの進捗・課題を管理できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域のWBS、論点、依存関係を管理しながら推進できる' },
          { level: 4, name: 'リード', descriptor: '複数領域の進め方を揃え、意思決定の場を設計できる' },
          { level: 5, name: '高度化・標準化', descriptor: '推進上の標準プロセスや管理フォーマットを整備できる' },
        ],
        training: [
          { title: 'プロジェクトマネジメント基礎', description: 'PMBOK準拠のプロジェクト計画と進捗管理の基本', minLevel: 1, durationMinutes: 120, tags: 'PM,PMBOK,WBS' },
          { title: 'WBS作成と依存関係管理', description: '実践的なWBS作成と依存関係・クリティカルパスの管理', minLevel: 2, durationMinutes: 90, tags: 'WBS,スケジュール管理' },
          { title: '意思決定管理とエスカレーション', description: '論点管理と適切なエスカレーションの技術', minLevel: 3, durationMinutes: 90, tags: '意思決定,論点管理' },
        ],
      },
      {
        name: '課題・リスク・変更管理',
        icon: '⚠️',
        definition: '課題、障害、変更要求を可視化し、優先度づけと収束までつなげる力',
        evalNote: '課題台帳の品質・影響範囲の見積もり精度・収束までのリードタイムで評価する',
        order: 2,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '課題・リスク・変更の違いを理解できる' },
          { level: 2, name: '実務遂行', descriptor: '発生した事象を事実ベースで報告・記録できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域で影響範囲を見積もり、対応案を整理できる' },
          { level: 4, name: 'リード', descriptor: '複数関係者を巻き込み、先回りした打ち手とエスカレーションができる' },
          { level: 5, name: '高度化・標準化', descriptor: 'プロジェクト全体の主要リスク構造を作り、未然防止に転換できる' },
        ],
        training: [
          { title: '課題管理台帳の作り方', description: '課題・リスク・変更要求の記録と優先度管理の実践', minLevel: 1, durationMinutes: 60, tags: '課題管理,リスク管理' },
          { title: 'リスク分析と対応計画', description: 'リスクの定量評価と対応計画（回避・軽減・転嫁・受容）の立案', minLevel: 2, durationMinutes: 90, tags: 'リスク分析,対応計画' },
          { title: '変更管理プロセスの設計', description: '変更要求のコントロールとスコープ管理の標準化', minLevel: 3, durationMinutes: 90, tags: '変更管理,スコープ管理' },
        ],
      },
      {
        name: 'テスト・移行・定着化',
        icon: '✅',
        definition: 'テスト計画、移行計画、切戻し、教育、運用引継ぎまで含めて実行性を担保する力',
        evalNote: 'テスト計画の網羅性・移行計画の実行精度・本番後の定着状況で評価する',
        order: 3,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: 'テスト/移行の目的と主要工程を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '決められた手順で証跡を残しながら実行できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域のテスト観点・移行タスク・初動切り分けを整理できる' },
          { level: 4, name: 'リード', descriptor: '業務影響、切戻し、体制、教育を含めて計画の妥当性を判断できる' },
          { level: 5, name: '高度化・標準化', descriptor: 'Go/No-Go判断に必要な情報を統合し、定着化まで設計できる' },
        ],
        training: [
          { title: 'テスト計画と品質管理', description: 'テスト種別（単体・結合・UAT）の設計と品質基準の設定', minLevel: 1, durationMinutes: 90, tags: 'テスト計画,UAT,品質管理' },
          { title: 'データ移行計画の立案', description: 'データクレンジング・移行手順・リハーサルの進め方', minLevel: 2, durationMinutes: 120, tags: 'データ移行,移行計画' },
          { title: 'Go/No-Go判断と切戻し設計', description: '本番切替判断基準の設計と切戻しシナリオの作り方', minLevel: 3, durationMinutes: 90, tags: 'Go/No-Go,本番切替' },
        ],
      },
    ],
  },
  {
    name: '関係者マネジメント',
    description: '業務・IT・ベンダーの関係者を巻き込み、合意形成と協働を実現する領域',
    icon: '👥',
    order: 4,
    elements: [
      {
        name: 'ファシリテーション・合意形成',
        icon: '🤝',
        definition: '業務側、IT側、ベンダー、経営層の認識差を埋め、意思決定を前に進める力',
        evalNote: '会議設計・議論の着地・合意内容の明確化度合いで評価する',
        order: 1,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '会議の目的と論点を理解して参加できる' },
          { level: 2, name: '実務遂行', descriptor: '決めるべき論点・確認事項を整理して会議運営を支援できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域で認識差分を整理し、合意形成を進められる' },
          { level: 4, name: 'リード', descriptor: '対立する論点でも着地点を作り、意思決定をリードできる' },
          { level: 5, name: '高度化・標準化', descriptor: '難所の合意形成パターンを型化し、他メンバーにも展開できる' },
        ],
        training: [
          { title: 'ファシリテーション基礎', description: '会議設計・議題整理・発言促進の基本スキルを習得する', minLevel: 1, durationMinutes: 90, tags: 'ファシリテーション,会議運営' },
          { title: 'ステークホルダーマネジメント', description: 'ステークホルダーの分析と巻き込み戦略の立案', minLevel: 2, durationMinutes: 90, tags: 'ステークホルダー,合意形成' },
          { title: '難しい合意形成の技術', description: '対立構造の解消と意思決定をリードするための実践手法', minLevel: 3, durationMinutes: 120, tags: '交渉,意思決定リード' },
        ],
      },
      {
        name: 'ベンダー管理・協働',
        icon: '🏢',
        definition: 'ベンダー成果物、進捗、課題、責任分界を適切に管理し、建設的に協働する力',
        evalNote: '責任分界の明確性・ベンダーとのコミュニケーション品質・成果物レビュー精度で評価する',
        order: 2,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: 'ベンダーとの基本的な役割分担を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '定例・QA・レビューに必要な情報を整理できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域で責任分界と依存関係を明確にしながら協働できる' },
          { level: 4, name: 'リード', descriptor: 'ベンダー責任者と対等に議論し、品質・納期・現実性のバランスを取れる' },
          { level: 5, name: '高度化・標準化', descriptor: '複数ベンダー・複数チームの協働ルールや品質基準を設計できる' },
        ],
        training: [
          { title: 'ベンダーコントロール基礎', description: 'ベンダーとの役割分担と成果物レビューの基本を学ぶ', minLevel: 1, durationMinutes: 60, tags: 'ベンダー管理,役割分担' },
          { title: '責任分界点の設計', description: 'SLA・責任境界・エスカレーションルートの明確化', minLevel: 2, durationMinutes: 90, tags: '責任分界,SLA' },
          { title: 'マルチベンダー管理の実践', description: '複数ベンダー体制での協働設計と品質統制', minLevel: 3, durationMinutes: 120, tags: 'マルチベンダー,協働設計' },
        ],
      },
    ],
  },
  {
    name: '品質・定着',
    description: '成果物品質の管理・担保と、業務・システムの定着化を実現する領域',
    icon: '🎯',
    order: 5,
    elements: [
      {
        name: '成果物品質管理',
        icon: '📝',
        definition: '要件、設計、テスト、移行等の成果物をレビューし、品質を安定させる力',
        evalNote: 'レビュー指摘の的確さ・成果物品質の安定度・レビュー観点の展開力で評価する',
        order: 1,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '成果物の基本レビュー観点を理解できる' },
          { level: 2, name: '実務遂行', descriptor: '誤字脱字や形式面だけでなく、論点漏れを確認できる' },
          { level: 3, name: '自律推進', descriptor: '担当領域の成果物品質を安定して担保できる' },
          { level: 4, name: 'リード', descriptor: 'メンバー/ベンダー成果物まで含めてレビュー観点を浸透できる' },
          { level: 5, name: '高度化・標準化', descriptor: '品質ゲートやレビュー標準を設計し、再現性ある品質管理にできる' },
        ],
        training: [
          { title: 'ドキュメントレビューの基本', description: '成果物レビューのチェックリストと観点の整理', minLevel: 1, durationMinutes: 60, tags: 'レビュー,品質管理' },
          { title: '成果物品質基準の設定', description: '工程ごとの品質基準とゲートレビューの設計', minLevel: 2, durationMinutes: 90, tags: '品質基準,ゲートレビュー' },
          { title: '品質管理体制の設計', description: 'プロジェクト全体の品質保証プロセスと体制の構築', minLevel: 3, durationMinutes: 120, tags: '品質保証,QA体制' },
        ],
      },
      {
        name: '業務定着・運用移管',
        icon: '🔄',
        definition: '新業務・新システムが現場で回る状態まで見届ける力',
        evalNote: '運用設計の実用性・教育の効果・定着後の現場フォロー状況で評価する',
        order: 2,
        levels: [
          { level: 0, name: '未学習', descriptor: 'まだ学習・経験がない状態（未着手）' },
          { level: 1, name: '基礎理解', descriptor: '運用移管や教育が必要なことを理解できる' },
          { level: 2, name: '実務遂行', descriptor: 'FAQ、手順書、教育資料などの整備を支援できる' },
          { level: 3, name: '自律推進', descriptor: '運用設計・教育・現場定着の論点を整理し、改善につなげられる' },
          { level: 4, name: 'リード', descriptor: '定着阻害要因を見抜き、業務/IT/現場をまたいで対策を打てる' },
          { level: 5, name: '高度化・標準化', descriptor: '定着化の進め方を標準化し、横展開できる' },
        ],
        training: [
          { title: '運用設計の基礎', description: '業務フロー・操作手順書・問合せ対応フローの整備方法', minLevel: 1, durationMinutes: 60, tags: '運用設計,手順書' },
          { title: 'ユーザー教育・研修設計', description: '利用者向けトレーニング計画と教育コンテンツの作成', minLevel: 2, durationMinutes: 90, tags: 'ユーザー教育,トレーニング' },
          { title: '定着化推進と改善サイクル', description: '本番後のモニタリングと継続的改善のプロセス設計', minLevel: 3, durationMinutes: 120, tags: '定着化,改善サイクル' },
        ],
      },
    ],
  },
]

// -----------------------------------------------------------------------
// main
// -----------------------------------------------------------------------
async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10)

  // ユーザー / チーム
  const team = await prisma.team.create({ data: { name: '開発チームA' } })

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

  // スキル体系
  const allElements: Array<{ id: number; name: string }> = []
  const allContents: Array<{ id: number; elementId: number }> = []

  for (const cat of taxonomy) {
    const category = await prisma.skillCategory.create({
      data: { name: cat.name, description: cat.description, icon: cat.icon, order: cat.order },
    })

    for (const el of cat.elements) {
      const element = await prisma.skillElement.create({
        data: {
          categoryId: category.id,
          name: el.name,
          icon: el.icon,
          definition: el.definition,
          evalNote: el.evalNote,
          order: el.order,
        },
      })
      allElements.push({ id: element.id, name: element.name })

      await prisma.skillLevel.createMany({
        data: el.levels.map((lv) => ({
          skillElementId: element.id,
          level: lv.level,
          name: lv.name,
          descriptor: lv.descriptor,
        })),
      })

      for (const t of el.training) {
        const content = await prisma.trainingContent.create({
          data: {
            skillElementId: element.id,
            title: t.title,
            description: t.description,
            minLevel: t.minLevel,
            durationMinutes: t.durationMinutes,
            tags: t.tags,
            contentUrl: '',
          },
        })
        allContents.push({ id: content.id, elementId: element.id })
      }

      console.log('  ✓', el.name)
    }
  }

  // デモ：アセスメント結果
  const demoScores1 = [70, 60, 50, 65, 40, 45, 75, 55, 60, 70, 50, 65, 55]
  const demoScores2 = [40, 55, 35, 50, 60, 30, 45, 65, 40, 55, 35, 50, 60]

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
    const score1 = demoScores1[i] ?? 50
    const score2 = demoScores2[i] ?? 50
    await prisma.assessmentResult.create({
      data: { userId: member1.id, skillElementId: el.id, score: score1, level: score1 === 0 ? 0 : Math.ceil(score1 / 20) },
    })
    await prisma.assessmentResult.create({
      data: { userId: member2.id, skillElementId: el.id, score: score2, level: score2 === 0 ? 0 : Math.ceil(score2 / 20) },
    })
  }

  // デモ：学習ログ
  await prisma.studyLog.createMany({
    data: [
      { userId: member1.id, trainingContentId: allContents[0].id, durationMinutes: 60, memo: '業務ヒアリング基礎を学習した', loggedAt: new Date('2026-05-10') },
      { userId: member1.id, trainingContentId: allContents[3].id, durationMinutes: 90, memo: 'ロジカルシンキングを実践した', loggedAt: new Date('2026-05-12') },
      { userId: member1.id, trainingContentId: allContents[9].id, durationMinutes: 120, memo: 'WBS作成を演習した', loggedAt: new Date('2026-05-15') },
      { userId: member1.id, durationMinutes: 30, memo: '書籍: プロジェクトマネジメント 第3章', loggedAt: new Date('2026-05-20') },
    ],
  })

  await prisma.studyLog.createMany({
    data: [
      { userId: member2.id, trainingContentId: allContents[0].id, durationMinutes: 60, memo: '業務ヒアリングの基礎を確認した', loggedAt: new Date('2026-05-11') },
      { userId: member2.id, trainingContentId: allContents[6].id, durationMinutes: 90, memo: 'アーキテクチャ入門を受講した', loggedAt: new Date('2026-05-14') },
    ],
  })

  // デモ：学習プラン
  const plan1 = await prisma.learningPlan.create({
    data: {
      userId: member1.id, createdById: mentor.id,
      shortTermGoal: '3ヶ月以内に要件定義スキルをL3に引き上げる',
      midTermGoal: '半年以内に案件推進領域全体をL3以上に到達させる',
      status: PlanStatus.ACTIVE,
    },
  })

  await prisma.learningPlanItem.createMany({
    data: [
      { planId: plan1.id, trainingContentId: allContents[3].id, order: 1, status: PlanItemStatus.DONE },
      { planId: plan1.id, trainingContentId: allContents[4].id, order: 2, status: PlanItemStatus.IN_PROGRESS },
      { planId: plan1.id, trainingContentId: allContents[9].id, order: 3, status: PlanItemStatus.PENDING },
    ],
  })

  const plan2 = await prisma.learningPlan.create({
    data: {
      userId: member2.id, createdById: mentor.id,
      shortTermGoal: '3ヶ月で業務×IT接続領域の基礎をすべてL2に到達させる',
      midTermGoal: '1年以内にリード(L4)として案件全体を主導できるレベルを目指す',
      status: PlanStatus.ACTIVE,
    },
  })

  await prisma.learningPlanItem.createMany({
    data: [
      { planId: plan2.id, trainingContentId: allContents[0].id, order: 1, status: PlanItemStatus.PENDING },
      { planId: plan2.id, trainingContentId: allContents[1].id, order: 2, status: PlanItemStatus.IN_PROGRESS },
      { planId: plan2.id, trainingContentId: allContents[6].id, order: 3, status: PlanItemStatus.PENDING },
    ],
  })

  // デモ：フィードバック
  await prisma.feedback.createMany({
    data: [
      { mentorId: mentor.id, memberId: member1.id, skillElementId: allElements[1].id, content: '要件定義の整理が丁寧になってきました。次は仕様差分まで踏み込んで整理してみましょう。' },
      { mentorId: mentor.id, memberId: member1.id, skillElementId: allElements[6].id, content: 'WBS作成の精度が上がっています。依存関係の管理も意識して取り組んでみてください。' },
      { mentorId: mentor.id, memberId: member2.id, skillElementId: allElements[0].id, content: '業務ヒアリングで聞くべき論点が整理できてきました。次回は論点の優先度付けにも挑戦してみましょう。' },
    ],
  })

  // デモ：改善サイクル
  await prisma.improvementCycle.createMany({
    data: [
      {
        mentorId: mentor.id, memberId: member1.id,
        issue: '要件定義で仕様漏れが発生しやすい',
        action: 'チェックリストを活用し、業務・機能・データ・運用の4観点で網羅確認を実施する',
        result: '仕様漏れが減少し、レビュー指摘件数が半減した',
        status: ImprovementStatus.IN_PROGRESS,
      },
      {
        mentorId: mentor.id, memberId: member2.id,
        issue: '業務ヒアリングで論点が整理しきれない',
        action: 'ヒアリング前に論点リストを作成し、仮説を持って臨む習慣をつける',
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
