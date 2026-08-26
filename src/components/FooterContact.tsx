"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/* ─────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────── */
const IconGithub = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedin = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ROTATING_WORDS = ["build", "ship", "grow", "create", "launch"];

// Kata terpanjang di ROTATING_WORDS dipakai buat nentuin lebar minimum
// slot rotasi, biar kata sepanjang apapun ("launch" vs "ship") gak bikin
// teks di sebelahnya kedorong/geser pas gonta-ganti.
const LONGEST_WORD_LENGTH = Math.max(
  ...ROTATING_WORDS.map((word) => word.length),
);

function RotatingWord({ reduceMotion }: { reduceMotion: boolean }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const nextRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % ROTATING_WORDS.length;
      const next = ROTATING_WORDS[indexRef.current];
      const cur = currentRef.current;
      const nxt = nextRef.current;
      if (!cur || !nxt) return;

      // Prep next word (invisible below)
      nxt.textContent = next;
      gsap.set(nxt, { y: "100%", opacity: 0 });

      const tl = gsap.timeline();
      // Slide current out upward
      tl.to(
        cur,
        { y: "-100%", opacity: 0, duration: 0.45, ease: "power3.in" },
        0,
      )
        // Slide next in from below
        .to(
          nxt,
          { y: "0%", opacity: 1, duration: 0.45, ease: "power3.out" },
          0.05,
        )
        .call(() => {
          // Swap roles: update current text, reset positions
          cur.textContent = next;
          gsap.set(cur, { y: "0%", opacity: 1 });
          gsap.set(nxt, { y: "100%", opacity: 0 });
        });
    }, 2000);

    return () => clearInterval(id);
  }, [reduceMotion]);

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center overflow-hidden"
      style={{
        height: "1em",
        lineHeight: 1,
        verticalAlign: "-0.08em",
        minWidth: `${LONGEST_WORD_LENGTH + 0.5}ch`,
      }}
    >
      {/* Current word */}
      <span
        ref={currentRef}
        className="inline-block will-change-transform"
        style={{ fontStyle: "normal", color: "var(--primary)" }}
      >
        {ROTATING_WORDS[0]}
      </span>
      {/* Next word (hidden, ready to slide in) */}
      <span
        ref={nextRef}
        aria-hidden="true"
        className="absolute left-0 top-0 inline-block will-change-transform"
        style={{
          opacity: 0,
          transform: "translateY(100%)",
          color: "var(--primary)",
        }}
      >
        {ROTATING_WORDS[1]}
      </span>
    </span>
  );
}

const CONTACT_COLUMNS = [
  {
    label: "Email",
    value: "athallahmsyaffa@gmail.com",
    href: "mailto:athallahmsyaffa@gmail.com",
    target: undefined as string | undefined,
  },
  {
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    href: "https://wa.me/6283192511946",
    target: "_blank",
  },
];

const SOCIAL_ICONS = [
  { Icon: IconGithub, href: "https://github.com/athallahsy", label: "GitHub" },
  {
    Icon: IconLinkedin,
    href: "https://linkedin.com/in/athallahsy",
    label: "LinkedIn",
  },
];

const MENU_LINKS = [
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
];

