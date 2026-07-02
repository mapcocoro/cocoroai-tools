# しごとの小道具 — ツールの作り方・注意事項（実装ガイド）

このリポで新しいツールを追加・改修するときの**手順・規約・落とし穴**の正本。
Fable以外のモデル（Opus等）でも、手際よく・ミスなく実装するために必ず最初に読むこと。
（実例＝2026-07に追加した8本目 `genba-kintai`。迷ったら既存ツールの実装を真似る）

---

## 0. 最初に知るべき「事故る4つの落とし穴」

1. **デプロイは手動wrangler**。Cloudflare Pagesはこのリポと**Git連携していない**。
   `git push` だけでは本番（cocoroai-tools.pages.dev）は**更新されない**。必ず：
   ```
   npm run build
   npx wrangler pages deploy out --project-name=cocoroai-tools --branch=main
   ```
   （wranglerは info@cocoroai.co.jp で認証済み。account f74746fd6a8d294361a483856d7f0957）
2. **時刻・乱数・`Date.now()` を初回レンダーで描画すると hydration mismatch（React #418）**。
   静的プリレンダーとクライアントで値が食い違うため。→ 必ず `mounted` フラグでガード（§4）。
3. **ヘッドレスのスクリーンショットはタイムアウトしがち**（Webフォント待ち＋常時アニメ）。
   QAは Playwright の**DOM/ピクセル evaluate** で検証する。見た目の最終確認は実機で。
4. **コーポレートHPは別リポ**（`mapcocoro/cocoroai-hp` = `/Users/runa/projects/cocoroai-hp`）。
   こちらは **GitHub Pages で push＝自動デプロイ**（挙動がこのリポと逆なので注意）。

---

## 1. 技術スタック / 場所

- パス：`/Users/runa/projects/※biz-tools/cocoroai-tools`（※フルパスに全角「※」。シェルでは要クォート）
- Next.js 16 + React 19 + TypeScript + Tailwind v4、`output: "export"`（静的・SSRなし）
- リポ：`mapcocoro/cocoroai-tools`（public）
- 本番：`https://cocoroai-tools.pages.dev`（将来 tools.cocoroai.co.jp）
- 各ツール＝1つのNext.jsアプリ内の**ページ（ルート）**。ツールごとに別リポ/別フォルダにはしない。

---

## 2. ツールを1本追加する手順（チェックリスト）

1. `src/lib/tools.ts`：`ToolId` union に `"<id>"` を追加
2. 同ファイル `TOOLS[]` に meta を追加（`id / name / seoTitle / description / lead / emoji / icon / customizeExamples[3] / released:true`）
3. `src/app/tools/<id>/page.tsx` を作成（`ToolLayout` + 本体コンポーネント、`metadata = toolMetadata(tool)`）
4. `src/app/tools/<id>/<Name>Tool.tsx` を作成（先頭に `"use client";`）
5. アイコン `public/icons/tools/<id>.png`（**256×256**）
6. OG画像 `public/og/<id>.png`（**1200×630**）
7. manifest `public/manifests/<id>.webmanifest`（既存をコピーして name / short_name / description / start_url を変更）
8. `npm run build` で **エラー0** を確認 → `wrangler pages deploy`（§0）
9. コーポレートHPに反映（§5）

### アイコン生成（macOS `sips`。ブランド素材から）
素材：`/Users/runa/Library/CloudStorage/GoogleDrive-info@cocoroai.co.jp/マイドライブ/Slide素材/iconset/`
```
# ツールアイコン(256)
sips -s format png -Z 256 "<素材>.png" --out public/icons/tools/<id>.png
# アプリ内の小アイコン(96・必要なら public/icons/<id>/ に)
sips -s format png -Z 96 "<素材>.png" --out public/icons/<id>/<name>.png
# OG(1200x630・ティール背景にアイコンを載せる)
sips -s format png -Z 400 "<素材>.png" --out /tmp/og.png
sips --padToHeightWidth 630 1200 --padColor 005B7B /tmp/og.png --out public/og/<id>.png
```

