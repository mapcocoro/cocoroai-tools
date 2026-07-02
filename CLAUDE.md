# cocoroai-tools（しごとの小道具）— 作業前に必読

このリポで**ツールを追加・改修する前に、必ず [ADDING-A-TOOL.md](./ADDING-A-TOOL.md) を読むこと**。
手順・デザイン規約・実装の落とし穴・受注時の金額注意・QAチェックリストの正本。

## 特に事故りやすい4点（詳細はガイド）
1. **デプロイは手動wrangler**。`git push` では本番は更新されない：
   `npm run build && npx wrangler pages deploy out --project-name=cocoroai-tools --branch=main`
2. **時刻/乱数/Date.now() は初回レンダーで出さない**（hydration #418）。`mounted` フラグでガード。
3. **QAはPlaywrightのDOM/evaluateで**（ヘッドレスのスクショはタイムアウトしがち）。
4. **コーポレートHPは別リポ** `../../cocoroai-hp`（GitHub Pages・push＝自動デプロイ）。反映も忘れず。

## 動かない前提の線
- データは端末内localStorageのみ・外部送信なし。
- 給与/税額計算はしない。できないことは客向けに書かない。
- 価格・受注ルールの正本は `ops/services/kodogu-custom-design.md`。
