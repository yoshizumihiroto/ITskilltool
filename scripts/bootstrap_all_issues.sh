#!/usr/bin/env bash
# ITskilltool 改善issue 全部入りブートストラップ
#   - Milestone「7月パイロット」を作成
#   - P0(5) + P1(4) を作成（実issue番号を取得して依存参照に差し込む）
#   - 最後に Epic(トラッキングissue) を作成し全子issueを束ねる
# 前提: gh 認証済み / リポジトリ直下で実行 or REPO 環境変数を設定
set -euo pipefail
REPO="${REPO:-yoshizumihiroto/ITskilltool}"
MS="7月パイロット"

# --- labels & milestone (idempotent) ---
mklabel(){ gh label create "$1" --repo "$REPO" --color "$2" --force >/dev/null 2>&1 || true; }
mklabel "priority:P0" "B60205"
mklabel "priority:P1" "FBCA04"
mklabel "epic:育成フロー" "5319E7"
mklabel "area:db" "0E8A16"
mklabel "area:feature" "1D76DB"
gh api --method POST "repos/$REPO/milestones" -f title="$MS" >/dev/null 2>&1 || true

# 依存番号(N1..N9)を本文プレースホルダ {{N1}}.. に差し込んで作成し、issue番号を返す
declare N1 N2 N3 N4 N5 N6 N7 N8 N9
mkissue(){ # $1=title $2=labels $3=bodyfile
  sed -i \
    -e "s/{{N1}}/${N1:-}/g" -e "s/{{N2}}/${N2:-}/g" -e "s/{{N3}}/${N3:-}/g" \
    -e "s/{{N4}}/${N4:-}/g" -e "s/{{N5}}/${N5:-}/g" -e "s/{{N6}}/${N6:-}/g" \
    -e "s/{{N7}}/${N7:-}/g" -e "s/{{N8}}/${N8:-}/g" -e "s/{{N9}}/${N9:-}/g" "$3"
  basename "$(gh issue create --repo "$REPO" --milestone "$MS" --title "$1" --label "$2" --body-file "$3")"
}

# ===== P0 =====
cat > /tmp/b <<'BODY'
## 背景
現状 SkillCategory はフラット1段で「大分類(業務カテゴリ)→小分類(スキル要素)」を表現できない。スキルシートv0.1は5大分類/13小分類、レベル記述子は要素別。全改善の土台。
## 変更内容
- `SkillElement` 追加: id, categoryId, name, definition, evalNote, order
- `SkillLevel` 追加: id, skillElementId, level(0-5), name, descriptor（要素別）
- `AssessmentResult`/`TrainingContent`/`Feedback` の categoryId を skillElementId に付け替え
- `SkillGrade` 廃止（SkillLevel に置換）
- `prisma/seed.ts` を `skill_taxonomy.json` から5/13/L0-L5記述子で再生成（既存デモ分類は破棄）
## 受け入れ条件
- [ ] 13スキル要素が各大分類配下に表示される
- [ ] 各スキル要素にL0-L5記述子（要素別）が表示される
- [ ] 既存の診断・コンテンツ・FB画面がスキル要素単位で動く
- [ ] prisma migrate と seed が通る

依存: なし（最優先）
BODY
N1=$(mkissue "[P0] 大分類→小分類の2階層化＋スキルシートv0.1投入" "priority:P0,epic:育成フロー,area:db" /tmp/b)

