// 多言語メニューメーカー: 内蔵辞書
// 外部APIを使わない(=無料・端末内完結)ための、よく使うメニュー語彙の対訳表。
// 方針: 「確実に正しい定番訳」だけを収録する。組み合わせ生成はしない(誤訳リスク)。
// 辞書にない言葉はユーザーが手入力(翻訳サイトへのリンクで補助)。

export interface DictEntry {
  ja: string;
  en: string;
  zh: string; // 簡体字
  ko: string;
}

/** 照合用の正規化: 前後空白除去・全角空白除去・カタカナはそのまま */
export function normalizeJa(s: string): string {
  return s.replace(/[\s　]/g, "").trim();
}

export const DICT: DictEntry[] = [
  // ---- 麺・ご飯もの ----
  { ja: "ラーメン", en: "Ramen", zh: "拉面", ko: "라멘" },
  { ja: "醤油ラーメン", en: "Soy Sauce Ramen", zh: "酱油拉面", ko: "간장 라멘" },
  { ja: "味噌ラーメン", en: "Miso Ramen", zh: "味噌拉面", ko: "미소 라멘" },
  { ja: "塩ラーメン", en: "Salt Ramen", zh: "盐味拉面", ko: "시오 라멘" },
  { ja: "とんこつラーメン", en: "Pork Bone Broth Ramen", zh: "豚骨拉面", ko: "돈코츠 라멘" },
  { ja: "つけ麺", en: "Tsukemen (Dipping Noodles)", zh: "蘸面", ko: "츠케멘" },
  { ja: "うどん", en: "Udon Noodles", zh: "乌冬面", ko: "우동" },
  { ja: "そば", en: "Soba (Buckwheat Noodles)", zh: "荞麦面", ko: "소바(메밀국수)" },
  { ja: "焼きそば", en: "Yakisoba (Fried Noodles)", zh: "日式炒面", ko: "야키소바" },
  { ja: "パスタ", en: "Pasta", zh: "意大利面", ko: "파스타" },
  { ja: "チャーハン", en: "Fried Rice", zh: "炒饭", ko: "볶음밥" },
  { ja: "カレーライス", en: "Japanese Curry with Rice", zh: "咖喱饭", ko: "카레라이스" },
  { ja: "カレー", en: "Curry", zh: "咖喱", ko: "카레" },
  { ja: "オムライス", en: "Omurice (Omelet Rice)", zh: "蛋包饭", ko: "오므라이스" },
  { ja: "牛丼", en: "Beef Rice Bowl", zh: "牛肉盖饭", ko: "규동(소고기덮밥)" },
  { ja: "親子丼", en: "Chicken & Egg Rice Bowl", zh: "鸡肉鸡蛋盖饭", ko: "오야코동" },
  { ja: "かつ丼", en: "Pork Cutlet Rice Bowl", zh: "炸猪排盖饭", ko: "가츠동" },
  { ja: "海鮮丼", en: "Seafood Rice Bowl", zh: "海鲜盖饭", ko: "해산물 덮밥" },
  { ja: "ご飯", en: "Rice", zh: "米饭", ko: "밥" },
  { ja: "ライス", en: "Rice", zh: "米饭", ko: "밥(라이스)" },
  { ja: "おにぎり", en: "Onigiri (Rice Ball)", zh: "饭团", ko: "주먹밥" },
  { ja: "定食", en: "Set Meal", zh: "套餐", ko: "정식" },

  // ---- 和食・居酒屋 ----
  { ja: "寿司", en: "Sushi", zh: "寿司", ko: "초밥" },
  { ja: "刺身", en: "Sashimi", zh: "生鱼片", ko: "회(사시미)" },
  { ja: "天ぷら", en: "Tempura", zh: "天妇罗", ko: "튀김(덴푸라)" },
  { ja: "とんかつ", en: "Tonkatsu (Breaded Pork Cutlet)", zh: "炸猪排", ko: "돈가스" },
  { ja: "唐揚げ", en: "Japanese Fried Chicken", zh: "日式炸鸡", ko: "가라아게(닭튀김)" },
  { ja: "焼き鳥", en: "Yakitori (Grilled Chicken Skewers)", zh: "烤鸡串", ko: "야키토리(닭꼬치)" },
  { ja: "餃子", en: "Gyoza (Pan-Fried Dumplings)", zh: "煎饺", ko: "교자(군만두)" },
  { ja: "枝豆", en: "Edamame", zh: "毛豆", ko: "에다마메(풋콩)" },
  { ja: "味噌汁", en: "Miso Soup", zh: "味噌汤", ko: "미소시루(된장국)" },
  { ja: "お好み焼き", en: "Okonomiyaki (Savory Pancake)", zh: "御好烧", ko: "오코노미야키" },
  { ja: "たこ焼き", en: "Takoyaki (Octopus Balls)", zh: "章鱼小丸子", ko: "타코야키" },
  { ja: "うなぎ", en: "Grilled Eel", zh: "鳗鱼", ko: "장어" },
  { ja: "焼き魚", en: "Grilled Fish", zh: "烤鱼", ko: "생선구이" },
  { ja: "すき焼き", en: "Sukiyaki", zh: "寿喜烧", ko: "스키야키" },
  { ja: "しゃぶしゃぶ", en: "Shabu-Shabu", zh: "日式涮锅", ko: "샤브샤브" },
  { ja: "鍋", en: "Hot Pot", zh: "火锅", ko: "나베(전골)" },
  { ja: "おでん", en: "Oden (Simmered Dishes)", zh: "关东煮", ko: "오뎅(어묵탕)" },
  { ja: "ステーキ", en: "Steak", zh: "牛排", ko: "스테이크" },
  { ja: "ハンバーグ", en: "Hamburg Steak", zh: "汉堡排", ko: "함박스테이크" },
  { ja: "ピザ", en: "Pizza", zh: "披萨", ko: "피자" },
  { ja: "サラダ", en: "Salad", zh: "沙拉", ko: "샐러드" },
  { ja: "スープ", en: "Soup", zh: "汤", ko: "수프" },
  { ja: "パン", en: "Bread", zh: "面包", ko: "빵" },
  { ja: "トースト", en: "Toast", zh: "吐司", ko: "토스트" },

  // ---- デザート・甘味 ----
  { ja: "デザート", en: "Dessert", zh: "甜点", ko: "디저트" },
  { ja: "ケーキ", en: "Cake", zh: "蛋糕", ko: "케이크" },
  { ja: "チーズケーキ", en: "Cheesecake", zh: "芝士蛋糕", ko: "치즈케이크" },
  { ja: "アイスクリーム", en: "Ice Cream", zh: "冰淇淋", ko: "아이스크림" },
  { ja: "プリン", en: "Custard Pudding", zh: "布丁", ko: "푸딩" },
  { ja: "パフェ", en: "Parfait", zh: "芭菲", ko: "파르페" },
  { ja: "パンケーキ", en: "Pancakes", zh: "松饼", ko: "팬케이크" },
  { ja: "抹茶", en: "Matcha (Green Tea)", zh: "抹茶", ko: "말차" },
  { ja: "だんご", en: "Dango (Rice Dumplings)", zh: "团子", ko: "당고" },
  { ja: "大福", en: "Daifuku (Mochi with Filling)", zh: "大福", ko: "다이후쿠(찹쌀떡)" },

  // ---- ドリンク ----
  { ja: "ドリンク", en: "Drinks", zh: "饮品", ko: "음료" },
  { ja: "コーヒー", en: "Coffee", zh: "咖啡", ko: "커피" },
  { ja: "アイスコーヒー", en: "Iced Coffee", zh: "冰咖啡", ko: "아이스커피" },
  { ja: "カフェラテ", en: "Cafe Latte", zh: "拿铁", ko: "카페라테" },
  { ja: "カプチーノ", en: "Cappuccino", zh: "卡布奇诺", ko: "카푸치노" },
  { ja: "エスプレッソ", en: "Espresso", zh: "浓缩咖啡", ko: "에스프레소" },
  { ja: "紅茶", en: "Black Tea", zh: "红茶", ko: "홍차" },
  { ja: "緑茶", en: "Green Tea", zh: "绿茶", ko: "녹차" },
  { ja: "ほうじ茶", en: "Roasted Green Tea", zh: "焙茶", ko: "호지차" },
  { ja: "ジュース", en: "Juice", zh: "果汁", ko: "주스" },
  { ja: "オレンジジュース", en: "Orange Juice", zh: "橙汁", ko: "오렌지주스" },
  { ja: "コーラ", en: "Cola", zh: "可乐", ko: "콜라" },
  { ja: "ウーロン茶", en: "Oolong Tea", zh: "乌龙茶", ko: "우롱차" },
  { ja: "水", en: "Water", zh: "水", ko: "물" },
  { ja: "ソフトドリンク", en: "Soft Drinks", zh: "软饮料", ko: "소프트드링크" },
  { ja: "ビール", en: "Beer", zh: "啤酒", ko: "맥주" },
  { ja: "生ビール", en: "Draft Beer", zh: "生啤酒", ko: "생맥주" },
  { ja: "日本酒", en: "Sake (Japanese Rice Wine)", zh: "日本清酒", ko: "사케(일본술)" },
  { ja: "焼酎", en: "Shochu (Japanese Spirits)", zh: "日式烧酒", ko: "쇼추(일본식 소주)" },
  { ja: "ワイン", en: "Wine", zh: "葡萄酒", ko: "와인" },
  { ja: "ハイボール", en: "Highball (Whisky & Soda)", zh: "威士忌苏打", ko: "하이볼" },
  { ja: "梅酒", en: "Plum Wine", zh: "梅酒", ko: "매실주" },
  { ja: "サワー", en: "Sour (Shochu Cocktail)", zh: "沙瓦(烧酒鸡尾酒)", ko: "사와" },
  { ja: "カクテル", en: "Cocktails", zh: "鸡尾酒", ko: "칵테일" },

  // ---- 見出し・区分 ----
  { ja: "フード", en: "Food", zh: "美食", ko: "푸드" },
  { ja: "おつまみ", en: "Snacks & Appetizers", zh: "下酒菜", ko: "안주" },
  { ja: "前菜", en: "Appetizers", zh: "前菜", ko: "전채" },
  { ja: "メイン", en: "Main Dishes", zh: "主菜", ko: "메인" },
  { ja: "サイドメニュー", en: "Side Menu", zh: "配菜", ko: "사이드메뉴" },
  { ja: "セットメニュー", en: "Set Menu", zh: "套餐", ko: "세트메뉴" },
  { ja: "単品", en: "A La Carte", zh: "单点", ko: "단품" },
  { ja: "お子様メニュー", en: "Kids' Menu", zh: "儿童餐", ko: "어린이 메뉴" },
  { ja: "テイクアウト", en: "Takeout", zh: "外带", ko: "테이크아웃" },
  { ja: "飲み放題", en: "All-You-Can-Drink", zh: "畅饮", ko: "음료 무제한" },
  { ja: "食べ放題", en: "All-You-Can-Eat", zh: "自助畅吃", ko: "무한리필" },
  { ja: "モーニング", en: "Breakfast Set", zh: "早餐套餐", ko: "모닝세트" },
  { ja: "ランチ", en: "Lunch", zh: "午餐", ko: "런치" },
  { ja: "ディナー", en: "Dinner", zh: "晚餐", ko: "디너" },

  // ---- 美容・サロン・リラク ----
  { ja: "カット", en: "Haircut", zh: "剪发", ko: "커트" },
  { ja: "カラー", en: "Hair Color", zh: "染发", ko: "염색" },
  { ja: "パーマ", en: "Perm", zh: "烫发", ko: "파마" },
  { ja: "トリートメント", en: "Hair Treatment", zh: "护发", ko: "트리트먼트" },
  { ja: "シャンプー", en: "Shampoo", zh: "洗发", ko: "샴푸" },
  { ja: "ヘッドスパ", en: "Head Spa", zh: "头部SPA", ko: "헤드스파" },
  { ja: "縮毛矯正", en: "Hair Straightening", zh: "头发拉直", ko: "매직 스트레이트" },
  { ja: "前髪カット", en: "Bang Trim", zh: "修剪刘海", ko: "앞머리 커트" },
  { ja: "ヘアセット", en: "Hair Styling", zh: "造型", ko: "헤어세트" },
  { ja: "ネイル", en: "Nail Care", zh: "美甲", ko: "네일" },
  { ja: "ジェルネイル", en: "Gel Nails", zh: "凝胶美甲", ko: "젤네일" },
  { ja: "まつ毛エクステ", en: "Eyelash Extensions", zh: "嫁接睫毛", ko: "속눈썹 연장" },
  { ja: "フェイシャル", en: "Facial Treatment", zh: "面部护理", ko: "페이셜" },
  { ja: "マッサージ", en: "Massage", zh: "按摩", ko: "마사지" },
  { ja: "もみほぐし", en: "Relaxation Massage", zh: "放松按摩", ko: "전신 마사지" },
  { ja: "足つぼ", en: "Foot Pressure Point Massage", zh: "足底按摩", ko: "발마사지" },
  { ja: "整体", en: "Body Alignment Therapy", zh: "整体(身体调理)", ko: "체형 교정" },
  { ja: "骨盤矯正", en: "Pelvic Adjustment", zh: "骨盆矫正", ko: "골반 교정" },

  // ---- 宿・入浴 ----
  { ja: "素泊まり", en: "Room Only (No Meals)", zh: "纯住宿(不含餐)", ko: "숙박만(식사 불포함)" },
  { ja: "朝食付き", en: "With Breakfast", zh: "含早餐", ko: "조식 포함" },
  { ja: "1泊2食付き", en: "1 Night with Dinner & Breakfast", zh: "一晚含早晚餐", ko: "1박 2식(석식·조식)" },
  { ja: "大人", en: "Adult", zh: "成人", ko: "성인" },
  { ja: "子ども", en: "Child", zh: "儿童", ko: "어린이" },
  { ja: "入浴", en: "Bath", zh: "入浴", ko: "입욕" },
  { ja: "貸切風呂", en: "Private Bath", zh: "包场浴池", ko: "프라이빗 욕탕" },
  { ja: "タオル", en: "Towel", zh: "毛巾", ko: "수건" },

  // ---- よく使う言葉 ----
  { ja: "おすすめ", en: "Recommended", zh: "推荐", ko: "추천" },
  { ja: "人気", en: "Popular", zh: "人气", ko: "인기" },
  { ja: "期間限定", en: "Limited Time Only", zh: "期间限定", ko: "기간 한정" },
  { ja: "季節限定", en: "Seasonal", zh: "季节限定", ko: "계절 한정" },
  { ja: "新メニュー", en: "New", zh: "新品", ko: "신메뉴" },
  { ja: "時価", en: "Market Price", zh: "时价", ko: "시가" },
  { ja: "応相談", en: "Please Ask", zh: "面议", ko: "문의 바람" },
  { ja: "追加", en: "Extra", zh: "加点", ko: "추가" },
  { ja: "トッピング", en: "Toppings", zh: "配料", ko: "토핑" },
  { ja: "大盛り", en: "Large Size", zh: "大份", ko: "곱빼기" },
  { ja: "並盛り", en: "Regular Size", zh: "普通份", ko: "보통" },
];