export default function FooterContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setReduceMotion(
        (e as MediaQueryListEvent).matches ?? motionQuery.matches,
      );
    // Set initial value via the change handler to satisfy lint
    onChange(motionQuery);
    motionQuery.addEventListener(
      "change",
      onChange as (e: MediaQueryListEvent) => void,
    );
    return () =>
      motionQuery.removeEventListener(
        "change",
        onChange as (e: MediaQueryListEvent) => void,
      );
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(
          [".fc-headline", ".fc-contact-col", ".fc-menu-row", ".fc-wordmark"],
          {
            opacity: 1,
            y: 0,
          },
        );
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: "top 82%", once: true },
        defaults: { ease: "power3.out" },
      });

      tl.fromTo(
        ".fc-headline",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        0,
      )
        .fromTo(
          ".fc-contact-col",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          0.35,
        )
        .fromTo(
          ".fc-menu-row",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0.55,
        )
        .fromTo(
          ".fc-wordmark",
          { opacity: 0 },
          { opacity: 1, duration: 1.0 },
          0.45,
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
      id="contact"
      className="relative w-full overflow-hidden"
      style={{ background: "#080808", color: "#ffffff" }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-8 md:px-12 pt-14 pb-0">
        {/* ── HEADLINE ── */}
        <div className="fc-headline mb-10">
          <h2
            style={{
              fontFamily: "var(--font-jakarta)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              margin: 0,
            }}
          >
            {/* Line 1: "Let's {rotating word}" */}
            <span
              className="inline-flex items-center gap-2"
              style={{ color: "#ffffff" }}
            >
              <span>Let&apos;s</span>
              <RotatingWord reduceMotion={reduceMotion} />
            </span>
            {/* Line 2: "great products together." */}
            <span
              className="block"
              style={{ color: "rgba(255,255,255,0.38)", fontStyle: "normal" }}
            >
              great products together.
            </span>
          </h2>
        </div>

        {/* ── CONTACT ROW ── */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 mb-8">
          {CONTACT_COLUMNS.map(({ label, value, href, target }) => (
            <div className="fc-contact-col" key={label}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 10,
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {label}
              </div>
              <a
                href={href}
                target={target}
                rel={target ? "noreferrer" : undefined}
                className="inline-block rounded-sm outline-none transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-60 focus-visible:ring-1 focus-visible:ring-white/40"
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#ffffff",
                  textDecoration: "none",
                  fontFamily: "var(--font-jakarta)",
                }}
              >
                {value}
              </a>
            </div>
          ))}

          {/* Social column */}
          <div className="fc-contact-col">
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 10,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Social
            </div>
            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center rounded-full outline-none transition-colors duration-200 bg-white/10 hover:bg-white/25 focus-visible:bg-white/25 focus-visible:ring-1 focus-visible:ring-white/40"
                  style={{
                    width: 36,
                    height: 36,
                    color: "#ffffff",
                    textDecoration: "none",
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.1)",
            marginBottom: 18,
          }}
        />

        {/* ── MENU + COPYRIGHT ROW ── */}
        <div className="fc-menu-row grid grid-cols-1 gap-6 sm:grid-cols-3 pb-8">
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 10,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Menu
            </div>
            <div className="flex items-center gap-6">
              {MENU_LINKS.map(({ label, id }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-block rounded-sm outline-none transition-opacity duration-200 hover:opacity-50 focus-visible:opacity-50 focus-visible:ring-1 focus-visible:ring-white/40"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    textDecoration: "none",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 10,
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Location
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#ffffff",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Bogor, Indonesia (GMT+7)
            </span>
          </div>

          <div
            className="flex items-end justify-start sm:justify-end"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-jakarta)",
            }}
          >
            © {new Date().getFullYear()} Athallah Muhammad Syaffa
          </div>
        </div>
      </div>

      {/* ── GIANT WORDMARK ── */}
      <div className="fc-wordmark relative mt-3 select-none">
        <div
          className="relative overflow-hidden"
          style={{
            height: "0.74em",
            fontSize: "clamp(2.8rem, 11vw, 9rem)",
          }}
        >
          {/* Sharp layer */}
          <div
            className="relative z-20 whitespace-nowrap text-center font-bold uppercase tracking-[-0.04em] leading-[0.88]"
            style={{
              color: "#fff",
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0%, #000 58%, transparent 82%)",
              maskImage:
                "linear-gradient(to bottom, #000 0%, #000 58%, transparent 82%)",
            }}
          >
            BUILT BY ATHALLAH.{" "}
          </div>

          {/* Blur layer */}
          <div
            aria-hidden
            className="absolute inset-0 z-10 whitespace-nowrap text-center font-bold uppercase tracking-[-0.04em] leading-[0.88]"
            style={{
              color: "#fff",
              filter: "blur(12px)",
              opacity: 0.95,
              transform: "translateY(2px)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 45%, #000 68%, #000 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 45%, #000 68%, #000 100%)",
            }}
          >
            BUILT BY ATHALLAH.{" "}
          </div>
        </div>
      </div>
    </footer>
  );
}
