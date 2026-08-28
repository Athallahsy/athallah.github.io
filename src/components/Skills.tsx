"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  SiLaravel,
  SiReact,
  SiPhp,
  SiMysql,
  SiJavascript,
  SiTailwindcss,
  SiGit,
  SiFlutter,
  SiNextdotjs,
} from "react-icons/si";

// Breakpoint desktop vs mobile untuk pin & layout section ini. Disimpan
// sebagai satu konstanta biar query "min-width" dan "max-width" di bawah
// selalu sinkron (satu angka lebih tinggi dari yang lain, gak akan ke-skip
// atau tumpang tindih kalau suatu saat diubah).
const DESKTOP_BREAKPOINT_PX = 1024;

const STACK = [
  {
    num: "01",
    name: "Laravel",
    category: "Framework",
    status: "mastered",
    Icon: SiLaravel,
  },
  {
    num: "02",
    name: "React",
    category: "Library",
    status: "mastered",
    Icon: SiReact,
  },
  {
    num: "03",
    name: "PHP",
    category: "Language",
    status: "mastered",
    Icon: SiPhp,
  },
  {
    num: "04",
    name: "MySQL",
    category: "Database",
    status: "mastered",
    Icon: SiMysql,
  },
  {
    num: "05",
    name: "JavaScript",
    category: "Language",
    status: "mastered",
    Icon: SiJavascript,
  },
  {
    num: "06",
    name: "Tailwind CSS",
    category: "Styling",
    status: "mastered",
    Icon: SiTailwindcss,
  },
  {
    num: "07",
    name: "Git",
    category: "Version Control",
    status: "mastered",
    Icon: SiGit,
  },
  {
    num: "08",
    name: "Flutter",
    category: "Mobile",
    status: "mastered",
    Icon: SiFlutter,
  },
  {
    num: "09",
    name: "Next.js",
    category: "Framework",
    status: "learning",
    Icon: SiNextdotjs,
  },
];

