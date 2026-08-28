"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type NavState = "hero" | "hidden" | "visible";

const LINKS = [
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "Contact", id: "contact" },
];

const parseRgba = (str: string) => {
  const match = str.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\)/,
  );
  if (!match) return null;
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  };
};

const luminance = (r: number, g: number, b: number) => {
  const norm = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * norm[0] + 0.7152 * norm[1] + 0.0722 * norm[2];
};

const sampleAt = (x: number, y: number): number | null => {
  let el = document.elementFromPoint(x, y) as HTMLElement | null;
  while (el) {
    const bg = window.getComputedStyle(el).backgroundColor;
    const parsed = parseRgba(bg);
    if (parsed && parsed.a > 0) {
      return luminance(parsed.r, parsed.g, parsed.b);
    }
    el = el.parentElement;
  }
  return null;
};

export default function Nav() {
  const [navState, setNavState] = useState<NavState>("hero");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState("");
  const [activeId, setActiveId] = useState("");
  const [lightness, setLightness] = useState(0);

  const pillRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const smoothedLightness = useRef(0);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    let scrollCount = 0;
    const SAMPLE_EVERY = 3;

    const targetLightness = { current: 0 };
    let smoothRafId: number | null = null;

    const tick = () => {
      const current = smoothedLightness.current;
      const target = targetLightness.current;
      const next = current + (target - current) * 0.08;
      smoothedLightness.current = next;
      setLightness(next);
      if (Math.abs(target - next) > 0.002) {
        smoothRafId = requestAnimationFrame(tick);
      } else {
        smoothRafId = null;
      }
    };

    const startSmoothing = () => {
      if (smoothRafId === null) smoothRafId = requestAnimationFrame(tick);
    };

    const processScroll = () => {
      const y = window.scrollY;

      if (y < 80) setNavState("hero");
      else if (y > lastY) setNavState("hidden");
      else setNavState("visible");

      lastY = y;

      if (y >= 80) {
        scrollCount++;
        if (scrollCount % SAMPLE_EVERY === 0) {
          const sampleX = Math.max(window.innerWidth - 120, 0);
          const sampleY = 40;
          const result = sampleAt(sampleX, sampleY);
          if (result !== null) {
            targetLightness.current = result;
            startSmoothing();
          }
        }
      }

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(processScroll);
    };

    processScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (smoothRafId !== null) cancelAnimationFrame(smoothRafId);
    };
  }, []);

  useEffect(() => {
    if (navState === "hidden") {
      const id = setTimeout(() => setIsMobileMenuOpen(false), 0);
      return () => clearTimeout(id);
    }
  }, [navState]);

  useEffect(() => {
    const sections = LINKS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;

        const best = visible.reduce((a, b) =>
          Math.abs(a.boundingClientRect.top) <
          Math.abs(b.boundingClientRect.top)
            ? a
            : b,
        );

        setActiveId(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const indicatorTargetId = hoveredId || activeId;

  useGSAP(
    () => {
      const targetEl = linkRefs.current[indicatorTargetId];
      const pillEl = pillRef.current;
      const indicatorEl = indicatorRef.current;

      if (!targetEl || !pillEl || !indicatorEl || !indicatorTargetId) {
        if (indicatorEl) gsap.to(indicatorEl, { opacity: 0, duration: 0.2 });
        return;
      }

      const pillRect = pillEl.getBoundingClientRect();
      const linkRect = targetEl.getBoundingClientRect();

      const targetX = linkRect.left - pillRect.left;
      gsap.to(indicatorEl, {
        x: targetX,
        width: linkRect.width,
        opacity: 1,
        duration: 0.35,
        ease: "power3.out",
      });
    },
    { dependencies: [indicatorTargetId], scope: pillRef },
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const isHero = navState === "hero";
  const isHidden = navState === "hidden";

  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  const mixRgb = (
    c1: [number, number, number],
    c2: [number, number, number],
    t: number,
  ) =>
    `rgb(${Math.round(mix(c1[0], c2[0], t))}, ${Math.round(mix(c1[1], c2[1], t))}, ${Math.round(mix(c1[2], c2[2], t))})`;

  const t = lightness;

  const navColors = {
    text: mixRgb([255, 255, 255], [10, 10, 10], t),
    pillBg: `rgba(${Math.round(mix(255, 10, t))}, ${Math.round(mix(255, 10, t))}, ${Math.round(mix(255, 10, t))}, ${mix(0.12, 0.55, t)})`,
    pillBorder: `1px solid rgba(${Math.round(mix(255, 0, t))}, ${Math.round(mix(255, 0, t))}, ${Math.round(mix(255, 0, t))}, ${mix(0.2, 0.06, t)})`,
    pillShadow: `0 4px 32px rgba(0, 0, 0, ${mix(0.08, 0.18, t)}), inset 0 1px 0 rgba(255,255,255,${mix(0.18, 0.03, t)})`,
    pillContentText: mixRgb([10, 10, 10], [255, 255, 255], t),
  };

  const sharedTransition: React.CSSProperties = {
    opacity: isHidden ? 0 : 1,
    transform: isHidden ? "translateY(-20px)" : "translateY(0)",
    transition:
      navState === "visible"
        ? "opacity 0.25s ease-out, transform 0.25s ease-out"
        : "opacity 0.3s ease, transform 0.3s ease",
  };

  return (
    <>
      <a
        href="#hero"
        onClick={(e) => handleClick(e, "hero")}
        style={{
          position: "fixed",
          top: "24px",
          left: "clamp(24px, 6vw, 96px)",
          zIndex: 1000,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textDecoration: "none",
          cursor: "pointer",
          ...sharedTransition,
        }}
      >
        <span style={{ color: isHero ? "#FFFFFF" : navColors.text }}>
          Athallah
        </span>
        <span style={{ color: "var(--primary)" }}>sy</span>
      </a>

      <nav
        ref={pillRef}
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: "24px",
          right: "clamp(24px, 6vw, 96px)",
          zIndex: 1000,
          alignItems: "center",
          gap: "4px",
          background: isHero ? "transparent" : navColors.pillBg,
          backdropFilter: isHero ? "none" : "blur(28px) saturate(180%)",
          WebkitBackdropFilter: isHero ? "none" : "blur(28px) saturate(180%)",
          border: isHero ? "1px solid transparent" : navColors.pillBorder,
          boxShadow: isHero ? "none" : navColors.pillShadow,
          borderRadius: "999px",
          padding: "6px",
          transition: "backdrop-filter 0.3s ease",
          ...sharedTransition,
        }}
      >
        {/* ── TECHNICAL SCOPE / VIEWFINDER SLIDING INDICATOR ── */}
        <div
          ref={indicatorRef}
          style={{
            position: "absolute",
            top: "5px",
            left: 0,
            height: "calc(100% - 10px)",
            width: 0,
            opacity: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {/* Inner Dashed Capsule Box */}
          <div
            style={{
              position: "absolute",
              inset: "2px",
              borderRadius: "6px",
              border: "1px dashed rgba(255, 255, 255, 0.45)",
              background: "rgba(10, 10, 12, 0.75)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
            }}
          />

          {/* 4 Corner Viewfinder Brackets */}
          {/* Top-Left: ┌ */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "6px",
              height: "6px",
              borderTop: "1.5px solid #FFFFFF",
              borderLeft: "1.5px solid #FFFFFF",
              borderRadius: "1px",
            }}
          />
          {/* Top-Right: ┐ */}
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "6px",
              height: "6px",
              borderTop: "1.5px solid #FFFFFF",
              borderRight: "1.5px solid #FFFFFF",
              borderRadius: "1px",
            }}
          />
          {/* Bottom-Left: └ */}
          <span
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "6px",
              height: "6px",
              borderBottom: "1.5px solid #FFFFFF",
              borderLeft: "1.5px solid #FFFFFF",
              borderRadius: "1px",
            }}
          />
          {/* Bottom-Right: ┘ */}
          <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "6px",
              height: "6px",
              borderBottom: "1.5px solid #FFFFFF",
              borderRight: "1.5px solid #FFFFFF",
              borderRadius: "1px",
            }}
          />
        </div>

        {LINKS.map(({ label, id }) => {
          const isHighlighted = indicatorTargetId === id;
          const isContact = id === "contact";

          return (
            <a
              key={id}
              ref={(el) => {
                linkRefs.current[id] = el;
              }}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId("")}
              style={{
                position: "relative",
                zIndex: 1,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "12px",
                fontWeight: isContact ? 700 : 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isHighlighted
                  ? "#FFFFFF"
                  : isContact
                    ? "var(--primary)"
                    : isHero
                      ? "#AAAAAA"
                      : navColors.pillContentText,
                cursor: "pointer",
                padding: "8px 18px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
                border:
                  isContact && !isHighlighted
                    ? "1px solid var(--primary-border)"
                    : "1px solid transparent",
                transition: "color 0.2s ease, border-color 0.2s ease",
              }}
            >
              {label}
            </a>
          );
        })}
      </nav>

      <div
        className="flex md:hidden"
        style={{
          position: "fixed",
          top: "24px",
          right: "clamp(24px, 6vw, 96px)",
          zIndex: 1000,
          ...sharedTransition,
        }}
      >
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            background: isHero ? "transparent" : navColors.pillBg,
            backdropFilter: isHero ? "none" : "blur(28px) saturate(180%)",
            WebkitBackdropFilter: isHero ? "none" : "blur(28px) saturate(180%)",
            border: isHero ? "1px solid transparent" : navColors.pillBorder,
            boxShadow: isHero ? "none" : navColors.pillShadow,
            borderRadius: "999px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            style={{ color: isHero ? "#FFFFFF" : navColors.pillContentText }}
          >
            <line
              x1="2"
              y1={isMobileMenuOpen ? 3 : 4}
              x2="14"
              y2={isMobileMenuOpen ? 13 : 4}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transformOrigin: "50% 50%",
                transform: isMobileMenuOpen ? "rotate(45deg)" : "none",
                transition:
                  "transform 0.25s ease, y1 0.25s ease, y2 0.25s ease",
              }}
            />
            <line
              x1="2"
              y1={isMobileMenuOpen ? 13 : 12}
              x2="14"
              y2={isMobileMenuOpen ? 3 : 12}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transformOrigin: "50% 50%",
                transform: isMobileMenuOpen ? "rotate(-45deg)" : "none",
                transition:
                  "transform 0.25s ease, y1 0.25s ease, y2 0.25s ease",
              }}
            />
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav-menu"
        aria-hidden={!isMobileMenuOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(8, 8, 8, 0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "32px",
          opacity: isMobileMenuOpen ? 1 : 0,
          transform: isMobileMenuOpen ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
        }}
      >
        {LINKS.map(({ label, id }) => {
          const isContact = id === "contact";
          const isActive = activeId === id;

          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "20px",
                fontWeight: isContact ? 700 : 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isContact
                  ? "var(--primary)"
                  : isActive
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.7)",
                paddingBottom: "2px",
                cursor: "pointer",
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            >
              {label}
            </a>
          );
        })}
      </div>
    </>
  );
}
