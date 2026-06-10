"use client";
// 順番待ち受付ボード 本体
// タブレット1台で「受付(番号発行)」と「呼び出し表示」を行う。
// - 状態はlocalStorage(cocoroai_tools_queue_v1)に保存。全てローカル処理なのでオフラインでも動く
// - 同一端末の別タブとはstorageイベントで同期(複数端末同期は仕様外→CustomizeCTAへ誘導)
// - 表示モードは fixed inset-0 のオーバーレイでToolLayoutごと覆い、待合室向けに没入させる
import { useCallback, useEffect, useRef, useState } from "react";

// ---- 状態とlocalStorage ----

const STORAGE_KEY = "cocoroai_tools_queue_v1";
const MAX_NO = 999; // 番号は1〜999でループ

interface QueueState {
  /** 次に発行する番号 */
  nextNo: number;
  /** 呼び出し中の番号(なければnull) */
  calling: number | null;
  /** お待ちの番号(発行順) */
  waiting: number[];
}

const initialState: QueueState = { nextNo: 1, calling: null, waiting: [] };

function isValidNo(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= MAX_NO;
}

function parseState(raw: string): QueueState | null {
  try {
    const d: unknown = JSON.parse(raw);
    if (typeof d !== "object" || d === null) return null;
    const o = d as Record<string, unknown>;
    return {
      nextNo: isValidNo(o.nextNo) ? o.nextNo : 1,
      calling: isValidNo(o.calling) ? o.calling : null,
      waiting: Array.isArray(o.waiting) ? o.waiting.filter(isValidNo) : [],
    };
  } catch {
    return null;
  }
}

function loadState(): QueueState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseState(raw) : null;
  } catch {
    return null;
  }
}

// ---- 本体 ----

