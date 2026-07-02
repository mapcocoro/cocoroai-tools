"use client";
/* eslint-disable @next/next/no-img-element */
// げんば勤怠 本体（個人用）
// - タップで出退勤・休憩、現場ごとに集計、CSV書き出し
// - 状態は localStorage(genba-kintai-v1) に保存。全てローカル処理でオフライン動作
// - 位置情報は任意ON: 現場の自動判定＋本人控えの位置記録（監視・共有はしない）
// - アイコンはブランド iconset（/icons/genba/*）を使用
import { useCallback, useEffect, useRef, useState } from "react";

// ---- 型 ----
interface Site {
  id: string;
  name: string;
  loc: { lat: number; lng: number } | null;
}
interface BreakSpan {
  start: number;
  end: number | null;
}
interface Rec {
  id: string;
  date: string; // YYYY-MM-DD（出勤日）
  inTs: number;
  outTs: number | null;
  breaks: BreakSpan[];
  siteId: string;
  siteName: string;
  loc: { lat: number; lng: number } | null;
  memo: string;
}
interface Settings {
  useGps: boolean;
  round: 0 | 15 | 30;
}
interface Store {
  records: Rec[];
  sites: Site[];
  settings: Settings;
}

const KEY = "genba-kintai-v1";
const initial: Store = { records: [], sites: [], settings: { useGps: false, round: 0 } };

// ---- ユーティリティ ----
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const hm = (ts: number) => {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const jpDate = (y: string) => {
  const [, M, D] = y.split("-");
  const w = ["日", "月", "火", "水", "木", "金", "土"][new Date(y + "T00:00").getDay()];
  return `${Number(M)}月${Number(D)}日(${w})`;
};
function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const breaksMs = (rec: Rec, nowTs: number) =>
  (rec.breaks || []).reduce((s, b) => s + ((b.end ?? nowTs) - b.start), 0);
function workedMs(rec: Rec, now: number) {
  const end = rec.outTs ?? now;
  return Math.max(0, end - rec.inTs - breaksMs(rec, now));
}
function roundMs(ms: number, round: number) {
  if (!round) return ms;
  const unit = round * 60000;
  return Math.round(ms / unit) * unit;
}
const durH = (ms: number) => (Math.round(ms / 60000) / 60).toFixed(1);
const durHhmm = (ms: number) => {
  const m = Math.round(ms / 60000);
  return `${Math.floor(m / 60)}時間${pad(m % 60)}分`;
};
const tsFrom = (dateStr: string, timeStr: string) => new Date(`${dateStr}T${timeStr}`).getTime();

// ---- localStorage ----
function loadStore(): Store | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Store>;
    return {
      records: Array.isArray(d.records) ? (d.records as Rec[]) : [],
      sites: Array.isArray(d.sites) ? (d.sites as Site[]) : [],
      settings: { ...initial.settings, ...(d.settings || {}) },
    };
  } catch {
    return null;
  }
}

