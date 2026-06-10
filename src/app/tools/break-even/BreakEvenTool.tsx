"use client";

import { useState } from "react";

function num(v: string): number {
  const n = Number(v.replace(/[,，]/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function fmtYen(n: number): string {
  return `¥${Math.round(n).toLocaleString()}`;
}

export default function BreakEvenTool() {
  const [fixedCost, setFixedCost] = useState("");
  const [variableRate, setVariableRate] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [targetProfit, setTargetProfit] = useState("");

  const fc = num(fixedCost);
  const vr = Math.min(99, num(variableRate)) / 100;
  const up = num(unitPrice);
  const tp = num(targetProfit);

  const ready = fc > 0 && vr < 1;
  const bep = ready ? fc / (1 - vr) : 0;
  const bepWithProfit = ready ? (fc + tp) / (1 - vr) : 0;

  // SVGグラフ(純SVG・ライブラリなし)
  const W = 400;
  const H = 240;
  const PAD = 36;
  const maxX = bep * 2 || 1; // 横軸=売上高(BEPの2倍まで)
  const maxY = maxX; // 縦軸=金額
  const sx = (v: number) => PAD + (v / maxX) * (W - PAD - 12);
  const sy = (v: number) => H - PAD - (v / maxY) * (H - PAD - 12);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-ink">
            毎月の固定費(家賃・人件費・通信費など)
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              inputMode="numeric"
              value={fixedCost}
              onChange={(e) => setFixedCost(e.target.value)}
              placeholder="200,000"
              className="w-full rounded-lg border border-line bg-card p-3 text-right text-ink placeholder:text-ink-mute/50 focus:border-teal focus:outline-none"
            />
            <span className="shrink-0 text-sm text-ink-soft">円</span>
          </div>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">
            変動費率(売上に対する仕入れ・材料費などの割合)
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              inputMode="numeric"
              value={variableRate}
              onChange={(e) => setVariableRate(e.target.value)}
              placeholder="30"
              className="w-full rounded-lg border border-line bg-card p-3 text-right text-ink placeholder:text-ink-mute/50 focus:border-teal focus:outline-none"
            />
            <span className="shrink-0 text-sm text-ink-soft">%</span>
          </div>
          <p className="mt-1 text-xs text-ink-mute">
            例: 1,000円の商品の材料費が300円なら30%。サービス業なら0〜20%程度のことが多いです
          </p>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-ink">客単価(任意)</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                inputMode="numeric"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="5,000"
                className="w-full rounded-lg border border-line bg-card p-3 text-right text-ink placeholder:text-ink-mute/50 focus:border-teal focus:outline-none"
              />
              <span className="shrink-0 text-sm text-ink-soft">円</span>
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">
              目標利益(任意)
            </span>
            <div className="mt-2 flex items-center gap-2">
              <input
                inputMode="numeric"
                value={targetProfit}
                onChange={(e) => setTargetProfit(e.target.value)}
                placeholder="100,000"
                className="w-full rounded-lg border border-line bg-card p-3 text-right text-ink placeholder:text-ink-mute/50 focus:border-teal focus:outline-none"
              />
              <span className="shrink-0 text-sm text-ink-soft">円</span>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {ready ? (
          <>
            <div className="rounded-2xl bg-teal p-6 text-center">
              <p className="text-xs font-bold tracking-widest text-teal-soft">
                損益分岐点(月)
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-white">
                {fmtYen(bep)}
              </p>
              <p className="mt-2 text-xs text-teal-soft">
                月にこれだけ売上があれば赤字になりません
                {up > 0 && (
                  <>
                    <br />
                    客単価{fmtYen(up)}なら月
                    <span className="font-bold text-sun">
                      {Math.ceil(bep / up).toLocaleString()}件
                    </span>
                    (1日あたり約{Math.ceil(bep / up / 25)}件)
                  </>
                )}
              </p>
            </div>

            {tp > 0 && (
              <div className="rounded-2xl border border-sun bg-card p-5 text-center">
                <p className="text-xs font-bold text-sun-ink">
                  利益{fmtYen(tp)}を出すために必要な売上(月)
                </p>
                <p className="mt-1 font-serif text-2xl font-bold text-ink">
                  {fmtYen(bepWithProfit)}
                </p>
                {up > 0 && (
                  <p className="mt-1 text-xs text-ink-soft">
                    月{Math.ceil(bepWithProfit / up).toLocaleString()}件
                  </p>
                )}
              </div>
            )}

            <svg
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label="損益分岐点グラフ"
              className="w-full rounded-2xl border border-line bg-white"
            >
              {/* 軸 */}
              <line x1={PAD} y1={H - PAD} x2={W - 8} y2={H - PAD} stroke="#C8CFD3" />
              <line x1={PAD} y1={H - PAD} x2={PAD} y2={8} stroke="#C8CFD3" />
              {/* 費用線(固定費+変動費) */}
              <line
                x1={sx(0)}
                y1={sy(fc)}
                x2={sx(maxX)}
                y2={sy(fc + maxX * vr)}
                stroke="#FCCF27"
                strokeWidth="3"
              />
              {/* 売上線 */}
              <line
                x1={sx(0)}
                y1={sy(0)}
                x2={sx(maxX)}
                y2={sy(maxX)}
                stroke="#005B7B"
                strokeWidth="3"
              />
              {/* 分岐点 */}
              <line
                x1={sx(bep)}
                y1={sy(bep)}
                x2={sx(bep)}
                y2={H - PAD}
                stroke="#0D2733"
                strokeDasharray="4 4"
              />
              <circle cx={sx(bep)} cy={sy(bep)} r="6" fill="#0D2733" />
              <text x={sx(bep)} y={H - PAD + 16} textAnchor="middle" fontSize="11" fill="#0D2733">
                分岐点
              </text>
              <text x={sx(maxX * 0.72)} y={sy(maxX * 0.72) - 10} fontSize="11" fill="#005B7B">
                売上
              </text>
              <text
                x={sx(maxX * 0.72)}
                y={sy(fc + maxX * 0.72 * vr) + 18}
                fontSize="11"
                fill="#7A5A00"
              >
                費用
              </text>
              {/* 黒字領域の説明 */}
              <text x={sx(maxX * 0.78)} y={sy(maxX * 0.95)} fontSize="11" fill="#3C5463">
                ここから黒字
              </text>
            </svg>
            <p className="text-xs text-ink-mute">
              ※簡易計算です。借入返済・税金などは含みません。事業計画に使う際は専門家にもご相談ください。
            </p>
          </>
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-line bg-card p-8 text-center text-sm text-ink-mute">
            左の「固定費」と「変動費率」を入れると、
            <br />
            ここに結果とグラフが出ます
          </div>
        )}
      </div>
    </div>
  );
}
