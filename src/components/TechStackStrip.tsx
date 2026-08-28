"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Laravel",
  "PHP",
  "MySQL",
  "TailwindCSS",
  "Node.js",
  "Git",
  "REST API",
  "JavaScript",
  "HTML5 · CSS3",
];

// Duplicate enough times so there's always content visible when scrolling
const ITEMS = [...STACK, ...STACK, ...STACK, ...STACK];

// Separator dot between items
const SEP = "\u00B7";

export default function TechStackStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Measure one full copy width (4 copies rendered)
    const singleWidth = track.scrollWidth / 4;

    // Start offset so items are visible immediately
    let xPos = -singleWidth;

    // --- Motion constants ---
    const BASE_SPEED = 0.35; // px/frame when idle — feels slow, calm
    const MAX_BOOST = 5.5; // max extra px/frame from scroll
    let scrollBoost = 0; // can be negative (scroll up reverses direction)
    let lastDirection = 1; // 1 = kanan, -1 = kiri

    // --- ScrollTrigger: read scroll velocity + direction ---
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const rawVel = self.getVelocity(); // px/s, signed
        const dir = self.direction; // 1 = down, -1 = up

        if (Math.abs(rawVel) > 100) {
          lastDirection = dir;
        }

        // Normalize to 0-1 based on a 1500px/s "full speed" scroll
        const normalised = Math.min(Math.abs(rawVel) / 1500, 1);
        scrollBoost = dir * normalised * MAX_BOOST;
      },
    });

    // --- RAF loop: only runs when section is visible ---
    const tick = () => {
      // Decay scrollBoost toward 0 each frame (smooth return to base speed)
      scrollBoost *= 0.92;

      const totalSpeed = BASE_SPEED * lastDirection + scrollBoost;
      xPos += totalSpeed;

      // Seamless loop in both directions
      if (xPos > 0) xPos -= singleWidth;
      if (xPos < -singleWidth * 2) xPos += singleWidth;

      gsap.set(track, { x: xPos });

      rafRef.current = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const stopAnimation = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // IntersectionObserver: start/stop animation when section is in/out of view
    const section = track.closest("section");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { rootMargin: "200px" },
    );
    if (section) io.observe(section);

    return () => {
      st.kill();
      io.disconnect();
      stopAnimation();
    };
  }, []);

  return (
    <section
      id="tech-strip"
      aria-label="Tech Stack"
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "28px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Edge fade masks */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background:
            "linear-gradient(to right, var(--bg) 0%, transparent 8%, transparent 92%, var(--bg) 100%)",
        }}
      />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          whiteSpace: "nowrap",
          willChange: "transform",
          userSelect: "none",
        }}
      >
        {ITEMS.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "28px",
              padding: "0 28px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: "clamp(15px, 1.4vw, 20px)",
                fontWeight: 500,
                letterSpacing: "0.01em",
                color: "var(--text)",
                opacity: 0.82,
              }}
            >
              {item}
            </span>
            <span
              aria-hidden
              style={{
                fontSize: "10px",
                color: "var(--accent)",
                opacity: 0.5,
                lineHeight: 1,
              }}
            >
              {SEP}
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #tech-strip { padding: 20px 0 !important; }
        }
      `}</style>
    </section>
  );
}
