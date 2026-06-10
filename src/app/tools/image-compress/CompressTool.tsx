"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Item {
  id: string;
  file: File;
  name: string;
  origSize: number;
  outSize: number;
  url: string;
  outName: string;
  status: "processing" | "done" | "error";
}

const MAX_WIDTHS = [
  { label: "1200px(SNS向け)", value: 1200 },
  { label: "1600px(HP向け・おすすめ)", value: 1600 },
  { label: "2000px(大きめ)", value: 2000 },
] as const;

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function compress(
  file: File,
  maxWidth: number,
  quality: number
): Promise<{ blob: Blob; outName: string }> {
  const img = await loadImage(file);
  const scale = Math.min(1, maxWidth / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  const base = file.name.replace(/\.[^.]+$/, "");
  // WebP優先、未対応ブラウザ(旧iOS等)はJPEGへ自動フォールバック
  const webp = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/webp", quality)
  );
  if (webp && webp.type === "image/webp") {
    return { blob: webp, outName: `${base}.webp` };
  }
  const jpeg = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", quality)
  );
  if (!jpeg) throw new Error("toBlob");
  return { blob: jpeg, outName: `${base}-min.jpg` };
}

export default function CompressTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [maxWidth, setMaxWidth] = useState<number>(1600);
  const [quality, setQuality] = useState(0.78);
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  const process = useCallback(
    async (files: File[]) => {
      const existing = new Set(
        itemsRef.current.map((i) => `${i.name}-${i.origSize}`)
      );
      const images = files.filter((f) => f.type.startsWith("image/"));
      const fresh = images.filter((f) => !existing.has(`${f.name}-${f.size}`));
      const skipped = images.length - fresh.length;
      if (skipped > 0) {
        setNotice(
          `${skipped}枚は取り込み済みだったのでスキップしました(下に結果があります)`
        );
      } else if (fresh.length > 0) {
        setNotice("");
      }
      const newItems: Item[] = fresh
        .map((f) => ({
          id: `${f.name}-${f.size}-${Math.floor(performance.now() * 1000)}`,
          file: f,
          name: f.name,
          origSize: f.size,
          outSize: 0,
          url: "",
          outName: "",
          status: "processing" as const,
        }));
      if (!newItems.length) return;
      setItems((prev) => [...prev, ...newItems]);
      // 取り込まれたことが分かるように結果一覧へスクロール
      setTimeout(() => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      for (const item of newItems) {
        try {
          const { blob, outName } = await compress(item.file, maxWidth, quality);
          const url = URL.createObjectURL(blob);
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id
                ? { ...p, outSize: blob.size, url, outName, status: "done" }
                : p
            )
          );
        } catch {
          setItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, status: "error" } : p))
          );
        }
      }
    },
    [maxWidth, quality]
  );

  // 設定変更時は処理済みファイルを同じ元データで再圧縮
  const settingsRef = useRef({ maxWidth, quality });
  useEffect(() => {
    const prev = settingsRef.current;
    if (prev.maxWidth === maxWidth && prev.quality === quality) return;
    settingsRef.current = { maxWidth, quality };
    setItems((current) => {
      const files = current.map((i) => i.file);
      if (files.length) {
        current.forEach((i) => i.url && URL.revokeObjectURL(i.url));
        setTimeout(() => {
          setItems([]);
          process(files);
        }, 0);
      }
      return current;
    });
  }, [maxWidth, quality, process]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    process(Array.from(e.dataTransfer.files));
  };

  const downloadAll = () => {
    items
      .filter((i) => i.status === "done")
      .forEach((i, idx) => {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = i.url;
          a.download = i.outName;
          a.click();
        }, idx * 400);
      });
  };

  const doneItems = items.filter((i) => i.status === "done");
  const totalBefore = doneItems.reduce((s, i) => s + i.origSize, 0);
  const totalAfter = doneItems.reduce((s, i) => s + i.outSize, 0);

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver ? "border-teal bg-teal-softer" : "border-line bg-card"
        }`}
      >
        <p className="text-3xl" aria-hidden>
          🖼️
        </p>
        <p className="mt-2 text-sm font-bold text-ink">
          {items.length > 0
            ? `✅ ${items.length}枚 取り込み済み(タップでさらに追加)`
            : "ここに写真をドラッグ、またはタップして選択"}
        </p>
        <p className="mt-1 text-xs text-ink-mute">
          複数枚OK。写真は端末の外に送信されません
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            process(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {notice && (
        <p className="rounded-xl bg-sun/20 px-4 py-3 text-sm font-bold text-sun-ink">
          {notice}
        </p>
      )}

      <div className="grid gap-4 rounded-2xl border border-line bg-card p-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-ink">最大の横幅</span>
          <select
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-line bg-paper p-3 text-ink focus:border-teal focus:outline-none"
          >
            {MAX_WIDTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-bold text-ink">
            画質: {Math.round(quality * 100)}
          </span>
          <input
            type="range"
            min={50}
            max={95}
            value={Math.round(quality * 100)}
            onChange={(e) => setQuality(Number(e.target.value) / 100)}
            className="mt-4 w-full accent-teal"
          />
          <span className="text-xs text-ink-mute">
            78前後がHP用のおすすめです
          </span>
        </label>
      </div>

      {items.length > 0 && (
        <div ref={listRef} className="scroll-mt-4 space-y-3">
          {doneItems.length > 0 && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-teal-softer p-4">
              <p className="text-sm font-bold text-ink">
                合計 {fmtSize(totalBefore)} → {fmtSize(totalAfter)}
                <span className="ml-2 text-teal">
                  ({Math.round((1 - totalAfter / totalBefore) * 100)}%削減)
                </span>
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {doneItems.length > 1 && (
                  <button
                    type="button"
                    onClick={downloadAll}
                    className="rounded-full bg-teal px-5 py-2 text-xs font-bold text-white transition hover:bg-teal-deep"
                  >
                    まとめて保存
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
                    setItems([]);
                    setNotice("");
                  }}
                  className="rounded-full border border-line px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-teal hover:text-teal"
                >
                  全部クリア
                </button>
              </div>
            </div>
          )}
          <ul className="space-y-2">
            {items.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{i.name}</p>
                  {i.status === "done" ? (
                    <p className="text-xs text-ink-soft">
                      {fmtSize(i.origSize)} → {fmtSize(i.outSize)}
                      <span className="ml-1 font-bold text-teal">
                        (-{Math.round((1 - i.outSize / i.origSize) * 100)}%)
                      </span>
                    </p>
                  ) : i.status === "error" ? (
                    <p className="text-xs font-bold text-red-600">
                      この画像は処理できませんでした
                    </p>
                  ) : (
                    <p className="text-xs text-ink-mute">圧縮中...</p>
                  )}
                </div>
                {i.status === "done" && (
                  <a
                    href={i.url}
                    download={i.outName}
                    className="shrink-0 rounded-full border border-teal px-4 py-2 text-xs font-bold text-teal transition hover:bg-teal hover:text-white"
                  >
                    保存
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
