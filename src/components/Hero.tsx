"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import BorderGlow from "./BorderGlow";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Semua elemen langsung di posisi/opacity final — tidak ada entrance animation
    gsap.set(
      [
        ".hero-big-word",
        ".hero-corner-name",
        ".hero-bottom-right",
        ".scroll-hint",
      ],
      {
        opacity: 1,
        y: 0,
        x: 0,
      },
    );

    // Scroll-reactive: FULLSTACK geser ke kiri, DEVELOPER geser ke kanan,
    // teks & button geser turun. scrub:true = nempel 1:1 ke posisi scroll.
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    scrollTl
      .to(
        '.hero-big-word[data-word="left"]',
        { x: "-30vw", opacity: 0, ease: "none" },
        0,
      )
      .to(
        '.hero-big-word[data-word="right"]',
        { x: "30vw", opacity: 0, ease: "none" },
        0,
      )
      .to(".hero-corner-name", { y: 60, opacity: 0, ease: "none" }, 0)
      .to(".hero-bottom-right", { y: 60, opacity: 0, ease: "none" }, 0)
      .to(".scroll-hint", { opacity: 0, ease: "none" }, 0);

    return () => {
      scrollTl.scrollTrigger?.kill();
      scrollTl.kill();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh", background: "#FAFAFA" }}
    >
      {/* Visually hidden h1 for SEO & screen readers — no visual change */}
      <h1 className="sr-only">
        Athallah Muhammad Syaffa — Fullstack Developer
      </h1>

      {/* ── BACKGROUND PHOTO ── */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/images/hero-bg.jpeg"
          alt=""
          aria-hidden
          fill
          priority
          quality={85}
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "80% center",
            filter: "grayscale(100%) brightness(0.55) contrast(1.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top right, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.75) 30%, transparent 65%), radial-gradient(ellipse 80% 90% at 55% 40%, transparent 20%, rgba(0,0,0,0.7) 100%)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── GIANT EDITORIAL TITLE ── */}
      <div
        className="hero-title-wrap absolute inset-x-0"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          padding: "0 clamp(24px, 4vw, 64px)",
          pointerEvents: "none",
        }}
      >
        {["FULLSTACK", "DEVELOPER"].map((word) => (
          <div key={word} style={{ overflow: "hidden", lineHeight: 0.9 }}>
            <span
              className="hero-big-word"
              data-word={word === "FULLSTACK" ? "left" : "right"}
              style={{
                display: "block",
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(68px, 14vw, 200px)",
                lineHeight: 0.9,
                letterSpacing: "-0.01em",
                color: "#ffffff",
                mixBlendMode: "difference",
                textTransform: "uppercase",
                userSelect: "none",
              }}
            >
              {word}
            </span>
          </div>
        ))}
      </div>

      {/* ── BOTTOM-LEFT: name + bio with BorderGlow ── */}
      <BorderGlow
        className="hero-corner-name absolute cursor-default"
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#0A0A0C"
        borderRadius={8}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={18}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
        fillOpacity={0}
        style={{
          bottom: "clamp(40px, 6vh, 72px)",
          left: "clamp(24px, 4vw, 64px)",
          zIndex: 20,
          maxWidth: "360px",
          position: "absolute",
        }}
      >
        <div style={{ padding: "16px 20px" }}>
          <p
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              marginBottom: "8px",
            }}
          >
            Athallah Muhammad Syaffa
          </p>
          <p
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: "13px",
              fontWeight: 400,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
            }}
          >
            Building end-to-end web applications — solid backend with{" "}
            <strong style={{ fontWeight: 600, color: "#FFFFFF" }}>
              Laravel
            </strong>{" "}
            &amp; smooth interfaces with{" "}
            <strong style={{ fontWeight: 600, color: "#FFFFFF" }}>
              React
            </strong>
            .
          </p>
        </div>
      </BorderGlow>

      {/* ── BOTTOM-RIGHT: CTA buttons ── */}
      <div
        className="hero-bottom-right absolute flex items-center gap-5"
        style={{
          bottom: "clamp(40px, 6vh, 72px)",
          right: "clamp(24px, 4vw, 64px)",
          zIndex: 20,
        }}
      >
        <a
          href="#projects"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 26px",
            background: "#ffffff",
            color: "#080808",
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            borderRadius: "4px",
            transition: "background-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "var(--primary-hover)";
            el.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "#FFFFFF";
            el.style.color = "#080808";
          }}
        >
          View Work →
        </a>
        <a
          href="https://github.com/athallahsy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#ffffff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255,255,255,0.85)")
          }
        >
          GitHub ↗
        </a>
      </div>

      {/* ── SCROLL HINT ── */}
      <div
        className="scroll-hint absolute flex items-center gap-[14px]"
        style={{
          bottom: "clamp(40px, 6vh, 72px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          opacity: 0,
        }}
      >
        <svg
          width="2"
          height="40"
          viewBox="0 0 2 40"
          fill="none"
          aria-hidden="true"
          className="scroll-hint-svg"
        >
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="40"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1.5"
          />
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="40"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
            strokeDasharray="16 24"
            className="scroll-hint-animated-line"
          />
        </svg>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#FFFFFF",
          }}
        >
          Scroll
        </span>
      </div>

      {/* ── OPEN TO WORK BADGE (Crisp technical pill, no fuzzy neon glow) ── */}
      <div
        className="hero-open-to-work"
        style={{
          position: "absolute",
          top: "clamp(90px, 10vh, 120px)",
          right: "clamp(24px, 4vw, 64px)",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#121214",
          border: "1px solid #27272A",
          borderRadius: "6px",
          padding: "7px 14px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#10B981",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-space-grotesk)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#FFFFFF",
          }}
        >
          Open to Work
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        .scroll-hint-animated-line {
          animation: scrollDashAnim 1.8s linear infinite;
        }

        @keyframes scrollDashAnim {
          0%   { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: -40; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.15); }
        }

        @media (prefers-reduced-motion: reduce) {
          .scroll-hint-animated-line { animation: none !important; stroke-dashoffset: 0; opacity: 0.6; }
          .hero-status-dot  { animation: none !important; }
        }

        /* Mobile adjustments */
        @media (max-width: 640px) {
          .hero-bottom-right { flex-direction: column; align-items: flex-end; gap: 12px !important; }
          .hero-corner-name  { max-width: 240px !important; }
          .hero-open-to-work { top: 72px !important; right: 16px !important; }
          .hero-corner-name  { left: 20px !important; bottom: 100px !important; max-width: calc(100vw - 40px) !important; }
          .hero-bottom-right { right: 20px !important; bottom: 24px !important; }
          .scroll-hint       { display: none !important; }
        }
      `}</style>
    </section>
  );
}