// 正規化済みインデックス(初回アクセス時に構築)
let index: Map<string, DictEntry> | null = null;
export function lookupJa(ja: string): DictEntry | null {
  if (!index) {
    index = new Map();
    for (const e of DICT) index.set(normalizeJa(e.ja), e);
  }
  const key = normalizeJa(ja);
  if (!key) return null;
  return index.get(key) ?? null;
}

// ---- 固定UI文言(プロ翻訳済み・プレビュー用) ----
export const FIXED = {
  menuTitle: { en: "MENU", zh: "菜单", ko: "메뉴" },
  priceListTitle: { en: "PRICE LIST", zh: "价目表", ko: "가격표" },
  taxIncluded: {
    ja: "表示価格は税込です",
    en: "All prices include tax.",
    zh: "所示价格均含税。",
    ko: "표시 가격은 세금 포함입니다.",
  },
  jpy: {
    ja: "価格は日本円です",
    en: "Prices are in Japanese yen (JPY).",
    zh: "价格为日元(JPY)。",
    ko: "가격은 일본 엔(JPY)입니다.",
  },
  badges: {
    reco: { ja: "おすすめ", en: "Recommended", zh: "推荐", ko: "추천" },
    spicy: { ja: "辛い", en: "Spicy", zh: "辣", ko: "매움" },
    veg: { ja: "ベジタリアン対応", en: "Vegetarian", zh: "素食", ko: "채식" },
  },
} as const;
