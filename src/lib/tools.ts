export type ToolId =
  | "qr"
  | "image-compress"
  | "break-even"
  | "estimate"
  | "invoice-receipt"
  | "price-list"
  | "queue-board"
  | "genba-kintai";

export interface ToolMeta {
  id: ToolId;
  /** 表示名(短) */
  name: string;
  /** SEO向けタイトル */
  seoTitle: string;
  /** 一覧カード・description用 */
  description: string;
  /** ページ冒頭の説明文 */
  lead: string;
  /** 絵文字アイコン(画像がない場合のフォールバック) */
  emoji: string;
  /** ブランドアイコン画像(あれば絵文字より優先) */
  icon?: string;
  /** 「御社仕様にカスタムできます」の具体例3つ */
  customizeExamples: [string, string, string];
  /** 公開済みか(falseは「近日公開」カード) */
  released: boolean;
}

export const SITE_NAME = "しごとの小道具 by ココロAI";
export const SITE_URL = "https://cocoroai-tools.pages.dev"; // ドメイン確定後に tools.cocoroai.co.jp へ変更
export const CONTACT_URL = "https://cocoroai-contact.map-cocoro.workers.dev";
export const CONTACT_EMAIL = "info@cocoroai.co.jp";

export const TOOLS: ToolMeta[] = [
  {
    id: "qr",
    name: "QRコードかんたん作成",
    seoTitle: "QRコード作成(無料・登録不要・ロゴ色対応)",
    description:
      "URLを入れるだけでQRコードを作成。ロゴ入りにも対応。PNG/SVG保存。登録不要・完全無料。",
    lead: "チラシ・メニュー・名刺に。URLを入れるだけで、その場でQRコードができます。真ん中にお店のロゴを入れることもできます。データはお使いの端末の中だけで処理され、外部に送信されません。",
    emoji: "🔳",
    icon: "/icons/tools/qr.png",
    customizeExamples: [
      "読み取り回数の計測(どのチラシが効いたか分かる)",
      "商品・店舗ごとのQR一括生成",
      "メニュー表・チラシへの自動レイアウト",
    ],
    released: true,
  },
  {
    id: "image-compress",
    name: "写真かんたん圧縮",
    seoTitle: "写真圧縮・WebP変換(無料・ブラウザ完結)",
    description:
      "写真をドラッグするだけで軽量化。ホームページが重い・メールで送れない、を解決。",
    lead: "スマホ写真をそのままHPに載せると表示が遅くなります。ここに写真を入れるだけで、画質を保ったまま軽くします。写真は端末の外に送信されません。",
    emoji: "🖼️",
    icon: "/icons/tools/image-compress.png",
    customizeExamples: [
      "ホームページ更新時の自動圧縮の仕組み化",
      "商品写真の一括リサイズ+透かし入れ",
      "Googleドライブ連携で全社写真を自動整理",
    ],
    released: true,
  },
  {
    id: "break-even",
    name: "損益分岐点かんたん計算",
    seoTitle: "損益分岐点 計算ツール(無料・グラフ表示)",
    description:
      "「いくら売れば黒字?」が3つの数字で分かる。起業準備・値付けの見直しに。",
    lead: "固定費・変動費率・売値を入れるだけで、「月いくら売れば黒字か」がグラフで見えます。起業準備や値上げ検討の最初の一歩に。",
    emoji: "📈",
    icon: "/icons/tools/break-even.png",
    customizeExamples: [
      "御社の実数値を毎月入れて推移を見る経営ダッシュボード",
      "商品別・店舗別の採算シミュレーション",
      "会計データと連携した自動更新",
    ],
    released: true,
  },
  {
    id: "estimate",
    name: "かんたん見積書",
    seoTitle: "見積書 作成(無料・インボイス対応・登録不要)",
    description:
      "ブラウザだけで見積書を作成してPDF保存。インボイス対応。データは端末内に保存。",
    lead: "明細を入れるだけで、そのまま出せる見積書ができます。印刷・PDF保存に対応。入力内容はお使いの端末にだけ保存されます。",
    emoji: "📄",
    icon: "/icons/tools/estimate.png",
    customizeExamples: [
      "御社の単価表・よく使う工事項目を内蔵したカスタム版",
      "過去の見積をコピーして使い回せる管理機能",
      "見積→請求→入金管理までの一気通貫システム",
    ],
    released: true,
  },
  {
    id: "invoice-receipt",
    name: "請求書・領収書メーカー",
    seoTitle: "請求書・領収書 作成(無料・インボイス対応)",
    description:
      "適格請求書(インボイス)対応の請求書・領収書をブラウザだけで作成・印刷。",
    lead: "インボイス登録番号・税率別の内訳に対応した請求書と領収書が作れます。印刷・PDF保存対応。データは端末の中だけ。",
    emoji: "🧾",
    icon: "/icons/tools/invoice-receipt.png",
    customizeExamples: [
      "顧客台帳とつないで宛名をワンタップ入力",
      "会計ソフトへの自動連携",
      "定期請求の自動発行・メール送付",
    ],
    released: true,
  },
  {
    id: "price-list",
    name: "料金表・メニュー表メーカー",
    seoTitle: "料金表・メニュー表 作成(無料・A4印刷対応)",
    description:
      "店頭・卓上にそのまま置ける料金表をブラウザで作成。税込/税抜の切替も一発。",
    lead: "メニュー名と金額を入れるだけで、きれいな料金表ができます。A4印刷対応。税込・税抜の表記切替もワンタップ。",
    emoji: "💴",
    icon: "/icons/tools/price-list.png",
    customizeExamples: [
      "ホームページに組み込んで自分で更新できる料金表",
      "お店の雰囲気に合わせたオリジナルデザイン",
      "QRコード付きデジタルメニューへの展開",
    ],
    released: true,
  },
  {
    id: "queue-board",
    name: "順番待ち受付ボード",
    seoTitle: "順番待ち受付ボード(無料・番号札・店舗用)",
    description:
      "タブレット1台で受付番号の発行と呼び出し表示。電源を入れたらすぐ使える番号札。",
    lead: "お店のタブレットでそのまま使える順番待ちボードです。受付で番号を発行し、大きな数字で「呼び出し中」を表示。ネットが切れても動きます。",
    emoji: "🪑",
    icon: "/icons/tools/queue-board.png",
    customizeExamples: [
      "お客様のLINEに「もうすぐ順番です」と自動通知",
      "受付・厨房・フロアなど複数端末でのリアルタイム共有",
      "受付フォームと連携した事前受付システム",
    ],
    released: true,
  },
  {
    id: "genba-kintai",
    name: "げんば勤怠",
    seoTitle: "げんば勤怠(無料・打刻・現場ごと集計・CSV出力)",
    description:
      "タップで出退勤・休憩を記録。現場ごとに集計してCSV出力。夜勤対応・端末内保存・オフラインOK。",
    lead: "現場で働く方が、自分の労働時間を記録するためのアプリです。大きなボタンで出退勤・休憩を打刻し、現場ごとに時間を集計。夜勤(日をまたぐ勤務)にも対応し、CSVで書き出せます。位置情報を使うと現場を自動で判定できます(在宅ならオフに)。記録はこの端末の中だけに保存され、外部に送信されません。",
    emoji: "⏱️",
    icon: "/icons/tools/genba-kintai.png",
    customizeExamples: [
      "複数の従業員をまとめて管理する会社向けクラウド勤怠",
      "給与計算ソフト・請求書ツールへの自動連携",
      "打刻データから日報・現場別の原価集計を自動作成",
    ],
    released: true,
  },
];

export function getTool(id: ToolId): ToolMeta {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`unknown tool: ${id}`);
  return tool;
}
