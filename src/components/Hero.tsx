"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

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
              "radial-gradient(ellipse 80% 90% at 55% 40%, transparent 30%, rgba(0,0,0,0.55) 100%)",
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
          overflow: "hidden",
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

      {/* ── BOTTOM-LEFT: name + bio ── */}
      <div
        className="hero-corner-name absolute"
        style={{
          bottom: "clamp(40px, 6vh, 72px)",
          left: "clamp(24px, 4vw, 64px)",
          zIndex: 20,
          maxWidth: "340px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "clamp(10px, 3vw, 11px)",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.45)",
            marginBottom: "10px",
          }}
        >
          Athallah Muhammad Syaffa
        </p>
        <p
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "clamp(12px, 3.5vw, 13px)",
            fontWeight: 300,
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.55)",
            maxWidth: "280px",
          }}
        >
          Building end-to-end web applications — solid backend with{" "}
          <strong style={{ fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
            Laravel
          </strong>{" "}
          &amp; smooth interfaces with{" "}
          <strong style={{ fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
            React
          </strong>
          .
        </p>
      </div>

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
            padding: "13px 28px",
            background: "#ffffff",
            color: "#080808",
            fontFamily: "var(--font-jakarta)",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "opacity 0.25s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
          }
        >
          View Work →
        </a>
        <a
          href="https://github.com/athallahsy"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            transition: "color 0.25s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#ffffff")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color =
              "rgba(255,255,255,0.5)")
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
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "rgba(255,255,255,0.3)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="scroll-hint-line"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.8)",
              animation: "scrollLineAnim 1.8s ease-in-out infinite",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Scroll
        </span>
      </div>

      {/* ── OPEN TO WORK BADGE ── */}
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
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          padding: "8px 16px",
        }}
      >
        <span
          className="hero-status-dot"
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80",
            flexShrink: 0,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-jakarta)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Open to Work
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes scrollLineAnim {
          0%   { transform: translateY(-100%); opacity: 1; }
          80%  { transform: translateY(100%);  opacity: 0.4; }
          100% { transform: translateY(100%);  opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* Respect the OS-level reduced-motion preference: freeze the two
           looping micro-animations instead of running them indefinitely. */
        @media (prefers-reduced-motion: reduce) {
          .scroll-hint-line { animation: none !important; opacity: 0.6; }
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
