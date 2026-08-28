"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Daftar kata "halo" dari berbagai bahasa, ditampilkan bergantian
const GREETINGS = [
  "Halo", // Indonesia
  "Hello", // Inggris
  "Bonjour", // Prancis
  "Hola", // Spanyol
  "Ciao", // Italia
  "こんにちは", // Jepang
  "안녕하세요", // Korea
  "Olá", // Portugis
];

const GREETING_INTERVAL_MS = 500;
const MIN_HOLD_MS = GREETING_INTERVAL_MS * GREETINGS.length;

const PLANE_SIZE = 46;

// ── Ukuran "kanvas" tempat kurva digambar ──
const CURVE_WIDTH = 260;
const CURVE_HEIGHT = 90;

// Titik-titik kurva bezier: awal (kiri-bawah) -> kontrol (atas-tengah) -> akhir (kanan-bawah).
// Ini yang bikin bentuknya melengkung kayak busur/pelangi kebalik.
const P0 = { x: 20, y: 65 };
const P1 = { x: CURVE_WIDTH / 2, y: 5 };
const P2 = { x: CURVE_WIDTH - 20, y: 65 };

// Hitung posisi (x, y) di sepanjang kurva pada parameter t (0 = awal, 1 = akhir)
function pointOnCurve(t: number) {
  const mt = 1 - t;
  const x = mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x;
  const y = mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y;
  return { x, y };
}

// Hitung arah kemiringan kurva di titik t, dipakai buat memutar gambar pesawat
// biar hidungnya selalu ngadep ke arah terbang, bukan lurus terus
function angleOnCurve(t: number) {
  const mt = 1 - t;
  const dx = 2 * mt * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * mt * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// Bikin path SVG (format "M x,y Q cx,cy ex,ey" = mulai, lengkung lewat titik kontrol, ke titik akhir)
const CURVE_PATH = `M ${P0.x},${P0.y} Q ${P1.x},${P1.y} ${P2.x},${P2.y}`;

// Posisi bintang-bintang kecil di background dengan koordinat statis tetap
// untuk mencegah perbedaan kalkulasi floating-point antara Node.js SSR dan browser (Hydration Mismatch).
const STARS = [
  { top: 15, left: 22, size: 2, delay: 0.2 },
  { top: 28, left: 78, size: 1, delay: 0.8 },
  { top: 45, left: 12, size: 3, delay: 1.4 },
  { top: 62, left: 88, size: 2, delay: 0.5 },
  { top: 75, left: 35, size: 1, delay: 1.1 },
  { top: 18, left: 65, size: 2, delay: 1.7 },
  { top: 82, left: 15, size: 3, delay: 0.3 },
  { top: 35, left: 45, size: 1, delay: 0.9 },
  { top: 55, left: 72, size: 2, delay: 1.5 },
  { top: 90, left: 60, size: 1, delay: 0.6 },
  { top: 10, left: 40, size: 2, delay: 1.2 },
  { top: 40, left: 92, size: 3, delay: 0.4 },
  { top: 68, left: 25, size: 1, delay: 1.0 },
  { top: 25, left: 85, size: 2, delay: 1.6 },
  { top: 85, left: 48, size: 1, delay: 0.7 },
  { top: 50, left: 30, size: 2, delay: 1.3 },
  { top: 72, left: 75, size: 3, delay: 0.1 },
  { top: 30, left: 18, size: 1, delay: 0.9 },
  { top: 60, left: 55, size: 2, delay: 1.5 },
  { top: 95, left: 82, size: 1, delay: 0.8 },
];

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [greetingIndex, setGreetingIndex] = useState(0);
  const greetingTextRef = useRef<HTMLSpanElement>(null);

  const t = progress / 100;
  const planePos = pointOnCurve(t);
  const planeAngle = angleOnCurve(t);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    // ── Ganti kata "halo" tiap beberapa saat, dengan efek fade ──
    const greetingTimer = setInterval(() => {
      if (cancelled) return;
      gsap.to(greetingTextRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
          gsap.fromTo(
            greetingTextRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
          );
        },
      });
    }, GREETING_INTERVAL_MS);

    // ── Progress berbasis waktu, menggerakkan pesawat di sepanjang kurva ──
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / MIN_HOLD_MS) * 100);
      if (!cancelled) setProgress(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 50);

    // ── Setelah waktu minimum lewat, fade out splash-nya ──
    const holdTimeout = setTimeout(() => {
      if (cancelled) return;
      clearInterval(greetingTimer);

      gsap.to(".splash-root", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          document.body.style.overflow = "";
          onComplete();
        },
      });
    }, MIN_HOLD_MS);

    return () => {
      cancelled = true;
      clearInterval(greetingTimer);
      clearInterval(progressInterval);
      clearTimeout(holdTimeout);
      document.body.style.overflow = "";
    };
  }, [onComplete]);

  return (
    <div
      className="splash-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        // Radial gradient: dari abu gelap di tengah ke hitam di pinggir,
        // biar background gak flat/rata sewarna doang
        background:
          "radial-gradient(circle at 50% 40%, #141414 0%, #080808 70%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "36px",
        overflow: "hidden",
      }}
    >
      {/* Definisi animasi kelap-kelip untuk bintang-bintang background */}
      <style>{`
        @keyframes splashTwinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Bintang-bintang kecil di background, tiap satu berkelip sendiri-sendiri */}
      {STARS.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "50%",
            background: "#ffffff",
            animation: `splashTwinkle 2.4s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Kata "halo" yang gonta-ganti bahasa */}
      <span
        ref={greetingTextRef}
        style={{
          display: "inline-block",
          fontFamily: "var(--font-anton)",
          fontSize: "clamp(40px, 7vw, 80px)",
          color: "#FFFFFF",
          lineHeight: 1,
          textShadow: "0 0 40px rgba(255,255,255,0.15)",
        }}
      >
        {GREETINGS[greetingIndex]}
      </span>

      {/* Jalur melengkung + pesawat yang terbang di atasnya */}
      <div
        style={{
          position: "relative",
          width: CURVE_WIDTH,
          height: CURVE_HEIGHT,
        }}
      >
        <svg
          width={CURVE_WIDTH}
          height={CURVE_HEIGHT}
          viewBox={`0 0 ${CURVE_WIDTH} ${CURVE_HEIGHT}`}
          style={{ position: "absolute", top: 0, left: 0, overflow: "visible" }}
        >
          {/* Garis kurva penuh, warnanya samar sebagai "rel" */}
          <path
            d={CURVE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
          />
          {/* Garis kurva yang menyala, hanya sepanjang progress yang sudah dilewati.
              pathLength="100" bikin panjang path dianggap 100 satuan,
              jadi dashoffset bisa langsung dikaitkan ke persentase progress. */}
          <path
            d={CURVE_PATH}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - progress}
            style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
          />
        </svg>

        {/* Pesawat, posisinya dan rotasinya mengikuti kurva */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pesawat.svg"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${PLANE_SIZE}px`,
            height: `${PLANE_SIZE}px`,
            transform: `translate(${planePos.x - PLANE_SIZE / 2}px, ${
              planePos.y - PLANE_SIZE / 2
            }px) rotate(${planeAngle}deg)`,
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>

      {/* Angka persentase */}
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.4)",
          fontFamily: "monospace",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {Math.floor(progress).toString().padStart(2, "0")}%
      </span>
    </div>
  );
}
