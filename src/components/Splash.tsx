"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const NAME_WHITE = "Athallah";
const NAME_ACCENT = "sy";

const NUM_COLUMNS = 16;
const PLANE_SIZE = 200;
const PLANE_OUTSIDE_OFFSET = 400;
const PLANE_FLY_DURATION = 1.4;
const STAIRCASE_VERTICAL_LAG = 6;

// Hanya preload gambar hero untuk tampilan awal yang instan
const PRELOAD_ASSETS = ["/images/hero-bg.jpeg"];

const MIN_HOLD_MS = 500;

// Kata-kata yang ditutup blok hitam (kaya dokumen rahasia yang "diredaksi"),
// terus dibuka satu-satu seiring progress loading naik.
const REDACT_WORDS = ["ESTABLISHING", "SECURE", "CONNECTION"];

const COLUMN_REVEAL_HEIGHTS = Array.from({ length: NUM_COLUMNS }, (_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const rand = seed - Math.floor(seed);
  return 60 + rand * 40;
});

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function generateStaircasePolygon(openColumns: number, isTop: boolean): string {
  const colWidth = 100 / NUM_COLUMNS;
  const points: string[] = [];

  points.push(isTop ? "0% 0%" : "0% 100%");

  for (let i = 0; i < NUM_COLUMNS; i++) {
    const colStart = i * colWidth;
    const colEnd = (i + 1) * colWidth;

    const columnProgress = Math.min(
      Math.max((openColumns - i) / STAIRCASE_VERTICAL_LAG, 0),
      1,
    );

    const forcedProgress =
      openColumns >= NUM_COLUMNS + STAIRCASE_VERTICAL_LAG ? 1 : columnProgress;

    const easedProgress = easeInOutCubic(forcedProgress);
    const shapeInfluence = COLUMN_REVEAL_HEIGHTS[i] / 100;
    const shapedProgress =
      forcedProgress < 1 ? easedProgress * shapeInfluence : 1;

    const revealPercent = shapedProgress * 100;
    const remainingBlack = 100 - revealPercent;
    const yEdge = isTop ? remainingBlack : revealPercent;

    points.push(`${colStart.toFixed(3)}% ${yEdge.toFixed(3)}%`);
    points.push(`${colEnd.toFixed(3)}% ${yEdge.toFixed(3)}%`);
  }

  points.push(isTop ? "100% 0%" : "100% 100%");
  return `polygon(${points.join(", ")})`;
}