export default function QueueBoardTool() {
  const [state, setState] = useState<QueueState>(initialState);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"reception" | "display">("reception");
  /** 発行直後の番号(トースト表示用) */
  const [issued, setIssued] = useState<number | null>(null);
  /** Wake Lockが取れたか(null=未試行/不明) */
  const [wakeLockOk, setWakeLockOk] = useState<boolean | null>(null);
  /** storageイベント由来の更新は再保存しない(無限ループ防止というより無駄書き防止) */
  const skipPersist = useRef(false);

  // マウント時にlocalStorageから復元
  useEffect(() => {
    const saved = loadState();
    if (saved) setState(saved);
    setReady(true);
  }, []);

  // 変更のたびに自動保存
  useEffect(() => {
    if (!ready) return;
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 容量超過等。受付は続行できるので何もしない
    }
  }, [state, ready]);

  // 同一端末の別タブと同期
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      const next = parseState(e.newValue);
      if (next) {
        skipPersist.current = true;
        setState(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 発行トーストは4秒で自動的に消す
  useEffect(() => {
    if (issued === null) return;
    const t = setTimeout(() => setIssued(null), 4000);
    return () => clearTimeout(t);
  }, [issued]);

  // 表示モード中はWake Lockで画面常時点灯を試みる
  useEffect(() => {
    if (mode !== "display") return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const request = async () => {
      if (!("wakeLock" in navigator)) {
        setWakeLockOk(false);
        return;
      }
      try {
        const l = await navigator.wakeLock.request("screen");
        if (cancelled) {
          l.release().catch(() => {});
          return;
        }
        lock = l;
        setWakeLockOk(true);
      } catch {
        setWakeLockOk(false);
      }
    };
    request();
    // タブ復帰時はロックが切れているので取り直す
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [mode]);

  // ---- 操作 ----

  /** 受付する: 番号を発行してwaitingへ */
  const issue = () => {
    const taken = new Set(state.waiting);
    if (state.calling !== null) taken.add(state.calling);
    if (taken.size >= MAX_NO - 1) {
      alert("お待ちの番号がいっぱいです。先に呼び出しを進めてください。");
      return;
    }
    // 1周して番号が残っていた場合は空き番号まで進める
    let no = state.nextNo;
    while (taken.has(no)) no = no >= MAX_NO ? 1 : no + 1;
    setState({
      ...state,
      nextNo: no >= MAX_NO ? 1 : no + 1,
      waiting: [...state.waiting, no],
    });
    setIssued(no);
  };

  /** 次の方を呼び出す: waitingの先頭をcallingへ */
  const callNext = () => {
    if (state.waiting.length === 0) return;
    const [head, ...rest] = state.waiting;
    setState({ ...state, calling: head, waiting: rest });
  };

  /** 指定番号を呼び出す */
  const callNo = (no: number) =>
    setState({
      ...state,
      calling: no,
      waiting: state.waiting.filter((n) => n !== no),
    });

  /** 指定番号を取り消し */
  const cancelNo = (no: number) =>
    setState({ ...state, waiting: state.waiting.filter((n) => n !== no) });

  /** 済み: 呼び出し中をクリア */
  const done = () => setState({ ...state, calling: null });

  /** 全リセット(誤タップ防止のためconfirm必須) */
  const reset = () => {
    if (
      !confirm(
        "受付をすべてリセットしますか？\n待ち状況が消え、番号は 1 にもどります。"
      )
    )
      return;
    setState({ ...initialState });
    setIssued(null);
  };

  const enterDisplay = useCallback(() => {
    setMode("display");
    setWakeLockOk(null);
    // 全画面化を試みる(失敗してもオーバーレイで全画面風に続行)
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const exitDisplay = useCallback(() => {
    setMode("reception");
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const waitingCount = state.waiting.length;

  // ---- 表示モード(待合室向け・全画面オーバーレイ) ----

  if (mode === "display") {
    // 桁数に合わせて、できるだけ大きく(高さ40%以上を優先しつつ横にはみ出さない)
    const fontSize =
      state.calling === null
        ? undefined
        : state.calling >= 100
          ? "min(50svh, 28vw)"
          : state.calling >= 10
            ? "min(50svh, 42vw)"
            : "min(50svh, 56vw)";
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-teal-deep px-4 text-white">
        <p className="font-mono text-sm tracking-[0.4em] text-white/70 sm:text-lg">
          呼び出し中
        </p>
        {state.calling !== null ? (
          <p
            key={state.calling}
            aria-live="polite"
            className="qb-call-anim tnum font-mono font-bold leading-none"
            style={{ fontSize }}
            data-testid="display-calling"
          >
            {state.calling}
          </p>
        ) : (
          <p
            aria-live="polite"
            className="flex items-center justify-center text-xl text-white/60 sm:text-3xl"
            style={{ minHeight: "40svh" }}
            data-testid="display-calling-empty"
          >
            番号順におよびします。おかけになってお待ちください
          </p>
        )}
        <p className="mt-2 text-xl text-white/90 sm:mt-4 sm:text-4xl">
          お待ちの人数:{" "}
          <span className="tnum font-mono font-bold text-sun">
            {waitingCount}
          </span>{" "}
          人
        </p>

        {wakeLockOk === false && (
          <p className="absolute bottom-4 left-4 max-w-[55vw] text-left text-[11px] leading-relaxed text-white/50">
            画面が消えないよう、端末の自動ロックをオフにしてください
          </p>
        )}
        <button
          type="button"
          onClick={exitDisplay}
          className="absolute bottom-4 right-4 rounded-full border border-white/25 px-4 py-2 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          受付に戻る
        </button>
      </div>
    );
  }

  // ---- 受付モード(通常画面・ToolLayout内) ----

  return (
    <div className="space-y-5">
      {/* 受付する */}
      <section className="rounded-2xl border border-line bg-card p-4 shadow-xs sm:p-6">
        <button
          type="button"
          onClick={issue}
          className="w-full rounded-2xl bg-teal py-8 text-3xl font-bold tracking-widest text-white shadow-md transition active:scale-[0.99] hover:bg-teal-deep sm:py-12 sm:text-4xl"
        >
          受付する
        </button>
        <p className="mt-3 text-center text-xs text-ink-mute">
          タップすると番号をお渡しできます ・ ネットが切れていても動きます
        </p>
      </section>

      {/* 発行直後のお知らせ(トースト的表示) */}
      {issued !== null && (
        <div
          role="status"
          className="qb-call-anim rounded-2xl border-2 border-sun bg-sun/15 px-4 py-5 text-center"
          data-testid="issued-toast"
        >
          <p className="text-lg text-ink sm:text-2xl">
            お客様の番号は{" "}
            <span className="tnum mx-1 align-middle font-mono text-5xl font-bold text-teal sm:text-6xl">
              {issued}
            </span>{" "}
            です
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            お呼びするまでお待ちください。番号はスマホで撮っておくと安心です📷
          </p>
        </div>
      )}

      {/* 呼び出し中 */}
      <section className="rounded-2xl border border-line bg-card shadow-xs">
        <div className="flex items-center justify-between rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
          <h2 className="text-sm font-bold text-ink">呼び出し中</h2>
          <button
            type="button"
            onClick={callNext}
            disabled={waitingCount === 0}
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-deep disabled:cursor-default disabled:opacity-30"
          >
            次の方を呼び出す
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-6 sm:gap-8">
          {state.calling !== null ? (
            <>
              <p
                key={state.calling}
                className="qb-call-anim tnum font-mono text-7xl font-bold leading-none text-teal sm:text-8xl"
                data-testid="reception-calling"
              >
                {state.calling}
              </p>
              <button
                type="button"
                onClick={done}
                className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-bold text-ink-soft transition-colors hover:bg-paper-2"
              >
                済み
              </button>
            </>
          ) : (
            <p className="py-4 text-sm text-ink-mute" data-testid="reception-calling-empty">
              いま呼び出している番号はありません
            </p>
          )}
        </div>
      </section>

      {/* 待ち一覧 */}
      <section className="rounded-2xl border border-line bg-card shadow-xs">
        <div className="rounded-t-2xl border-b border-line bg-paper-2 px-4 py-3">
          <h2 className="text-sm font-bold text-ink">
            お待ちの方{" "}
            <span className="tnum font-mono text-teal" data-testid="waiting-count">
              {waitingCount}
            </span>{" "}
            人
          </h2>
        </div>
        <div className="p-4">
          {waitingCount === 0 ? (
            <p className="py-2 text-center text-sm text-ink-mute">
              お待ちの方はいません。「受付する」で番号を発行できます。
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2" data-testid="waiting-list">
              {state.waiting.map((no) => (
                <li
                  key={no}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-paper-2/60 py-1.5 pl-3 pr-1.5"
                >
                  <span className="tnum min-w-[2ch] text-center font-mono text-2xl font-bold text-ink">
                    {no}
                  </span>
                  <button
                    type="button"
                    onClick={() => callNo(no)}
                    className="rounded-lg bg-teal-softer px-2.5 py-2 text-xs font-bold text-teal transition-colors hover:bg-teal-soft"
                  >
                    呼び出す
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelNo(no)}
                    aria-label={`番号${no}を取り消し`}
                    className="rounded-lg px-2.5 py-2 text-xs text-ink-mute transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    取り消し
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 表示モード・リセット */}
      <section className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={enterDisplay}
          className="rounded-xl border-2 border-teal bg-card px-6 py-4 text-base font-bold text-teal transition-colors hover:bg-teal-softer"
        >
          🖥️ 表示モードにする(待合室向けの大きな画面)
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-line bg-card px-5 py-3 text-sm text-ink-mute transition-colors hover:border-red-300 hover:text-red-600"
        >
          リセット(番号を1にもどす)
        </button>
      </section>
      <section className="rounded-2xl border border-line bg-paper-2 p-5">
        <h2 className="text-sm font-bold text-ink">つかいどころ(正直なご案内)</h2>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          このボードは紙の番号札を出さない仕組みのため、
          <strong>待ち人数が少ない場面(目安10人まで)</strong>
          に向いています。整骨院・サロンの順番整理、イベントの相談ブース、店頭の混雑時など。
          お呼びした際は「○番のお客様ですね?」とひとこと確認すると、番号の聞き違いを防げます。
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          待ちが多いお店や、呼び間違いを確実に防ぎたい場合は、紙の番号札(発券機連携)や
          「お客様のLINEに番号と呼び出しを通知する方式」が確実です。下のカスタム相談からどうぞ。
        </p>
      </section>
      <p className="text-[11px] leading-relaxed text-ink-mute">
        ※受付の状況はこの端末の中にだけ保存されます。ページを閉じても消えません。
        チャイム音や複数端末での共有、LINE通知は下の「カスタム」からご相談ください。
      </p>
    </div>
  );
}
