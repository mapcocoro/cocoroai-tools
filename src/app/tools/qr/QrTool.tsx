"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const COLORS = [
  { label: "黒", value: "#0D2733" },
  { label: "ティール", value: "#005B7B" },
  { label: "ネイビー", value: "#1e3a5f" },
  { label: "ブラウン", value: "#5c4033" },
] as const;

/** QRキャンバスの中央にロゴを白縁付きで描く */
function drawLogo(
  canvas: HTMLCanvasElement,
  logo: HTMLImageElement,
  size: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const logoSize = size * 0.22;
  const pad = logoSize * 0.12;
  const x = (size - logoSize) / 2;
  // 白の角丸下地(コントラスト確保)
  const bx = x - pad;
  const bs = logoSize + pad * 2;
  const r = bs * 0.18;
  ctx.beginPath();
  ctx.roundRect(bx, bx, bs, bs, r);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  // ロゴ(縦横比維持で中央に収める)
  const ratio = logo.width / logo.height;
  let w = logoSize;
  let h = logoSize;
  if (ratio > 1) h = logoSize / ratio;
  else w = logoSize * ratio;
  ctx.drawImage(logo, (size - w) / 2, (size - h) / 2, w, h);
}

export default function QrTool() {
  const [text, setText] = useState("");
  const [color, setColor] = useState<string>(COLORS[0].value);
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const value = text.trim();
  // ロゴあり時は誤り訂正を最高(H=30%復元)に
  const ecLevel = logo ? "H" : "M";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!value) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    QRCode.toCanvas(canvas, value, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: ecLevel,
      color: { dark: color, light: "#FFFFFF" },
    })
      .then(() => {
        if (logo) drawLogo(canvas, logo, 280);
        setError("");
      })
      .catch(() => setError("文字数が多すぎます。短くしてみてください。"));
  }, [value, color, logo, ecLevel]);

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setLogo(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadPng = useCallback(async () => {
    if (!value) return;
    const SIZE = 1024;
    const off = document.createElement("canvas");
    await QRCode.toCanvas(off, value, {
      width: SIZE,
      margin: 2,
      errorCorrectionLevel: ecLevel,
      color: { dark: color, light: "#FFFFFF" },
    });
    if (logo) drawLogo(off, logo, SIZE);
    const a = document.createElement("a");
    a.href = off.toDataURL("image/png");
    a.download = "qrcode.png";
    a.click();
  }, [value, color, logo, ecLevel]);

  const downloadSvg = useCallback(async () => {
    if (!value) return;
    let svg = await QRCode.toString(value, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: ecLevel,
      color: { dark: color, light: "#FFFFFF" },
    });
    if (logo) {
      // viewBox単位系でロゴを中央配置
      const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      const vb = m ? Number(m[1]) : 0;
      if (vb > 0) {
        const logoSize = vb * 0.22;
        const pad = logoSize * 0.12;
        const bx = (vb - logoSize) / 2 - pad;
        const bs = logoSize + pad * 2;
        const ratio = logo.width / logo.height;
        let w = logoSize;
        let h = logoSize;
        if (ratio > 1) h = logoSize / ratio;
        else w = logoSize * ratio;
        const overlay =
          `<rect x="${bx}" y="${bx}" width="${bs}" height="${bs}" rx="${bs * 0.18}" fill="#FFFFFF"/>` +
          `<image href="${logo.src}" x="${(vb - w) / 2}" y="${(vb - h) / 2}" width="${w}" height="${h}"/>`;
        svg = svg.replace("</svg>", `${overlay}</svg>`);
      }
    }
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [value, color, logo, ecLevel]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-5">
        <label className="block">
          <span className="text-sm font-bold text-ink">
            QRコードにしたいURL・文字
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="https://example.com&#10;(お店のHP、Instagram、Googleマップの共有リンクなど)"
            className="mt-2 w-full rounded-lg border border-line bg-card p-3 text-ink placeholder:text-ink-mute/50 focus:border-teal focus:outline-none"
          />
        </label>

        <div>
          <span className="text-sm font-bold text-ink">色</span>
          <div className="mt-2 flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                aria-label={c.label}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  color === c.value
                    ? "border-sun scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-mute">
            ※薄い色は読み取りにくくなるため、濃色のみご用意しています
          </p>
        </div>

        <div>
          <span className="text-sm font-bold text-ink">
            真ん中にロゴ・画像を入れる(任意)
          </span>
          <div className="mt-2 flex items-center gap-3">
            <label className="cursor-pointer rounded-full border border-line bg-card px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-teal hover:text-teal">
              画像を選ぶ
              <input
                type="file"
                accept="image/*"
                onChange={onLogoChange}
                className="hidden"
              />
            </label>
            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="text-xs text-ink-mute underline underline-offset-4 hover:text-ink"
              >
                ロゴを外す
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-ink-mute">
            ロゴを入れると自動で「読み取りに強いQR」に切り替わります。
            保存後は必ず一度読み取りテストをしてください。
          </p>
        </div>

        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl border border-line bg-white p-2">
          {value ? (
            <canvas ref={canvasRef} className="max-h-full max-w-full" />
          ) : (
            <p className="px-6 text-center text-xs text-ink-mute">
              左にURLを入れると、ここにQRコードが表示されます
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={downloadPng}
            disabled={!value || !!error}
            className="rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-deep disabled:opacity-40"
          >
            PNG保存
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            disabled={!value || !!error}
            className="rounded-full border border-teal px-6 py-3 text-sm font-bold text-teal transition hover:bg-teal hover:text-white disabled:opacity-40"
          >
            SVG保存(印刷用)
          </button>
        </div>
        <p className="text-xs text-ink-mute">
          スマホは画像を長押しでも保存できます
        </p>
      </div>
    </div>
  );
}