### page.tsx の型（既存 queue-board を踏襲）
```tsx
import ToolLayout from "@/components/ToolLayout";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import XxxTool from "./XxxTool";
const tool = getTool("<id>");
export const metadata = toolMetadata(tool);
export default function Page() {
  return (<ToolLayout toolId="<id>"><XxxTool /></ToolLayout>);
}
```

---

## 3. デザイン規約（既存と必ず揃える）

- **トークン**（`src/app/globals.css`）：paper `#fdfcfb` / paper-2 `#f7f4ee` / ink `#0d2733` / ink-mute / line `#e4e7e9` / teal `#005b7b` / teal-deep `#003f57` / teal-soft / teal-softer / sun `#fccf27`。
  Tailwindクラスでそのまま使える：`bg-teal text-white bg-card border-line text-ink text-ink-mute bg-paper-2 text-teal-deep bg-teal-softer` など。
- **フォント**：見出し＝Shippori Mincho（`font-serif`）、本文＝Noto Sans JP、数字は `tnum`（等幅）。
- **対象＝IT苦手層**：完全日本語・専門用語ゼロ・**大きいボタン**・項目最小・オフラインで動く安心表示。
- 共通骨格 `ToolLayout`（ヘッダー / リード / 本体 / CustomizeCTA / FeedbackForm / フッター）を必ず使う。
- 色使い：肯定/主操作＝teal、終了/警告＝**クリーンな暖色**（例 `#e0562f`〜柿色）。**くすんだ茶色は避ける**。
- アイコン：**絵文字を主役にしない**。構造的アイコンはブランドiconset（PNG）、状態アイコンは inline SVG（例：出退勤＝login/logout SVG）。

---

## 4. 実装の規約・落とし穴

- **データは端末内 localStorage のみ・外部送信なし**（＝プライバシーが売り）。キーは `<id>...` で命名。
- **ロード前に保存しない**：`ready` フラグ。マウント時に load → `setReady(true)`、保存 effect は `if(!ready) return`。
- **hydration（#418）対策**：`Date.now()` / ランダム / 現在時刻に依存する表示は、`const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[])` の後だけ描画する。初期値は固定（例 `useState(0)`）にし、`mounted ? hm(now) : "--:--"` のように出す。
- localStorage 書き込みは **try/catch**（容量超過でも機能継続）。
- 画像は `<img>` ＋ 行頭に `/* eslint-disable @next/next/no-img-element */`（静的exportのため next/image は使わない運用）。
- 外部リンクは `target="_blank" rel="noopener"`。
- 制御 input を Playwright でテストするときは、`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set` を使わないと React の onChange が発火しない（単なる `.value=` は不可）。

---

## 5. コーポレートHP反映（別リポ `cocoroai-hp`）

1. `products.html` の `#zkGrid` に `.zk-sat` カードを1枚追加（既存の順番待ちカードをコピー）：
   `data-cat="work"` / `data-desc="…（できることだけ・端末内保存に触れる）"` / `img src="images/kodogu/<id>.png"` / name / meta「しごとの小道具」/ links＝Web→`https://cocoroai-tools.pages.dev/tools/<id>/`
2. 画像コピー：`cp public/icons/tools/<id>.png ../../cocoroai-hp/images/kodogu/<id>.png`
3. `index.html` のツール本数表記（「N本」「Nつの実用ツール」）を +1。
4. commit → **push で自動デプロイ**（GitHub Pages / www.cocoroai.co.jp）。

---

## 6. 法務・ポリシーの線（客向けに「書いてはいけない」こと）

- **給与・税額の計算はしない**（税理士法 / 社労士法）。ツールは「打刻・集計・CSV書き出し」まで。
- **できないことを書かない**。「自動連携」などの過大表現はNG。`customizeExamples` は**実際に作れることだけ**。
  例：「給与ソフトへ自動連携」✕ → 「給与ソフトに取り込めるCSV書き出し」○。