// Animasi header (badge/heading/desc) + grid item — sama persis dipakai
// buat breakpoint desktop maupun mobile, jadi ditaruh di satu fungsi biar
// gak ada 2 salinan logic yang harus disinkronin manual tiap kali diubah.
function animateHeaderAndGrid() {
  const badge = document.querySelector<HTMLElement>("#skills .ts-badge");
  const headingLines = Array.from(
    document.querySelectorAll<HTMLElement>("#skills .ts-heading-line"),
  );
  const desc = document.querySelector<HTMLElement>("#skills .ts-desc");

  const headerTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#skills",
      start: "top 85%",
      end: "top 55%",
      scrub: 0.8,
    },
  });
  if (badge) {
    gsap.set(badge, { opacity: 0, y: 24 });
    headerTl.to(badge, { opacity: 1, y: 0, ease: "power2.out" }, 0);
  }
  headingLines.forEach((line, i) => {
    gsap.set(line, { opacity: 0, y: 60 });
    headerTl.to(line, { opacity: 1, y: 0, ease: "power3.out" }, i * 0.12);
  });
  if (desc) {
    gsap.set(desc, { opacity: 0, y: 28 });
    headerTl.to(desc, { opacity: 1, y: 0, ease: "power2.out" }, 0.25);
  }

  const items = Array.from(
    document.querySelectorAll<HTMLElement>("#skills .ts-item"),
  );
  const grid = document.querySelector<HTMLElement>("#skills .ts-grid");

  if (grid && items.length) {
    gsap.set(items, { opacity: 0, y: 24 });

    const gridTl = gsap.timeline({
      scrollTrigger: {
        trigger: grid,
        start: "top 80%",
        end: "top 40%",
        scrub: 0.6,
      },
    });

    items.forEach((item, i) => {
      gridTl.to(
        item,
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 },
        i * 0.15,
      );
    });
  }
}

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Watermark parallax — jalan di semua breakpoint, gerak halus & lambat
    // ngikutin scroll (bukan animasi looping, jadi gak nambah beban RAF
    // terus-menerus selama section di-pin).
    mm.add("all", () => {
      const watermark = document.querySelector<HTMLElement>(
        "#skills .ts-watermark",
      );
      if (!watermark) return;

      gsap.to(watermark, {
        x: "-4vw",
        y: "-3vw",
        ease: "none",
        scrollTrigger: {
          trigger: "#skills",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    mm.add(`(min-width: ${DESKTOP_BREAKPOINT_PX}px)`, () => {
      // Pin #skills at top top until #projects overlays it — cuma perilaku
      // ini yang beda dari versi mobile, jadi ditaruh di luar fungsi shared.
      ScrollTrigger.create({
        trigger: "#skills",
        start: "top top",
        endTrigger: "#projects",
        end: "top top",
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });

      animateHeaderAndGrid();
    });

    mm.add(`(max-width: ${DESKTOP_BREAKPOINT_PX - 1}px)`, () => {
      animateHeaderAndGrid();
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      mm.revert();
    };
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="lg:h-screen lg:flex lg:flex-col lg:justify-center"
      style={{
        background: "#080808",
        padding: "120px 64px",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Watermark */}
      <span
        aria-hidden
        className="ts-watermark"
        style={{
          position: "absolute",
          bottom: "-0.05em",
          right: "-0.05em",
          fontSize: "clamp(120px, 18vw, 220px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "#FFFFFF",
          opacity: 0.04,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "var(--font-anton)",
          zIndex: 0,
        }}
      >
        TOOLS
      </span>

      {/* ── Two-column layout ─────────────────────────────────── */}
      <div
        className="ts-columns relative z-10 max-w-[1280px] mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "80px",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Heading + Desc ──────────────── */}
        <div>
          {/* Heading */}
          <h2 style={{ margin: 0, lineHeight: 0.88, marginBottom: 32 }}>
            <span
              className="ts-heading-line"
              style={{
                display: "block",
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(56px, 7vw, 100px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              TECH
            </span>
            <span
              className="ts-heading-line"
              style={{
                display: "block",
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(56px, 7vw, 100px)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              STACK
            </span>
          </h2>

          {/* Description */}
          <p
            className="ts-desc"
            style={{
              fontFamily: "var(--font-jakarta)",
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 1.85,
              color: "#94A3B8",
              maxWidth: 340,
              margin: 0,
            }}
          >
            A curated collection of modern technologies I use to build scalable
            web applications — from backend logic to interactive user
            interfaces.
          </p>
        </div>

        {/* ── RIGHT: 9-item grid (3 col × 3 row) ─────────── */}
        <div
          className="ts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {STACK.map((item, i) => {
            const isLearning = item.status === "learning";
            const col = i % 3;
            const row = Math.floor(i / 3);
            const totalRows = Math.ceil(STACK.length / 3);
            const isLastRow = row === totalRows - 1;
            const isLastCol = col === 2;
            const isHovered = hoveredIdx === i;
            const { Icon } = item;

            return (
              <div
                key={item.name}
                className="ts-item"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  padding: "28px 28px 24px",
                  borderBottom: isLastRow ? "none" : "1px solid #27272A",
                  borderRight: isLastCol ? "none" : "1px solid #27272A",
                  position: "relative",
                  cursor: "default",
                }}
              >
                {/* Icon */}
                <div style={{ marginBottom: 14 }}>
                  <Icon
                    style={{
                      fontSize: 20,
                      color: isHovered ? "var(--primary-hover)" : "#94A3B8",
                      opacity: isLearning ? 0.35 : 1,
                      transition: "color 0.3s ease, opacity 0.3s ease",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Name */}
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: "clamp(15px, 1.5vw, 20px)",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: isLearning ? "#71717A" : "#FFFFFF",
                    marginBottom: 5,
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </span>

                {/* Category */}
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-space-grotesk)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.08em",
                    color: "#71717A",
                    textTransform: "uppercase",
                  }}
                >
                  {item.category}
                </span>

                {/* Learning badge */}
                {isLearning && (
                  <span
                    style={{
                      position: "absolute",
                      top: 28,
                      right: 20,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#A1A1AA",
                      border: "1px dashed #3F3F46",
                      padding: "3px 7px",
                      borderRadius: "2px",
                      fontFamily: "var(--font-space-grotesk)",
                    }}
                  >
                    LEARNING
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsive: stack vertically on mobile */}
      <style>{`
        @media (max-width: 1023px) {
          #skills .ts-columns {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
        @media (max-width: 767px) {
          #skills {
            padding: 72px 24px !important;
          }
          #skills .ts-columns {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          #skills .ts-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 400px) {
          #skills .ts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
