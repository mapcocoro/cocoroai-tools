"use client";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right"; // いまは top/bottom のみ対応でOK
};

type Coords = {
  top: number;
  left: number;
  placement: "top" | "bottom";
  arrowX: number;
};

export default function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);

  const PADDING = 12; // 画面端の余白
  const GAP = 8; // トリガとツールチップの隙間

  const position = () => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    // いったん可視化してサイズを測る
    tip.style.visibility = "hidden";
    tip.style.opacity = "0";
    tip.style.display = "block";

    const tRect = trigger.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();

    // 基本は中央揃え
    let left = tRect.left + tRect.width / 2 - tipRect.width / 2;
    // 左右クランプ
    left = Math.max(PADDING, Math.min(left, window.innerWidth - tipRect.width - PADDING));

    // 上に出す or 下に反転
    let placement: "top" | "bottom" = side === "bottom" ? "bottom" : "top";
    let top =
      placement === "top" ? tRect.top - tipRect.height - GAP : tRect.bottom + GAP;

    if (placement === "top" && top < PADDING) {
      placement = "bottom";
      top = tRect.bottom + GAP;
    } else if (
      placement === "bottom" &&
      top + tipRect.height > window.innerHeight - PADDING
    ) {
      placement = "top";
      top = tRect.top - tipRect.height - GAP;
    }

    // 矢印X位置（ツールチップ内の左からの距離）
    let arrowX = tRect.left + tRect.width / 2 - left;
    arrowX = Math.max(10, Math.min(arrowX, tipRect.width - 10));

    setCoords({
      top, // fixed なのでスクロール位置は加味しない
      left,
      placement,
      arrowX,
    });

    // 元に戻す
    tip.style.visibility = "";
    tip.style.opacity = "";
    tip.style.display = "";
  };

  // 開いた時＋リサイズ/スクロールで都度再計算
  useLayoutEffect(() => {
    if (!open) return;
    position();
    const rerun = () => position();
    window.addEventListener("resize", rerun);
    window.addEventListener("scroll", rerun, true);
    return () => {
      window.removeEventListener("resize", rerun);
      window.removeEventListener("scroll", rerun, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}

      <span
        ref={tipRef}
        role="tooltip"
        className={[
          "pointer-events-none fixed z-[60]",
          // 黒背景・白文字・小型
          "rounded-sm px-2 py-1 bg-ink-deep text-white",
          "text-xs leading-tight shadow-md",
          // 幅・折返し
          "max-w-[250px] whitespace-pre-line break-words",
          // アニメーション
          "transition-opacity duration-200",
          open && coords ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={
          coords
            ? ({
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                // 矢印のX位置を CSS 変数で渡す
                ["--arrow-x" as string]: `${coords.arrowX}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {/* 本文 */}
        <span className="block">{content}</span>

        {/* 矢印 */}
        <span
          aria-hidden="true"
          className={[
            "absolute block h-0 w-0 border-[6px] border-transparent",
            coords?.placement === "top"
              ? "top-full left-[var(--arrow-x)] -translate-x-1/2 border-t-ink-deep"
              : "bottom-full left-[var(--arrow-x)] -translate-x-1/2 border-b-ink-deep",
          ].join(" ")}
        />
      </span>
    </span>
  );
}