// Fetch tiap asset, baca stream-nya chunk demi chunk buat tau berapa byte
// yang udah masuk, terus lapor progress gabungan (0-100) tiap ada kemajuan.
// Kalau salah satu asset gagal di-fetch (404, dsb), jangan block splash-nya
// — anggap asset itu "selesai" biar progress tetap bisa nyampe 100%.
async function preloadWithProgress(
  urls: string[],
  onProgress: (pct: number) => void,
): Promise<void> {
  const loaded = new Array(urls.length).fill(0);
  const totals = new Array(urls.length).fill(0);

  const report = () => {
    const sumTotal = totals.reduce((a, b) => a + b, 0);
    const sumLoaded = loaded.reduce((a, b) => a + b, 0);
    const pct = sumTotal > 0 ? Math.min(99, (sumLoaded / sumTotal) * 100) : 0;
    onProgress(pct);
  };

  await Promise.all(
    urls.map(async (url, i) => {
      try {
        const res = await fetch(url);
        const len = res.headers.get("content-length");
        totals[i] = len ? parseInt(len, 10) : 0;

        if (!res.body || totals[i] === 0) {
          // Gak ada content-length (mis. asset dari cache) — anggap
          // selesai begitu response-nya sukses didapat.
          loaded[i] = totals[i] = totals[i] || 1;
          report();
          return;
        }

        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          loaded[i] += value.byteLength;
          report();
        }
      } catch {
        loaded[i] = totals[i] = totals[i] || 1;
        report();
      }
    }),
  );

  onProgress(100);
}

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const textLayerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLImageElement>(null);
  const bgTopRef = useRef<HTMLDivElement>(null);
  const bgBottomRef = useRef<HTMLDivElement>(null);
  const decoRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const redactContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    const letters = textLayerRef.current?.querySelectorAll(".splash-letter");

    gsap.set(letters ?? [], { y: "110%", opacity: 0 });
    gsap.set(decoRef.current, { opacity: 0 });
    gsap.set(counterRef.current, { opacity: 0 });
    gsap.set(planeRef.current, { left: `-${PLANE_OUTSIDE_OFFSET}px` });

    gsap.set([bgTopRef.current, bgBottomRef.current], {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      opacity: 1,
    });

    // Buka blok redaksi satu-satu (dari kiri ke kanan) begitu progress
    // ngelewatin ambang batas tiap kata. revealedCount dipakai biar gak
    // nge-trigger animasi yang sama berkali-kali.
    let revealedCount = 0;
    const revealWordsUpTo = (pct: number) => {
      const target = Math.floor((pct / 100) * REDACT_WORDS.length);
      if (target <= revealedCount) return;
      for (let i = revealedCount; i < target; i++) {
        const block = redactContainerRef.current?.querySelector(
          `[data-redact-block="${i}"]`,
        ) as HTMLElement | null;
        if (block) {
          gsap.to(block, {
            scaleY: 0,
            duration: 0.45,
            ease: "power2.in",
            transformOrigin: "bottom",
          });
        }
      }
      revealedCount = target;
    };

    // Progress yang ditampilkan (displayState) SENGAJA dipisah dari progress
    // asli (pct dari fetch). Kalau langsung pakai pct mentah, begitu aset
    // kecil kelar di-fetch dalam sekejap, tampilannya bakal "loncat" ke
    // 100% tanpa sempet keliatan proses ngisinya. Jadi tiap ada update pct
    // baru, kita tween displayState menuju situ secara halus.
    const displayState = { value: 0 };
    let displayTween: gsap.core.Tween | null = null;

    const setDisplayProgress = (pct: number) => {
      if (displayTween) displayTween.kill();
      const delta = Math.abs(pct - displayState.value);
      const duration = Math.min(0.9, Math.max(0.35, delta / 70));
      displayTween = gsap.to(displayState, {
        value: pct,
        duration,
        ease: "power1.out",
        onUpdate: () => {
          const v = displayState.value;
          if (counterRef.current) {
            counterRef.current.textContent = `${Math.floor(v)
              .toString()
              .padStart(2, "0")}%`;
          }
          revealWordsUpTo(v);
        },
      });
    };

    const updateCounter = (pct: number) => {
      setDisplayProgress(pct);
    };
    updateCounter(0);

    // ── Intro: huruf nama muncul + baris redaksi & counter fade in ──
    const tlIntro = gsap.timeline();

    tlIntro.to(letters ?? [], {
      y: "0%",
      opacity: 1,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.04,
    });

    tlIntro.to(
      decoRef.current,
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.3",
    );

    tlIntro.to(
      counterRef.current,
      { opacity: 1, duration: 0.4, ease: "power2.out" },
      "-=0.2",
    );

    async function run() {
      const introDone = new Promise<void>((resolve) => {
        tlIntro.eventCallback("onComplete", () => resolve());
      });
      const minHold = new Promise<void>((resolve) =>
        setTimeout(resolve, MIN_HOLD_MS),
      );
      const assetsDone = preloadWithProgress(PRELOAD_ASSETS, (pct) => {
        if (!cancelled) updateCounter(pct);
      });

      await Promise.all([introDone, minHold, assetsDone]);
      if (cancelled) return;
      updateCounter(100);
      revealWordsUpTo(100);

      // ── Outro: fade text, terbangin pesawat + buka tirai staircase ──
      const tlOutro = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          onComplete();
        },
      });

      tlOutro.to([textLayerRef.current, decoRef.current, counterRef.current], {
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });

      tlOutro.to(
        planeRef.current,
        {
          left: `calc(100% + ${PLANE_OUTSIDE_OFFSET}px)`,
          duration: PLANE_FLY_DURATION,
          ease: "power1.inOut",
          onUpdate: function () {
            // Menggunakan progress tween GSAP secara langsung tanpa membaca DOM geometry
            // (menghilangkan Forced Reflow / Layout Recalculation).
            const rawProgress = this.progress();
            const openColumns =
              rawProgress >= 1
                ? NUM_COLUMNS + STAIRCASE_VERTICAL_LAG
                : rawProgress * (NUM_COLUMNS + STAIRCASE_VERTICAL_LAG);

            if (bgTopRef.current) {
              bgTopRef.current.style.clipPath = generateStaircasePolygon(
                openColumns,
                true,
              );
            }
            if (bgBottomRef.current) {
              bgBottomRef.current.style.clipPath = generateStaircasePolygon(
                openColumns,
                false,
              );
            }
          },
        },
        "fly",
      );
    }

    run();

    return () => {
      cancelled = true;
      if (displayTween) displayTween.kill();
      tlIntro.kill();
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <>
      <div
        ref={bgTopRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "50%",
          zIndex: 9997,
          background: "#080808",
          pointerEvents: "none",
          transformOrigin: "bottom center",
        }}
      />

      <div
        ref={bgBottomRef}
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          width: "100%",
          height: "50%",
          zIndex: 9997,
          background: "#080808",
          pointerEvents: "none",
          transformOrigin: "top center",
        }}
      />

      <div
        ref={textLayerRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          pointerEvents: "none",
          background: "transparent",
        }}
      >
        <div style={{ overflow: "hidden", display: "flex" }}>
          {NAME_WHITE.split("").map((char, i) => (
            <span
              key={`w-${i}`}
              className="splash-letter"
              style={{
                display: "inline-block",
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(40px, 7vw, 80px)",
                color: "#FFFFFF",
                lineHeight: 1,
                transform: "translateY(110%)",
                opacity: 0,
              }}
            >
              {char}
            </span>
          ))}

          {NAME_ACCENT.split("").map((char, i) => (
            <span
              key={`a-${i}`}
              className="splash-letter"
              style={{
                display: "inline-block",
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(40px, 7vw, 80px)",
                color: "var(--primary)",
                lineHeight: 1,
                transform: "translateY(110%)",
                opacity: 0,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Baris "dokumen redaksi": tiap kata ketutup blok gelap, blok-nya
            nyusut ke bawah dan ilang satu-satu seiring progress naik —
            efeknya kaya dokumen rahasia yang lagi "dibuka aksesnya". */}
        <div
          ref={decoRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            opacity: 0,
            fontFamily: "monospace",
          }}
        >
          <div ref={redactContainerRef} style={{ display: "flex", gap: "6px" }}>
            {REDACT_WORDS.map((word, i) => (
              <div
                key={i}
                style={{ position: "relative", display: "inline-block" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {word}
                </span>
                <div
                  data-redact-block={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#0a0a0a",
                    border: "1px solid var(--primary-border)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
          </div>

          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
            {"//"}
          </span>

          {/* Counter — persentase asli dari byte asset yang udah ke-fetch,
              bukan angka animasi buatan. */}
          <span
            ref={counterRef}
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            00%
          </span>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={planeRef}
        src="/images/pesawat.svg"
        alt=""
        aria-hidden
        style={{
          position: "fixed",
          top: "50%",
          left: `-${PLANE_OUTSIDE_OFFSET}px`,
          width: `${PLANE_SIZE}px`,
          height: `${PLANE_SIZE}px`,
          transform: "translateY(-50%)",
          zIndex: 9999,
          filter: "brightness(0) invert(1)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