cat > /tmp/b <<'BODY'
## 背景
育成フロー先頭の事前診断。L0-L5は主観ルーブリックで自己評価だけだと過大/過小評価が混じる。テストだけだと設問作り込みでガードレールと衝突。自己評価×Claude API確認テストをかけ合わせ、乖離を学習シグナルにする。
## 変更内容
- 自己評価: 各要素のL0-L5記述子を読み現在地レベルを選択（全13要素）
- 確認テスト: 要素(or 大分類)ごとに短いケース型設問1-2問。Claude API(claude-sonnet-4-6)が模範観点と照合し観点スコア→推定レベル
- 確定: selfLevel/estimatedLevel/差分 を保存。確定はメンター確認 or 簡易ルール（乖離大の要素だけレビュー対象）
- AssessmentResult を userId, skillElementId, selfLevel, testScore?, estimatedLevel?, confirmedLevel?, createdAt に再設計
## 受け入れ条件
- [ ] 13要素の自己評価レベルが記録できる
- [ ] 確認テストの観点スコア/推定レベルが返る
- [ ] 自己評価と推定レベルの差分が要素ごとに見える
- [ ] 確定レベルが保存され再診断で推移が見える
## 設計メモ
- 採点エンジンは #{{N3}} と同一の Claude API 呼び出し。Exercise に purpose(DIAGNOSIS/PRACTICE)を持たせ共有
- 7月は全要素にテストを作り込まない。数要素＋大分類代表設問に絞り残りは自己評価のみ可

