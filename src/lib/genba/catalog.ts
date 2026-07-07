// げんばで見積 商品マスタ（サンプル単価つき）
// 移植元: kensetsu-estimate-app/src/data/products.ts（現場帳）
// ※単価はあくまで一般的なサンプル。明細に追加したあと自由に変更できる
// 商品データ（大項目 → 中項目 → 商品）
export interface Product {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  description?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  products: Product[];
}

export interface MainCategory {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export const productCatalog: MainCategory[] = [
  {
    id: 'painting',
    name: '塗装工事',
    icon: 'paint',
    subCategories: [
      {
        id: 'exterior-wall',
        name: '外壁塗装',
        products: [
          { id: 'ext-1', name: 'シリコン塗装（外壁）', unit: '㎡', unitPrice: 2800, description: '耐久性10年' },
          { id: 'ext-2', name: 'フッ素塗装（外壁）', unit: '㎡', unitPrice: 4500, description: '耐久性15年' },
          { id: 'ext-3', name: 'ウレタン塗装（外壁）', unit: '㎡', unitPrice: 2200, description: '耐久性8年' },
          { id: 'ext-4', name: '無機塗装（外壁）', unit: '㎡', unitPrice: 5500, description: '耐久性20年' },
          { id: 'ext-5', name: 'ラジカル制御塗装', unit: '㎡', unitPrice: 3200, description: '耐久性12年' },
        ],
      },
      {
        id: 'roof-paint',
        name: '屋根塗装',
        products: [
          { id: 'roof-1', name: 'シリコン塗装（屋根）', unit: '㎡', unitPrice: 3200, description: '耐久性10年' },
          { id: 'roof-2', name: 'フッ素塗装（屋根）', unit: '㎡', unitPrice: 5000, description: '耐久性15年' },
          { id: 'roof-3', name: '遮熱塗装（屋根）', unit: '㎡', unitPrice: 4000, description: '省エネ効果' },
          { id: 'roof-4', name: '断熱塗装（屋根）', unit: '㎡', unitPrice: 4500, description: '断熱効果' },
        ],
      },
      {
        id: 'prep-work',
        name: '下地処理・準備',
        products: [
          { id: 'prep-1', name: '足場設置', unit: '㎡', unitPrice: 800 },
          { id: 'prep-2', name: '足場撤去', unit: '㎡', unitPrice: 200 },
          { id: 'prep-3', name: '高圧洗浄', unit: '㎡', unitPrice: 300 },
          { id: 'prep-4', name: '下地処理（クラック補修）', unit: '式', unitPrice: 30000 },
          { id: 'prep-5', name: 'シーリング打替え', unit: 'm', unitPrice: 1200 },
          { id: 'prep-6', name: 'シーリング増し打ち', unit: 'm', unitPrice: 800 },
          { id: 'prep-7', name: '養生', unit: '式', unitPrice: 25000 },
          { id: 'prep-8', name: 'ケレン作業', unit: '㎡', unitPrice: 500 },
        ],
      },
      {
        id: 'partial-paint',
        name: '部分塗装',
        products: [
          { id: 'part-1', name: '軒天塗装', unit: '㎡', unitPrice: 1800 },
          { id: 'part-2', name: '破風板塗装', unit: 'm', unitPrice: 1000 },
          { id: 'part-3', name: '雨樋塗装', unit: 'm', unitPrice: 800 },
          { id: 'part-4', name: '雨戸塗装', unit: '枚', unitPrice: 3000 },
          { id: 'part-5', name: '戸袋塗装', unit: '箇所', unitPrice: 4000 },
          { id: 'part-6', name: '水切り塗装', unit: 'm', unitPrice: 600 },
        ],
      },
      {
        id: 'interior-paint',
        name: '内装塗装',
        products: [
          { id: 'int-1', name: '室内壁塗装', unit: '㎡', unitPrice: 1500 },
          { id: 'int-2', name: '天井塗装', unit: '㎡', unitPrice: 1800 },
          { id: 'int-3', name: '木部塗装', unit: '㎡', unitPrice: 2000 },
        ],
      },
    ],
  },
  {
    id: 'electric',
    name: '電気工事',
    icon: 'electric',
    subCategories: [
      {
        id: 'outlet-switch',
        name: 'コンセント・スイッチ',
        products: [
          { id: 'out-1', name: 'コンセント増設（壁内配線）', unit: '箇所', unitPrice: 15000 },
          { id: 'out-2', name: 'コンセント増設（露出配線）', unit: '箇所', unitPrice: 8000 },
          { id: 'out-3', name: 'コンセント交換', unit: '箇所', unitPrice: 3000 },
          { id: 'out-4', name: 'スイッチ交換', unit: '箇所', unitPrice: 3000 },
          { id: 'out-5', name: '200Vコンセント設置', unit: '箇所', unitPrice: 25000 },
          { id: 'out-6', name: 'USBコンセント設置', unit: '箇所', unitPrice: 8000 },
          { id: 'out-7', name: 'アース付コンセント設置', unit: '箇所', unitPrice: 12000 },
        ],
      },
      {
        id: 'lighting',
        name: '照明工事',
        products: [
          { id: 'light-1', name: 'シーリングライト取付', unit: '台', unitPrice: 5000 },
          { id: 'light-2', name: 'ダウンライト新設', unit: '台', unitPrice: 12000 },
          { id: 'light-3', name: 'ダウンライトLED交換', unit: '台', unitPrice: 8000 },
          { id: 'light-4', name: '屋外照明設置', unit: '台', unitPrice: 18000 },
          { id: 'light-5', name: '人感センサーライト設置', unit: '台', unitPrice: 15000 },
          { id: 'light-6', name: 'スポットライト設置', unit: '台', unitPrice: 10000 },
          { id: 'light-7', name: '間接照明設置', unit: 'm', unitPrice: 8000 },
          { id: 'light-8', name: '蛍光灯LED化', unit: '本', unitPrice: 5000 },
        ],
      },
      {
        id: 'panel-wiring',
        name: '分電盤・配線',
        products: [
          { id: 'panel-1', name: '分電盤交換（20回路）', unit: '台', unitPrice: 80000 },
          { id: 'panel-2', name: '分電盤交換（30回路）', unit: '台', unitPrice: 100000 },
          { id: 'panel-3', name: 'ブレーカー増設', unit: '回路', unitPrice: 15000 },
          { id: 'panel-4', name: '専用回路配線', unit: '式', unitPrice: 35000 },
          { id: 'panel-5', name: '漏電ブレーカー交換', unit: '台', unitPrice: 20000 },
          { id: 'panel-6', name: '電気容量変更工事', unit: '式', unitPrice: 50000 },
        ],
      },
      {
        id: 'aircon-work',
        name: 'エアコン工事',
        products: [
          { id: 'ac-1', name: 'エアコン取付（標準）', unit: '台', unitPrice: 15000 },
          { id: 'ac-2', name: 'エアコン取付（配管4m以上）', unit: '台', unitPrice: 25000 },
          { id: 'ac-3', name: 'エアコン取外し', unit: '台', unitPrice: 8000 },
          { id: 'ac-4', name: 'エアコン移設', unit: '台', unitPrice: 30000 },
          { id: 'ac-5', name: '隠蔽配管工事', unit: '式', unitPrice: 50000 },
          { id: 'ac-6', name: 'エアコン用コンセント新設', unit: '箇所', unitPrice: 20000 },
          { id: 'ac-7', name: '室外機置台設置', unit: '台', unitPrice: 8000 },
        ],
      },
      {
        id: 'tv-lan',
        name: 'TV・LAN・通信',
        products: [
          { id: 'tv-1', name: 'テレビアンテナ設置', unit: '式', unitPrice: 35000 },
          { id: 'tv-2', name: 'BS/CSアンテナ設置', unit: '式', unitPrice: 25000 },
          { id: 'tv-3', name: 'LAN配線（1箇所）', unit: '箇所', unitPrice: 15000 },
          { id: 'tv-4', name: 'LAN配線（追加）', unit: '箇所', unitPrice: 10000 },
          { id: 'tv-5', name: 'インターホン交換', unit: '式', unitPrice: 40000 },
          { id: 'tv-6', name: 'テレビドアホン設置', unit: '式', unitPrice: 60000 },
        ],
      },
    ],
  },
  {
    id: 'interior',
    name: '内装工事',
    icon: 'interior',
    subCategories: [
      {
        id: 'wall-ceiling',
        name: '壁・天井',
        products: [
          { id: 'wall-1', name: 'クロス張替（量産品）', unit: '㎡', unitPrice: 1200 },
          { id: 'wall-2', name: 'クロス張替（1000番台）', unit: '㎡', unitPrice: 1500 },
          { id: 'wall-3', name: 'クロス張替（機能性）', unit: '㎡', unitPrice: 1800 },
          { id: 'wall-4', name: '珪藻土塗装', unit: '㎡', unitPrice: 4500 },
          { id: 'wall-5', name: '漆喰塗装', unit: '㎡', unitPrice: 5000 },
          { id: 'wall-6', name: '天井クロス張替', unit: '㎡', unitPrice: 1400 },
          { id: 'wall-7', name: 'アクセントクロス', unit: '㎡', unitPrice: 2000 },
          { id: 'wall-8', name: '壁紙剥がし', unit: '㎡', unitPrice: 300 },
        ],
      },
      {
        id: 'flooring',
        name: '床工事',
        products: [
          { id: 'floor-1', name: 'フローリング張替（複合）', unit: '㎡', unitPrice: 8000 },
          { id: 'floor-2', name: 'フローリング張替（無垢）', unit: '㎡', unitPrice: 15000 },
          { id: 'floor-3', name: 'フローリング重ね張り', unit: '㎡', unitPrice: 6000 },
          { id: 'floor-4', name: 'フロアタイル施工', unit: '㎡', unitPrice: 5000 },
          { id: 'floor-5', name: 'クッションフロア張替', unit: '㎡', unitPrice: 3500 },
          { id: 'floor-6', name: '畳表替え', unit: '枚', unitPrice: 8000 },
          { id: 'floor-7', name: '畳新調', unit: '枚', unitPrice: 15000 },
          { id: 'floor-8', name: '畳からフローリングへ', unit: '㎡', unitPrice: 12000 },
          { id: 'floor-9', name: 'カーペット張替', unit: '㎡', unitPrice: 4000 },
          { id: 'floor-10', name: '床下地補修', unit: '㎡', unitPrice: 5000 },
        ],
      },
      {
        id: 'door-storage',
        name: '建具・収納',
        products: [
          { id: 'door-1', name: '室内ドア交換', unit: '枚', unitPrice: 60000 },
          { id: 'door-2', name: '引き戸交換', unit: '枚', unitPrice: 70000 },
          { id: 'door-3', name: '襖張替', unit: '枚', unitPrice: 5000 },
          { id: 'door-4', name: '障子張替', unit: '枚', unitPrice: 3000 },
          { id: 'door-5', name: 'ドアノブ交換', unit: '箇所', unitPrice: 8000 },
          { id: 'door-6', name: 'クローゼット扉交換', unit: '枚', unitPrice: 45000 },
          { id: 'door-7', name: '棚板追加', unit: '枚', unitPrice: 5000 },
          { id: 'door-8', name: 'クローゼット内装', unit: '式', unitPrice: 80000 },
        ],
      },
      {
        id: 'partition',
        name: '間取り変更',
        products: [
          { id: 'part-1', name: '間仕切り壁新設', unit: '㎡', unitPrice: 25000 },
          { id: 'part-2', name: '間仕切り壁撤去', unit: '㎡', unitPrice: 15000 },
          { id: 'part-3', name: '開口部新設', unit: '箇所', unitPrice: 80000 },
          { id: 'part-4', name: 'アコーディオンカーテン設置', unit: '式', unitPrice: 50000 },
        ],
      },
    ],
  },
  {
    id: 'water',
    name: '水回り工事',
    icon: 'water',
    subCategories: [
      {
        id: 'toilet-work',
        name: 'トイレ',
        products: [
          { id: 'toilet-1', name: 'トイレ交換（普通便座）', unit: '台', unitPrice: 80000 },
          { id: 'toilet-2', name: 'トイレ交換（温水洗浄便座）', unit: '台', unitPrice: 120000 },
          { id: 'toilet-3', name: 'トイレ交換（タンクレス）', unit: '台', unitPrice: 250000 },
          { id: 'toilet-4', name: '温水洗浄便座のみ交換', unit: '台', unitPrice: 50000 },
          { id: 'toilet-5', name: 'トイレ内装セット', unit: '式', unitPrice: 80000 },
          { id: 'toilet-6', name: '手洗い器設置', unit: '台', unitPrice: 60000 },
          { id: 'toilet-7', name: 'トイレ収納設置', unit: '式', unitPrice: 40000 },
        ],
      },
      {
        id: 'bathroom',
        name: '浴室',
        products: [
          { id: 'bath-1', name: 'ユニットバス交換（1216）', unit: '式', unitPrice: 700000 },
          { id: 'bath-2', name: 'ユニットバス交換（1616）', unit: '式', unitPrice: 900000 },
          { id: 'bath-3', name: 'ユニットバス交換（1620）', unit: '式', unitPrice: 1100000 },
          { id: 'bath-4', name: '浴室乾燥機設置', unit: '台', unitPrice: 150000 },
          { id: 'bath-5', name: 'シャワーヘッド交換', unit: '台', unitPrice: 15000 },
          { id: 'bath-6', name: '浴室水栓交換', unit: '台', unitPrice: 35000 },
          { id: 'bath-7', name: '浴室ドア交換', unit: '枚', unitPrice: 80000 },
          { id: 'bath-8', name: '浴室塗装', unit: '式', unitPrice: 150000 },
          { id: 'bath-9', name: '浴室パネル貼り', unit: '式', unitPrice: 200000 },
        ],
      },
      {
        id: 'washroom',
        name: '洗面',
        products: [
          { id: 'wash-1', name: '洗面台交換（60cm）', unit: '台', unitPrice: 100000 },
          { id: 'wash-2', name: '洗面台交換（75cm）', unit: '台', unitPrice: 130000 },
          { id: 'wash-3', name: '洗面台交換（90cm）', unit: '台', unitPrice: 180000 },
          { id: 'wash-4', name: '洗面水栓交換', unit: '台', unitPrice: 25000 },
          { id: 'wash-5', name: '洗面台鏡交換', unit: '枚', unitPrice: 30000 },
          { id: 'wash-6', name: '洗濯パン交換', unit: '台', unitPrice: 25000 },
          { id: 'wash-7', name: '洗濯水栓交換', unit: '台', unitPrice: 15000 },
        ],
      },
      {
        id: 'kitchen-work',
        name: 'キッチン',
        products: [
          { id: 'kit-1', name: 'システムキッチン交換（I型2100）', unit: '式', unitPrice: 600000 },
          { id: 'kit-2', name: 'システムキッチン交換（I型2550）', unit: '式', unitPrice: 800000 },
          { id: 'kit-3', name: 'システムキッチン交換（L型）', unit: '式', unitPrice: 1200000 },
          { id: 'kit-4', name: 'キッチン水栓交換', unit: '台', unitPrice: 35000 },
          { id: 'kit-5', name: 'レンジフード交換', unit: '台', unitPrice: 80000 },
          { id: 'kit-6', name: 'ビルトインコンロ交換（ガス）', unit: '台', unitPrice: 100000 },
          { id: 'kit-7', name: 'ビルトインコンロ交換（IH）', unit: '台', unitPrice: 150000 },
          { id: 'kit-8', name: '食洗機設置', unit: '台', unitPrice: 150000 },
          { id: 'kit-9', name: 'キッチンパネル貼り', unit: '㎡', unitPrice: 8000 },
        ],
      },
      {
        id: 'boiler-work',
        name: '給湯器・給排水',
        products: [
          { id: 'boil-1', name: 'ガス給湯器交換（16号）', unit: '台', unitPrice: 130000 },
          { id: 'boil-2', name: 'ガス給湯器交換（20号）', unit: '台', unitPrice: 160000 },
          { id: 'boil-3', name: 'ガス給湯器交換（24号）', unit: '台', unitPrice: 190000 },
          { id: 'boil-4', name: 'エコキュート設置', unit: '台', unitPrice: 450000 },
          { id: 'boil-5', name: '電気温水器交換', unit: '台', unitPrice: 250000 },
          { id: 'boil-6', name: '排水管高圧洗浄', unit: '式', unitPrice: 30000 },
          { id: 'boil-7', name: '給水管引き直し', unit: '式', unitPrice: 150000 },
        ],
      },
    ],
  },
  {
    id: 'exterior',
    name: '外構工事',
    icon: 'exterior',
    subCategories: [
      {
        id: 'fence-wall',
        name: 'フェンス・塀',
        products: [
          { id: 'fence-1', name: 'アルミフェンス設置', unit: 'm', unitPrice: 15000 },
          { id: 'fence-2', name: '目隠しフェンス設置', unit: 'm', unitPrice: 25000 },
          { id: 'fence-3', name: 'メッシュフェンス設置', unit: 'm', unitPrice: 10000 },
          { id: 'fence-4', name: 'ブロック塀（化粧）', unit: 'm', unitPrice: 20000 },
          { id: 'fence-5', name: 'ブロック塀（CB）', unit: 'm', unitPrice: 12000 },
          { id: 'fence-6', name: '既存塀解体撤去', unit: 'm', unitPrice: 8000 },
          { id: 'fence-7', name: 'ブロック塀補修', unit: '式', unitPrice: 50000 },
        ],
      },
      {
        id: 'parking',
        name: '駐車場・カーポート',
        products: [
          { id: 'car-1', name: 'カーポート設置（1台用）', unit: '台', unitPrice: 250000 },
          { id: 'car-2', name: 'カーポート設置（2台用）', unit: '台', unitPrice: 450000 },
          { id: 'car-3', name: 'カーポート撤去', unit: '式', unitPrice: 50000 },
          { id: 'car-4', name: '土間コンクリート', unit: '㎡', unitPrice: 12000 },
          { id: 'car-5', name: 'アスファルト舗装', unit: '㎡', unitPrice: 5000 },
          { id: 'car-6', name: '砂利敷き', unit: '㎡', unitPrice: 3000 },
          { id: 'car-7', name: 'カーゲート設置', unit: '式', unitPrice: 200000 },
          { id: 'car-8', name: 'サイクルポート設置', unit: '台', unitPrice: 80000 },
        ],
      },
      {
        id: 'gate-approach',
        name: '門・アプローチ',
        products: [
          { id: 'gate-1', name: '門扉設置', unit: '式', unitPrice: 150000 },
          { id: 'gate-2', name: '機能門柱設置', unit: '台', unitPrice: 100000 },
          { id: 'gate-3', name: 'ポスト設置', unit: '台', unitPrice: 30000 },
          { id: 'gate-4', name: '表札設置', unit: '式', unitPrice: 20000 },
          { id: 'gate-5', name: 'アプローチタイル', unit: '㎡', unitPrice: 15000 },
          { id: 'gate-6', name: 'インターロッキング', unit: '㎡', unitPrice: 10000 },
          { id: 'gate-7', name: '玄関ポーチタイル', unit: '㎡', unitPrice: 12000 },
        ],
      },
      {
        id: 'garden',
        name: '庭・植栽',
        products: [
          { id: 'gard-1', name: '人工芝設置', unit: '㎡', unitPrice: 8000 },
          { id: 'gard-2', name: '天然芝張り', unit: '㎡', unitPrice: 3000 },
          { id: 'gard-3', name: 'ウッドデッキ設置', unit: '㎡', unitPrice: 45000 },
          { id: 'gard-4', name: 'タイルデッキ設置', unit: '㎡', unitPrice: 35000 },
          { id: 'gard-5', name: 'テラス屋根設置', unit: '式', unitPrice: 200000 },
          { id: 'gard-6', name: '植栽撤去', unit: '式', unitPrice: 30000 },
          { id: 'gard-7', name: '植栽（低木）', unit: '本', unitPrice: 5000 },
          { id: 'gard-8', name: '植栽（中木）', unit: '本', unitPrice: 15000 },
          { id: 'gard-9', name: '防草シート', unit: '㎡', unitPrice: 2000 },
        ],
      },
    ],
  },
  {
    id: 'other',
    name: 'その他',
    icon: 'other',
    subCategories: [
      {
        id: 'expenses',
        name: '諸経費',
        products: [
          { id: 'misc-1', name: '諸経費', unit: '式', unitPrice: 30000 },
          { id: 'misc-2', name: '現場管理費', unit: '式', unitPrice: 50000 },
          { id: 'misc-3', name: '運搬費', unit: '式', unitPrice: 15000 },
          { id: 'misc-4', name: '廃材処分費', unit: '式', unitPrice: 25000 },
          { id: 'misc-5', name: '出張費', unit: '式', unitPrice: 5000 },
          { id: 'misc-6', name: '養生費', unit: '式', unitPrice: 10000 },
          { id: 'misc-7', name: '駐車場代', unit: '日', unitPrice: 2000 },
        ],
      },
      {
        id: 'inspection',
        name: '調査・点検',
        products: [
          { id: 'insp-1', name: '現地調査', unit: '式', unitPrice: 0, description: '無料' },
          { id: 'insp-2', name: '建物診断', unit: '式', unitPrice: 30000 },
          { id: 'insp-3', name: '雨漏り調査', unit: '式', unitPrice: 20000 },
          { id: 'insp-4', name: '耐震診断', unit: '式', unitPrice: 50000 },
        ],
      },
      {
        id: 'warranty',
        name: '保証・アフター',
        products: [
          { id: 'war-1', name: '延長保証（3年）', unit: '式', unitPrice: 30000 },
          { id: 'war-2', name: '延長保証（5年）', unit: '式', unitPrice: 50000 },
          { id: 'war-3', name: '定期点検サービス', unit: '年', unitPrice: 10000 },
        ],
      },
    ],
  },
];