- **客向け文書にサービス固有名詞を入れない**（Supabase / Workers / Resend / microCMS 等は一般名称に。LINE・クラウドサイン・ドメイン名はOK）。→ ops `feedback_no_service_names_in_contract`
- **データ蓄積系（個人情報の台帳）**＝当社 Supabase Pro の SaaS＝**有料月額＋別紙特約B**。無料の個人版に混ぜない。
- **通知・共有・複数人管理**＝サーバー必須＝**会社用の有料アップグレード**（個人版は端末内完結・無料）。
- 価格の根拠・工数見積は ops `services/kodogu-custom-design.md`（価格ティア S/M/L、各ツールのカスタム例別シミュ）を参照。

---

## 7. 受注時の金額面での注意事項（安売り防止）

> 価格の**正本**は `ops/services/kodogu-custom-design.md`（価格ティア・ツール別カスタム例のシミュ）。ここは要点の再掲。

- **安く見積もる癖に注意**（既知の傾向）。**フォーム制作相場（15〜28万）に引っ張られない**。会社向けの業務ツールは「アプリ枠」で値付けする。
- **価格ティア（時給床 ¥8,000/h で検算済み）**：
  - **S**（端末内完結の専用版）：**¥50,000〜150,000 買い切り**。※¥50,000で受けてよいのは実工数**6h以内**のみ（下限張り付き禁止）
  - **M**（小さなサーバー / 連携1つ）：**初期¥150,000〜400,000 ＋ 月¥8,000〜15,000**（Supabase / 認証込みは実質¥250,000〜）
  - **L**（業務システム）：**サブスク推奨 初期¥250,000〜300,000 ＋ 月¥30,000〜**（買い切り希望なら¥650,000〜）
- **サブスク発生の3トリガー**（どれか1つでも該当 → **月額必須**）：①当社APIキーで動く ②当社管理のサーバーがある ③定期監視/追従が必要。→ **通知・共有・データ蓄積は全部これに該当**＝買い切り不可寄り。
- **月額の中身**：インフラ実費（合計¥2,000台）＋**見守り工数が原価の本体**。「**月次対応30分まで・超過はスポット¥5,000〜/回**」を必ずプラン定義に入れる（＝無償保守化を防ぐ価格防衛の本体）。
- **買い切りの場合**：納品後は**無保証**。「不具合調査はスポット¥5,000〜/回」を契約特記。「ずっと使える」等は言わない。
- **L案件は2段階**：**要件定義¥50,000を先行受注 → 確定見積**。いきなり大型を無料見積しない。
- **外部サービス費は客直払い**：LINE公式アカウントのプラン費・独自ドメイン等は**客名義・客負担**を契約明記。当社月額は「サーバー＋見守り」分。
- **着手金30%前払い** ＋ 契約で修正回数 / キャンセル区分を定める（自社方針）。
- **本番Workersは Paid $5/月を標準**（無料枠はアカウント共用のため）＝実質固定費として月額に織り込む。
- **見積書・提案書PDFにサービス固有名詞を書かない**（一般名称に。§6参照）。

---

## 8. QA（リリース前・必須）

- `npm run build` 成功（**TypeScript / ESLint エラー0**）。
- Playwright（**DOMベース**、スクショに頼らない）で：
  - コンソールエラー **0**（favicon 404は無視可）
  - **hydrationエラー（#418）が出ていない**
  - 主要フロー：入力 → 動作 → localStorage保存 → **リロードで復元**
  - モバイル幅 **390px** で崩れなし
- デプロイ後、本番URLを**キャッシュバスト**（`?v=<timestamp>`）で確認。

---

## 9. 既存8ツール（参考）
qr / image-compress / break-even / estimate / invoice-receipt / price-list / queue-board / **genba-kintai**（現場向け個人用勤怠・localStorage・位置情報任意・CSV出力）。
localStorage系の実装参考＝`src/app/tools/queue-board/QueueBoardTool.tsx` と `genba-kintai/GenbaKintaiTool.tsx`。