依存: #{{N1}}（採点ロジックは #{{N3}} と共通化）
BODY
N2=$(mkissue "[P0] 事前診断：自己評価×確認テストのかけ合わせ" "priority:P0,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
## 背景
育成フローの「演習」が未実装。施策の核。論点整理・翻訳精度重視のためケース型演習にする（コーディング演習にしない）。
## 変更内容
- `Exercise`: id, skillElementId, title, prompt, modelPerspective, track, purpose(DIAGNOSIS/PRACTICE)（#{{N2}}確認テストと同一テーブル共有）
- `ExerciseSubmission`: id, userId, exerciseId, answer, aiFeedback, score, createdAt
- `POST /api/exercises/[id]/submit`: Claude API(claude-sonnet-4-6)で模範観点と照合。PRACTICE=観点FB、DIAGNOSIS=観点スコア→推定レベル
- 初期コンテンツはマイナ案件の匿名化ケース（実データ・固有名詞をAIに投入しない）
## 受け入れ条件
- [ ] スキル要素に紐づく演習を提出できる
- [ ] 提出後に観点FBが返る
- [ ] 提出物がメンター/指標から参照できる

技術メモ: APIキーは既存 ANTHROPIC_API_KEY。Sonnet＋プロンプトキャッシュ、max_tokens控えめ。
依存: #{{N1}}
BODY
N3=$(mkissue "[P0] 演習：提出＋Claude API観点フィードバック" "priority:P0,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
## 背景
7月検証の最重要点（OJT接続/実案件適用）。未実装。施策指定は「カタログから1つ選ぶだけ」「IT-SI/非IT-SIで分ける」「上司レポートは本人作成」。Mgr負荷を上げない。
## 変更内容
- `OjtTask`: id, skillElementId, title, description, track(COMMON/IT_SI/NON_IT_SI), difficulty
- `OjtAssignment`: id, userId, ojtTaskId, status, appliedToRealProject(bool), reflection, reviewedAt
- 受講後に本人が1つ選択 → 実案件で試す → 1か月後に振り返り記入
- Mgr一次レビュー（再レビュー）。ImprovementCycle と接続 or 流用
## 受け入れ条件
- [ ] スキル要素ごとにOJT候補が表示される
- [ ] 受講者がOJTタスクを1つ設定できる
- [ ] 実案件適用フラグ＋振り返りが記録される
- [ ] 指標にOJT設定率・実案件適用率が出る

依存: #{{N1}}
BODY
N4=$(mkissue "[P0] OJTタスクカタログ＋設定＋実案件適用トラッキング" "priority:P0,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
## 背景
田中さんの7月検証論点を数値で確認する場。各ステップ実施率・OJT設定率・実案件適用率を見る。
## 変更内容
- /tm もしくは新規 /admin に集計ビュー
- 受講者 × ステップ（事前診断/受講/演習提出/OJT設定/実案件適用/再レビュー）の実施状況を一覧＋率で表示
- （任意）CSV出力
## 受け入れ条件
- [ ] パイロット対象者のステップ別実施状況が一覧/率で見える
- [ ] 「運用が回っているか」を一目で判断できる

技術メモ: 高機能化しない。数値テーブル＋簡易バーで十分。
依存: #{{N2}}, #{{N3}}, #{{N4}}
BODY
N5=$(mkissue "[P0] パイロット指標ダッシュボード（TM/施策責任者向け）" "priority:P0,epic:育成フロー,area:feature" /tmp/b)

# ===== P1 =====
cat > /tmp/b <<'BODY'
本人作成レポート（上司共有用）。`SelfReport(userId, period, content, sharedWithMentor)`。運用軽量化の肝。初回はテキスト1枚でも可。
依存: #{{N1}}
BODY
N6=$(mkissue "[P1] セルフレポート機能" "priority:P1,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
`Feedback` に観点テンプレを追加し、メンターFBのばらつきを抑える。
依存: #{{N1}}
BODY
N7=$(mkissue "[P1] 定型FBテンプレート化" "priority:P1,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
`User.track`(COMMON/IT_SI/NON_IT_SI/SELECTED)。初回は全員共通＋IT-SI入口のみ。#{{N3}}/#{{N4}}のコンテンツ側trackと突き合わせ出し分け。
依存: #{{N1}} / 関連: #{{N3}}, #{{N4}}
BODY
N8=$(mkissue "[P1] 育成トラック割当" "priority:P1,epic:育成フロー,area:feature" /tmp/b)

cat > /tmp/b <<'BODY'
`ImprovementCycle` をOJT後の再レビュー工程として整理し、フロー上の位置づけを明確化。
依存: #{{N4}}
BODY
N9=$(mkissue "[P1] 再レビューの明示化" "priority:P1,epic:育成フロー,area:feature" /tmp/b)

# ===== Epic (last) =====
cat > /tmp/b <<'BODY'
育成フロー（事前診断→受講→演習→FB→上司共有→OJT→再レビュー）を7月パイロットで回せる状態にする。

## スコープ / ガードレール
- 7月の検証目的は「運用が回るか / 実案件OJTに接続できるか / 受講者とMgrが前向きに使えるか」。網羅性は追わない。
- 高機能化より運用負荷の可視化。SIerエンジニア育成に寄せず、DXコンサルの論点化・翻訳精度を重視（演習/OJTはケース型）。
- マイナ案件素材は匿名化してから教材化（AIに実データを投入しない）。

## データモデル変更方針
- SkillCategory(フラット) → SkillCategory(大分類)→SkillElement(小分類) の2段
- SkillGrade(カテゴリ単位) → SkillLevel(スキル要素単位・L0-L5・要素別記述子)
- 診断/コンテンツ/FB を skillElementId に付け替え
- seed はスキルシートv0.1に置換（5大分類/13小分類）。正本は repo の skill_taxonomy.json

## 子issue
### P0（7月パイロット必須）
- [ ] #{{N1}} 大分類→小分類の2階層化＋スキルシート投入
- [ ] #{{N2}} 事前診断：自己評価×確認テスト
- [ ] #{{N3}} 演習＋Claude API観点FB
- [ ] #{{N4}} OJTカタログ＋実案件適用トラッキング
- [ ] #{{N5}} パイロット指標ダッシュボード
### P1（パイロット後）
- [ ] #{{N6}} セルフレポート
- [ ] #{{N7}} 定型FBテンプレ化
- [ ] #{{N8}} 育成トラック割当
- [ ] #{{N9}} 再レビュー明示化

## 進め方
#{{N1}} を先に通す → #{{N2}}/#{{N3}} を並行（採点エンジン共通化）→ #{{N4}} → #{{N5}}
BODY
NE=$(mkissue "[Epic] 育成フロー運用ループを7月パイロット可能にする" "epic:育成フロー" /tmp/b)

echo "✅ 作成完了: Epic #$NE / P0 #$N1 #$N2 #$N3 #$N4 #$N5 / P1 #$N6 #$N7 #$N8 #$N9  ($REPO)"
