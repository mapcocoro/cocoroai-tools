"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const COLORS = [
  { label: "黒", value: "#0D2733" },
  { label: "ティール", value: "#005B7B" },
  { label: "ネイビー", value: "#1e3a5f" },
  { label: "ブラウン", value: "#5c4033" },
] as const;

export default function QrTool() {
  const [text, setText] = useState("");
  const [color, setColor] = useState<string>(COLORS[0].value);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const value = text.trim();

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
      errorCorrectionLevel: "M",
      color: { dark: color, light: "#FFFFFF" },
    })
      .then(() => setError(""))
      .catch(() => setError("文字数が多すぎます。短くしてみてください。"));
  }, [value, color]);

  const downloadPng = useCallback(async () => {
    if (!value) return;
    const url = await QRCode.toDataURL(value, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: color, light: "#FFFFFF" },
    });
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }, [value, color]);

  const downloadSvg = useCallback(async () => {
    if (!value) return;
    const svg = await QRCode.toString(value, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: color, light: "#FFFFFF" },
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [value, color]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-4">
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