export default function GenbaKintaiTool() {
  const [store, setStore] = useState<Store>(initial);
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false); // SSRとの時刻ずれ(hydration mismatch)防止
  const [tab, setTab] = useState<"home" | "log" | "set">("home");
  const [now, setNow] = useState(0);
  const [siteSel, setSiteSel] = useState("");
  const [gpsTag, setGpsTag] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 復元（マウント後に実行＝サーバー描画と初期HTMLを一致させる）
  useEffect(() => {
    const s = loadStore();
    if (s) setStore(s);
    setNow(Date.now());
    setMounted(true);
    setReady(true);
  }, []);
  // 保存
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch {
      /* 容量超過等は無視（打刻は続行できる） */
    }
  }, [store, ready]);
  // ライブ時計（1秒ごと）
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((m: string) => {
    setToast(m);
    if (toastT.current) clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 1800);
  }, []);

  const active = store.records.find((r) => !r.outTs) ?? null;
  const activeBreak = active ? (active.breaks || []).find((b) => !b.end) ?? null : null;

  // ---- GPS ----
  const grabLoc = useCallback(
    (cb: (loc: { lat: number; lng: number } | null) => void) => {
      if (!store.settings.useGps || typeof navigator === "undefined" || !navigator.geolocation) {
        cb(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          cb({
            lat: +pos.coords.latitude.toFixed(5),
            lng: +pos.coords.longitude.toFixed(5),
          }),
        () => cb(null),
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    },
    [store.settings.useGps]
  );
  const autoPickSite = useCallback(() => {
    if (!store.settings.useGps || typeof navigator === "undefined" || !navigator.geolocation) return;
    const sited = store.sites.filter((s) => s.loc);
    if (!sited.length) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let best: Site | null = null;
        let bd = Infinity;
        for (const s of sited) {
          const d = haversine(here, s.loc!);
          if (d < bd) {
            bd = d;
            best = s;
          }
        }
        if (best && bd < 400) {
          setSiteSel(best.id);
          setGpsTag(`${Math.round(bd)}m`);
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  }, [store.settings.useGps, store.sites]);

  useEffect(() => {
    if (ready && tab === "home") autoPickSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, tab]);

  // ---- 打刻 ----
  const clockIn = () => {
    const site = store.sites.find((s) => s.id === siteSel);
    const ts = Date.now();
    const r: Rec = {
      id: "r" + ts,
      date: ymd(ts),
      inTs: ts,
      outTs: null,
      breaks: [],
      siteId: siteSel || "",
      siteName: site ? site.name : "",
      loc: null,
      memo: "",
    };
    setStore((st) => ({ ...st, records: [r, ...st.records] }));
    grabLoc((loc) => {
      if (loc) setStore((st) => ({ ...st, records: st.records.map((x) => (x.id === r.id ? { ...x, loc } : x)) }));
    });
    showToast("出勤しました");
  };
  const clockOut = () => {
    setStore((st) => ({
      ...st,
      records: st.records.map((r) => {
        if (r.outTs) return r;
        const breaks = r.breaks.map((b) => (b.end ? b : { ...b, end: Date.now() }));
        return { ...r, breaks, outTs: Date.now() };
      }),
    }));
    showToast("おつかれさまでした");
  };
  const toggleBreak = () => {
    setStore((st) => ({
      ...st,
      records: st.records.map((r) => {
        if (r.outTs) return r;
        const open = r.breaks.find((b) => !b.end);
        if (open) return { ...r, breaks: r.breaks.map((b) => (b.end ? b : { ...b, end: Date.now() })) };
        return { ...r, breaks: [...r.breaks, { start: Date.now(), end: null }] };
      }),
    }));
    showToast(activeBreak ? "休憩おわり" : "休憩に入りました");
  };
  const editMemo = () => {
    if (!active) return;
    const m = window.prompt("メモ（現場の状況など）", active.memo || "");
    if (m !== null)
      setStore((st) => ({ ...st, records: st.records.map((r) => (r.id === active.id ? { ...r, memo: m.slice(0, 40) } : r)) }));
  };
  const onSiteChange = (val: string) => {
    setSiteSel(val);
    setGpsTag(null);
    if (active) {
      const s = store.sites.find((x) => x.id === val);
      setStore((st) => ({
        ...st,
        records: st.records.map((r) => (r.id === active.id ? { ...r, siteId: s ? s.id : "", siteName: s ? s.name : "" } : r)),
      }));
    }
  };

  // ---- 現場 ----
  const [newSite, setNewSite] = useState("");
  const addSite = () => {
    const v = newSite.trim();
    if (!v) return;
    setStore((st) => ({ ...st, sites: [...st.sites, { id: "s" + Date.now(), name: v.slice(0, 30), loc: null }] }));
    setNewSite("");
    showToast("現場を追加しました");
  };
  const delSite = (id: string) => setStore((st) => ({ ...st, sites: st.sites.filter((s) => s.id !== id) }));
  const setSiteHere = (id: string) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      showToast("位置情報が使えません");
      return;
    }
    showToast("位置を取得中…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) };
        setStore((st) => ({ ...st, sites: st.sites.map((s) => (s.id === id ? { ...s, loc } : s)) }));
        showToast("現場の場所を登録しました");
      },
      () => showToast("位置を取得できませんでした"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  const toggleGps = () => {
    setStore((st) => {
      const useGps = !st.settings.useGps;
      if (useGps && typeof navigator !== "undefined" && navigator.geolocation)
        navigator.geolocation.getCurrentPosition(() => {}, () => {}); // 権限プロンプト
      return { ...st, settings: { ...st.settings, useGps } };
    });
  };
  const setRound = (round: 0 | 15 | 30) => setStore((st) => ({ ...st, settings: { ...st.settings, round } }));

  // ---- CSV ----
  const exportCsv = () => {
    if (!store.records.length) {
      showToast("記録がありません");
      return;
    }
    const rows: (string | number)[][] = [
      ["日付", "現場", "出勤", "退勤", "休憩(分)", "実働(時間)", "位置(緯度)", "位置(経度)", "メモ"],
    ];
    [...store.records]
      .sort((a, b) => a.inTs - b.inTs)
      .forEach((r) => {
        rows.push([
          r.date,
          r.siteName || "",
          hm(r.inTs),
          r.outTs ? hm(r.outTs) : "",
          Math.round(breaksMs(r, Date.now()) / 60000),
          durH(roundMs(workedMs(r, Date.now()), store.settings.round)),
          r.loc ? r.loc.lat : "",
          r.loc ? r.loc.lng : "",
          (r.memo || "").replace(/"/g, '""'),
        ]);
      });
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `勤怠_${ymd(Date.now())}.csv`;
    a.click();
    showToast("CSVを書き出しました");
  };
  const clearAll = () => {
    if (window.confirm("すべての記録を消します。よろしいですか？（元に戻せません）"))
      setStore((st) => ({ ...st, records: [] }));
  };

  // ---- 編集 ----
  const editing = editId ? store.records.find((r) => r.id === editId) ?? null : null;
  const [mDate, setMDate] = useState("");
  const [mSite, setMSite] = useState("");
  const [mIn, setMIn] = useState("");
  const [mOut, setMOut] = useState("");
  const [mBreak, setMBreak] = useState("");
  const [mMemo, setMMemo] = useState("");
  const openEdit = (r: Rec) => {
    setEditId(r.id);
    setMDate(r.date);
    setMSite(r.siteId || "");
    setMIn(hm(r.inTs));
    setMOut(r.outTs ? hm(r.outTs) : "");
    setMBreak(String(Math.round(breaksMs(r, Date.now()) / 60000) || ""));
    setMMemo(r.memo || "");
  };
  const saveEdit = () => {
    if (!editing) return;
    if (!mDate || !mIn) {
      showToast("日付と出勤時刻は必須です");
      return;
    }
    const inTs = tsFrom(mDate, mIn);
    let outTs: number | null = null;
    if (mOut) {
      outTs = tsFrom(mDate, mOut);
      if (outTs < inTs) outTs += 86400000; // 退勤<出勤=翌日(夜勤)
    }
    const s = store.sites.find((x) => x.id === mSite);
    const bm = Math.max(0, parseInt(mBreak || "0", 10));
    setStore((st) => ({
      ...st,
      records: st.records.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              date: mDate,
              inTs,
              outTs,
              siteId: s ? s.id : "",
              siteName: s ? s.name : "",
              breaks: bm ? [{ start: inTs, end: inTs + bm * 60000 }] : [],
              memo: mMemo.slice(0, 40),
            }
          : r
      ),
    }));
    setEditId(null);
    showToast("保存しました");
  };
  const delRec = () => {
    if (!editing) return;
    if (window.confirm("この記録を削除しますか？")) {
      setStore((st) => ({ ...st, records: st.records.filter((r) => r.id !== editing.id) }));
      setEditId(null);
      showToast("削除しました");
    }
  };

  // ---- 集計（今日） ----
  const today = ymd(now);
  const todays = store.records.filter((r) => r.date === today);
  let todayWork = 0,
    todayRest = 0,
    firstIn: number | null = null;
  for (const r of todays) {
    todayWork += workedMs(r, now);
    todayRest += breaksMs(r, now);
    if (firstIn === null || r.inTs < firstIn) firstIn = r.inTs;
  }

  // ---- 月ごと集計 ----
  const byMonth: Record<string, Rec[]> = {};
  [...store.records]
    .sort((a, b) => b.inTs - a.inTs)
    .forEach((r) => {
      const mk = r.date.slice(0, 7);
      (byMonth[mk] = byMonth[mk] || []).push(r);
    });
  const round = store.settings.round;

  const TabIcon = ({ src }: { src: string }) => (
    <img src={src} alt="" width={22} height={22} className="h-[22px] w-[22px] shrink-0" />
  );

  return (
    <div className="space-y-5">
      {/* 上部タブ */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-paper-2 p-1.5">
        {(
          [
            { k: "home", label: "打刻", icon: "/icons/genba/clock.png" },
            { k: "log", label: "きろく", icon: "/icons/genba/log.png" },
            { k: "set", label: "現場・設定", icon: "/icons/genba/settings.png" },
          ] as const
        ).map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-bold transition ${
              tab === t.k ? "bg-card text-teal shadow-xs" : "text-ink-mute hover:text-ink-soft"
            }`}
          >
            <TabIcon src={t.icon} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* データは端末内だけ */}
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-mute">
        🔒 データはこの端末の中だけ・どこにも送りません
      </p>

      {/* ===== 打刻 ===== */}
      {tab === "home" && (
        <>
          <section className="rounded-2xl border border-line bg-card p-5 shadow-xs">
            <div className="text-center">
              <p className="text-sm text-ink-mute">{mounted ? jpDate(today) : " "}</p>
              <p className="tnum my-1 font-serif text-5xl font-bold leading-none text-ink">
                {mounted ? hm(now) : "--:--"}
              </p>
              <span
                className={`mt-2 inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
                  activeBreak
                    ? "bg-sun/20 text-sun-ink"
                    : active
                      ? "bg-teal-soft text-teal-deep"
                      : "bg-cream text-ink-mute"
                }`}
              >
                {activeBreak ? "休憩中" : active ? "勤務中" : "未出勤"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-ink-mute">現場</span>
              <select
                value={active ? active.siteId : siteSel}
                onChange={(e) => onSiteChange(e.target.value)}
                className="max-w-[60%] rounded-xl border border-ink-line bg-paper-2 px-3 py-2.5 text-ink"
              >
                <option value="">（現場なし）</option>
                {store.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {gpsTag && (
                <span className="flex items-center gap-1 text-xs text-teal-mid">
                  <img src="/icons/genba/pin.png" alt="" width={14} height={14} className="h-3.5 w-3.5" />
                  自動 {gpsTag}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={active ? clockOut : clockIn}
              className={`mt-4 flex w-full items-center justify-center gap-3 rounded-2xl py-6 font-serif text-2xl font-bold tracking-widest text-white shadow-md transition active:scale-[0.99] ${
                active ? "bg-[#c0522f] hover:bg-[#9c3f22]" : "bg-teal hover:bg-teal-deep"
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full ${active ? "bg-white" : "bg-white"}`} />
              {active ? "退勤" : "出勤"}
            </button>
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={toggleBreak}
                disabled={!active}
                className={`flex-1 rounded-xl border-2 py-4 text-base font-bold transition active:scale-[0.98] disabled:opacity-30 ${
                  activeBreak
                    ? "border-sun bg-sun/15 text-sun-ink"
                    : "border-ink-line bg-paper-2 text-teal-deep"
                }`}
              >
                {activeBreak ? "休憩おわり" : "休憩"}
              </button>
              <button
                type="button"
                onClick={editMemo}
                disabled={!active}
                className="flex-1 rounded-xl border-2 border-ink-line bg-paper-2 py-4 text-base font-bold text-teal-deep transition active:scale-[0.98] disabled:opacity-30"
              >
                メモ
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 shadow-xs">
            <h2 className="mb-3 font-serif text-sm font-bold text-teal-deep">きょうの合計</h2>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-xs text-ink-mute">実働</div>
                <div className="font-serif text-2xl font-bold text-teal-deep">
                  {durH(roundMs(todayWork, round))}
                  <span className="text-xs font-normal">時間</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-mute">休憩</div>
                <div className="font-serif text-2xl font-bold text-teal-deep">
                  {Math.round(todayRest / 60000)}
                  <span className="text-xs font-normal">分</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-ink-mute">出勤</div>
                <div className="tnum font-serif text-2xl font-bold text-teal-deep">
                  {firstIn ? hm(firstIn) : "--:--"}
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===== きろく ===== */}
      {tab === "log" && (
        <div>
          {store.records.length === 0 ? (
            <p className="py-12 text-center text-sm leading-loose text-ink-mute">
              まだ記録がありません。
              <br />
              「打刻」から出勤してみましょう。
            </p>
          ) : (
            Object.keys(byMonth)
              .sort()
              .reverse()
              .map((mk) => {
                const rs = byMonth[mk];
                let mTot = 0;
                const siteTot: Record<string, number> = {};
                for (const r of rs) {
                  const w = roundMs(workedMs(r, now), round);
                  mTot += w;
                  const k = r.siteName || "（現場なし）";
                  siteTot[k] = (siteTot[k] || 0) + w;
                }
                const [Y, M] = mk.split("-");
                const sk = Object.keys(siteTot);
                return (
                  <div key={mk}>
                    <div className="mt-4 mb-1.5 flex items-center justify-between px-1">
                      <span className="font-serif text-base font-bold text-ink">
                        {Number(Y)}年{Number(M)}月
                      </span>
                      <span className="text-sm font-bold text-teal-deep">合計 {durH(mTot)}時間</span>
                    </div>
                    {(sk.length > 1 || (sk.length === 1 && sk[0] !== "（現場なし）")) && (
                      <div className="my-1.5 rounded-xl bg-paper-2 px-3 py-2 text-xs text-ink-mute">
                        {sk.map((k, i) => (
                          <span key={k}>
                            {i > 0 && " / "}
                            {k} <b className="text-teal-deep">{durH(siteTot[k])}h</b>
                          </span>
                        ))}
                      </div>
                    )}
                    {rs.map((r) => {
                      const w = durHhmm(roundMs(workedMs(r, now), round));
                      const rest = Math.round(breaksMs(r, now) / 60000);
                      const live = !r.outTs;
                      return (
                        <div key={r.id} className="my-2 rounded-2xl border border-line bg-card p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="text-sm font-bold text-ink">{jpDate(r.date)}</span>
                              {r.siteName && (
                                <span className="rounded-xl bg-teal-softer px-2.5 py-0.5 text-xs text-teal">
                                  {r.siteName}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="rounded-lg px-2 py-1 text-xs text-teal hover:bg-teal-softer"
                            >
                              直す
                            </button>
                          </div>
                          <div className="tnum mt-1.5 text-sm text-ink-soft">
                            {hm(r.inTs)} 〜 {live ? <span className="text-teal">勤務中</span> : hm(r.outTs!)}
                            {rest ? ` ・休憩${rest}分` : ""} ・<span className="font-bold text-teal-deep">実働 {w}</span>
                          </div>
                          {r.loc && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-mute">
                              <img src="/icons/genba/pin.png" alt="" width={12} height={12} className="h-3 w-3" />
                              {r.loc.lat}, {r.loc.lng}
                              <a
                                href={`https://maps.google.com/?q=${r.loc.lat},${r.loc.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-teal underline-offset-2 hover:underline"
                              >
                                地図
                              </a>
                            </div>
                          )}
                          {r.memo && <div className="mt-1 text-[11px] text-ink-mute">📝 {r.memo}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ===== 現場・設定 ===== */}
      {tab === "set" && (
        <>
          <section className="rounded-2xl border border-line bg-card p-5 shadow-xs">
            <h2 className="mb-3 font-serif text-sm font-bold text-teal-deep">現場の登録</h2>
            {store.sites.length === 0 ? (
              <p className="py-2 text-center text-xs text-ink-mute">現場を登録すると、打刻のときに選べます。</p>
            ) : (
              store.sites.map((s) => (
                <div key={s.id} className="flex items-center gap-2 border-b border-line py-2.5">
                  <span className="flex-1 font-medium text-ink">{s.name}</span>
                  {s.loc ? (
                    <span className="flex items-center gap-1 text-xs text-teal-mid">
                      <img src="/icons/genba/pin.png" alt="" width={13} height={13} className="h-3 w-3" />
                      登録済み
                    </span>
                  ) : (
                    store.settings.useGps && (
                      <button
                        type="button"
                        onClick={() => setSiteHere(s.id)}
                        className="text-xs text-teal hover:underline"
                      >
                        ＋今ここ
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => delSite(s.id)}
                    aria-label={`${s.name}を削除`}
                    className="px-2 text-lg text-ink-mute hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSite()}
                placeholder="現場名（例：本町ビル工事）"
                maxLength={30}
                className="flex-1 rounded-xl border border-ink-line bg-paper-2 px-3 py-2.5"
              />
              <button type="button" onClick={addSite} className="rounded-xl bg-teal px-4 font-bold text-white">
                追加
              </button>
            </div>
            <p className={`mt-2.5 text-[11px] leading-relaxed text-ink-mute ${store.settings.useGps ? "" : "opacity-50"}`}>
              位置情報がオンのとき「＋今ここ」で現場の場所も登録でき、次からGPSで自動選択されます。
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5 shadow-xs">
            <h2 className="mb-1 font-serif text-sm font-bold text-teal-deep">設定</h2>
            <div className="flex items-center justify-between border-b border-line py-3">
              <div className="text-sm">
                位置情報を使う
                <small className="mt-0.5 block text-[11px] text-ink-mute">
                  打刻時に現場を自動判定・自分の控えに位置を記録（在宅ならオフ推奨・誰にも共有しません）
                </small>
              </div>
              <button
                type="button"
                onClick={toggleGps}
                aria-label="位置情報の切替"
                className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition ${
                  store.settings.useGps ? "bg-teal" : "bg-ink-line"
                }`}
              >
                <span
                  className={`absolute top-[3px] h-6 w-6 rounded-full bg-white transition-all ${
                    store.settings.useGps ? "left-[25px]" : "left-[3px]"
                  }`}
                />
              </button>
            </div>
            <div className="py-3">
              <div className="text-sm">実働時間の丸め</div>
              <div className="mt-2 flex gap-1.5">
                {([0, 15, 30] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRound(r)}
                    className={`flex-1 rounded-xl border-[1.5px] py-2.5 text-sm font-bold transition ${
                      round === r
                        ? "border-teal bg-teal-soft text-teal-deep"
                        : "border-ink-line bg-paper-2 text-ink-soft"
                    }`}
                  >
                    {r === 0 ? "丸めない" : `${r}分`}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink-line bg-paper-2 py-3.5 font-bold text-teal-deep hover:bg-teal-softer"
            >
              記録をCSVで書き出す
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#e8c9bf] bg-paper-2 py-3.5 font-bold text-[#c0522f] hover:bg-red-50"
            >
              すべての記録を消す
            </button>
            <p className="mt-2.5 text-[11px] leading-relaxed text-ink-mute">
              ※このアプリは打刻・集計・CSV書き出しまでを行います。給与や税額の計算はしません（正確な計算はお勤め先・専門家へ）。
            </p>
          </section>
        </>
      )}

      {/* トースト */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {/* 編集シート */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-deep/50"
          onClick={(e) => e.target === e.currentTarget && setEditId(null)}
        >
          <div className="w-full max-w-xl rounded-t-3xl bg-paper p-5 pb-8">
            <h3 className="mb-3.5 font-serif text-base font-bold text-ink">記録を直す</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs text-ink-mute">日付</span>
                <input type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} className="w-full rounded-xl border border-ink-line bg-card px-3 py-2.5" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-mute">現場</span>
                <select value={mSite} onChange={(e) => setMSite(e.target.value)} className="w-full rounded-xl border border-ink-line bg-card px-3 py-2.5">
                  <option value="">（現場なし）</option>
                  {store.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="mb-1 block text-xs text-ink-mute">出勤 / 退勤</span>
                <div className="flex gap-2">
                  <input type="time" value={mIn} onChange={(e) => setMIn(e.target.value)} className="flex-1 rounded-xl border border-ink-line bg-card px-3 py-2.5" />
                  <input type="time" value={mOut} onChange={(e) => setMOut(e.target.value)} className="flex-1 rounded-xl border border-ink-line bg-card px-3 py-2.5" />
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-mute">休憩（分）</span>
                <input type="number" min={0} step={5} value={mBreak} onChange={(e) => setMBreak(e.target.value)} placeholder="0" className="w-full rounded-xl border border-ink-line bg-card px-3 py-2.5" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-mute">メモ</span>
                <input type="text" maxLength={40} value={mMemo} onChange={(e) => setMMemo(e.target.value)} placeholder="（任意）" className="w-full rounded-xl border border-ink-line bg-card px-3 py-2.5" />
              </label>
            </div>
            <div className="mt-4 flex gap-2.5">
              <button type="button" onClick={delRec} className="px-3 py-3.5 font-bold text-[#c0522f]">
                削除
              </button>
              <button type="button" onClick={() => setEditId(null)} className="flex-1 rounded-xl border border-ink-line bg-paper-2 py-3.5 font-bold text-ink-soft">
                やめる
              </button>
              <button type="button" onClick={saveEdit} className="flex-1 rounded-xl bg-teal py-3.5 font-bold text-white">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
