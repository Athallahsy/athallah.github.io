"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Aspect = "landscape" | "portrait";

type Project = {
  num: string;
  title: string;
  badge: string;
  tags: string[];
  desc: string;
  screenshot: string;
  aspect: Aspect;
  rotation: string;
  liveLink?: string;
  githubLink?: string;
};

const FEATURED_PROJECTS: Project[] = [
  {
    num: "01",
    title: "Finote",
    badge: "Web App · Personal Project · Live",
    tags: ["Laravel 12", "Sanctum", "Filament", "MySQL", "REST API"],
    desc: "A personal finance manager built API-first. Full REST API for transaction recording, financial categories, and monthly reports — secured with Laravel Sanctum. Complete admin panel via Filament, and PDF export for monthly financial reports.\n\nCovered by automated feature tests, and patched after a real security audit that fixed an IDOR vulnerability (users could access other users' data by changing an ID in the URL) — a story worth telling in interviews. A companion Flutter mobile app, built by a collaborator, consumes the same API.",
    screenshot: "/images/finote.png",
    aspect: "landscape",
    rotation: "-rotate-1.5",
    liveLink: "https://finote-production-eb03.up.railway.app",
    githubLink: "https://github.com/Athallahsy/finote",
  },
  {
    num: "02",
    title: "TaskFlow",
    badge: "Fullstack Web App · Personal Project · Live",
    tags: ["Node.js", "Express", "Sequelize", "MySQL", "React", "JWT"],
    desc: "A lightweight Trello/Jira-style project & task manager, built fullstack from scratch: a real REST API with JWT authentication and bcrypt-hashed passwords, backed by MySQL (TiDB Cloud) via Sequelize.\n\nFeatures a 3-column kanban board, per-project task CRUD, and a dashboard with live progress charts. Deployed as a Vercel serverless function on the backend, talking to a serverless cloud database over SSL — a genuinely modern deployment setup, not just a local demo.",
    screenshot: "/images/taskflow.png",
    aspect: "landscape",
    rotation: "rotate-2",
    liveLink: "https://taskflow-frontend-atha.vercel.app",
  },
  {
    num: "03",
    title: "AyamKu",
    badge: "Mobile · Personal Project · Flutter",
    tags: ["Flutter", "Dart", "Hive", "Provider", "fl_chart"],
    desc: "My father used to manage his chicken farm with handwritten notes — feed calculations, expenses, all on paper. I built him an Android app to replace that.\n\nAyamKu supports up to 3 coops, auto-calculates daily feed and water needs based on growth phase (Starter, Grower, Finisher), tracks income and expenses with weekly charts, and estimates profit/loss per harvest cycle. Designed with large text and minimal UI — because the user isn't a tech-savvy young person, it's my dad.",
    screenshot: "/images/ayamku.png",
    aspect: "portrait",
    rotation: "-rotate-2",
    githubLink: "https://github.com/Athallahsy/AyamKu",
  },
  {
    num: "04",
    title: "Herbal Qaf",
    badge: "Web · Family Business · Live",
    tags: ["Next.js", "Tailwind CSS", "Framer Motion", "RajaOngkir API"],
    desc: "My mother runs a herbal drink brand. Orders used to come in through scattered WhatsApp messages — slow and error-prone.\n\nI built a branded e-commerce website that handles the entire order flow: product selection → address input → automatic shipping cost via RajaOngkir API → a pre-filled WhatsApp message with complete order details. What used to take 10 back-and-forth messages now takes one click.",
    screenshot: "/images/herbal-qaf.png",
    aspect: "landscape",
    rotation: "rotate-3",
    liveLink: "https://herbal-qaf.vercel.app",
  },
  {
    num: "05",
    title: "Muhayya Fair 2025",
    badge: "Landing Page · Freelance · Live",
    tags: ["HTML", "CSS", "Bootstrap", "AOS"],
    desc: "Event landing page for SD Muhammadiyah Haijah Nurijah Banjarmasin — a real school event with a real deadline. Scroll animations via AOS, deployed to Vercel, used live during the event. Simple stack, real client, shipped on time.",
    screenshot: "/images/muhayya-fair.png",
    aspect: "landscape",
    rotation: "rotate-2",
    liveLink: "https://muhayya-fair.vercel.app",
  },
];

const ARCHIVE_PROJECTS = [
  {
    title: "Inkwell",
    desc: "Blog platform with role-based auth & editorial UI. Laravel · Breeze · MySQL · Blade",
    href: "https://github.com/Athallahsy/inkwell",
    label: "github.com/Athallahsy/inkwell",
  },
  {
    title: "Portfolio",
    desc: "This website. React · Tailwind CSS · Three.js · GSAP",
    href: "https://portofolio-eight-vert.vercel.app",
    label: "portofolio-eight-vert.vercel.app",
  },
];

// Technical Grid Blueprint Mark
function CoordinateCross({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// Small pill/chip used for tech tags and metadata
function Chip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="tag-chip inline-flex items-center whitespace-nowrap rounded px-2.5 py-1 border border-[#27272A] bg-[#121212] text-xs font-medium text-[#A1A1AA] transition-colors hover:border-[#3F3F46]"
      style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
    >
      {children}
    </span>
  );
}

export default function Projects() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cloudsRef = useRef<HTMLDivElement>(null);
  const airplaneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const mm = gsap.matchMedia();

    // Header eyebrow & title animations
    const eyebrowText = document.querySelector<HTMLElement>(
      "#projects .sec-eyebrow-text",
    );
    const eyebrowDash = document.querySelector<HTMLElement>(
      "#projects .sec-eyebrow-dash",
    );
    if (eyebrowText) {
      gsap.to(eyebrowText, {
        y: "0%",
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: "#projects", start: "top 83%" },
      });
    }
    if (eyebrowDash) {
      gsap.to(eyebrowDash, {
        scaleX: 1,
        duration: 0.5,
        ease: "power2.inOut",
        delay: 0.1,
        scrollTrigger: { trigger: "#projects", start: "top 83%" },
      });
    }

    document
      .querySelectorAll<HTMLElement>("#projects .sec-title .clip-inner")
      .forEach((line, i) => {
        gsap.to(line, {
          y: "0%",
          duration: 1.05,
          ease: "power4.out",
          delay: i * 0.07,
          scrollTrigger: { trigger: "#projects .sec-title", start: "top 83%" },
        });
      });

    type TrailDot = { x: number; y: number; timestamp: number };
    let trail: TrailDot[] = [];
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const renderTrail = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      trail = trail.filter((dot) => now - dot.timestamp < 800);
      trail.forEach((dot) => {
        const age = now - dot.timestamp;
        const life = age / 800;
        const opacity = 1 - life;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(3, 105, 161, ${opacity * 0.85})`;
        ctx.fill();
      });
    };

    gsap.ticker.add(renderTrail);

    mm.add("(min-width: 1024px)", () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      if (cloudsRef.current) {
        cloudsRef.current.style.width = `${track.scrollWidth}px`;
      }

      const resizeCanvas = () => {
        if (canvas) {
          canvas.width = track.scrollWidth;
          canvas.height = container.offsetHeight;
        }
      };
      resizeCanvas();

      type PathPoint = { x: number; y: number };
      const planeOffset = 60;

      const calculateDesktopPath = (): PathPoint[] => {
        const cards = Array.from(
          document.querySelectorAll<HTMLElement>(".featured-project-card"),
        );
        const containerHeight = container.offsetHeight || window.innerHeight;
        if (!cards.length) return [];

        const centerY = containerHeight * 0.5; // ← center vertically
        const waveAmplitude = containerHeight * 0.25; // ← ±25% amplitude

        const points: PathPoint[] = [
          {
            x: -100 - planeOffset,
            y: centerY - planeOffset, // ← start centered
          },
        ];

        cards.forEach((card, i) => {
          const cardLeft = card.offsetLeft;
          const cardWidth = card.offsetWidth;
          const centerX = cardLeft + cardWidth * 0.5;

          // Wave centered at 50% viewport height
          const y = centerY + Math.sin(i * 1.2) * waveAmplitude;

          points.push({
            x: centerX - planeOffset,
            y: y - planeOffset,
          });
        });

        const lastCard = cards[cards.length - 1];
        const endX =
          (lastCard
            ? lastCard.offsetLeft + lastCard.offsetWidth
            : track.scrollWidth) + 800;
        points.push({
          x: endX - planeOffset,
          y: centerY - planeOffset, // ← end centered
        });

        return points;
      };

      const points = calculateDesktopPath();

      if (points.length && airplaneRef.current) {
        gsap.set(airplaneRef.current, {
          x: points[0].x,
          y: points[0].y,
        });
      }

      let lastX = points[0]?.x || 0;
      let lastY = points[0]?.y || 0;

      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => "+=" + (track.scrollWidth - window.innerWidth),
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            setIsScrolling(self.isActive);
          },
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        },
      });

      // 1. Main track horizontal scroll (1.0x speed)
      mainTl.to(
        track,
        {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          duration: 1,
        },
        0,
      );

      // 2. Cloud parallax layer (0.4x speed) across the full track width
      if (cloudsRef.current) {
        mainTl.to(
          cloudsRef.current,
          {
            x: () => -(track.scrollWidth - window.innerWidth) * 0.4,
            ease: "none",
            duration: 1,
          },
          0,
        );
      }

      // 2b. WORK watermark drifts even slower (0.12x) so the whole section
      // reads as layered depth rather than a static background label.
      if (watermarkRef.current) {
        mainTl.to(
          watermarkRef.current,
          {
            x: () => -(track.scrollWidth - window.innerWidth) * 0.12,
            ease: "none",
            duration: 1,
          },
          0,
        );
      }

      // 3. Parallax shift inside each card screenshot
      const cardImages = Array.from(
        document.querySelectorAll<HTMLElement>(".card-image-parallax"),
      );
      cardImages.forEach((img) => {
        mainTl.fromTo(img, { x: 20 }, { x: -20, ease: "none", duration: 1 }, 0);
      });

      // 4. Airplane motion path (z-10, behind cards at z-20) synced to scroll
      if (airplaneRef.current && points.length) {
        mainTl.to(
          airplaneRef.current,
          {
            motionPath: {
              path: points,
              autoRotate: true,
              curviness: 1.2,
            },
            ease: "none",
            duration: 1,
            onUpdate: function () {
              if (!airplaneRef.current) return;
              const x = gsap.getProperty(airplaneRef.current, "x") as number;
              const y = gsap.getProperty(airplaneRef.current, "y") as number;
              const dist = Math.hypot(x - lastX, y - lastY);
              if (dist > 18) {
                trail.push({
                  x: x + planeOffset,
                  y: y + planeOffset,
                  timestamp: Date.now(),
                });
                lastX = x;
                lastY = y;
              }
            },
          },
          0,
        );
      }

      // 5. Tag chips stagger in as each card scrolls into view, tied to the
      // horizontal scroll position instead of vertical viewport entry.
      document
        .querySelectorAll<HTMLElement>(".featured-project-card")
        .forEach((card) => {
          const chips = card.querySelectorAll<HTMLElement>(".tag-chip");
          if (!chips.length) return;
          gsap.fromTo(
            chips,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.06,
              scrollTrigger: {
                containerAnimation: mainTl,
                trigger: card,
                start: "left 75%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
    });

    mm.add("(max-width: 1023px)", () => {
      document
        .querySelectorAll<HTMLElement>(".featured-project-row")
        .forEach((row) => {
          gsap.fromTo(
            row,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 75%",
              },
            },
          );
        });

      // Same tag stagger, but tied to normal vertical scroll on mobile.
      document
        .querySelectorAll<HTMLElement>(".featured-project-card")
        .forEach((card) => {
          const chips = card.querySelectorAll<HTMLElement>(".tag-chip");
          if (!chips.length) return;
          gsap.fromTo(
            chips,
            { opacity: 0, y: 8 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
              stagger: 0.06,
              scrollTrigger: {
                trigger: card,
                start: "top 75%",
              },
            },
          );
        });
    });

    // Debounced window resize handler (200ms)
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(renderTrail);
      mm.revert();
    };
  }, []);

  return (
    <section
      id="projects"
      ref={containerRef}
      style={{
        position: "relative",
        zIndex: 20,
        background: "#080808",
        overflow: "hidden",
      }}
      className="lg:h-screen lg:w-full"
    >
      {/* Watermark WORK (z-0) */}
      <span
        aria-hidden
        ref={watermarkRef}
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          fontSize: "clamp(120px, 20vw, 320px)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          color: "#FFFFFF",
          opacity: 0.03,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "var(--font-anton)",
          zIndex: 0,
          // willChange is set by GSAP automatically when the ScrollTrigger animation begins.
          // Declaring it statically on an element that only moves at 0.12x speed is wasteful.
        }}
      >
        WORK
      </span>

      {/* ── Horizontal Scroll Progress Indicator (desktop only) ──────────── */}
      {/* Visible only while the section is pinned / active */}
      <div
        aria-hidden
        className="hidden lg:flex"
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          opacity: isScrolling ? 1 : 0.35,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        {/* Track bar */}
        <div
          style={{
            width: 140,
            height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: "100%",
              width: "100%",
              transform: "scaleX(0)",
              transformOrigin: "left center",
              background: "var(--primary)",
              borderRadius: 9999,
              willChange: "transform",
            }}
          />
        </div>
      </div>

      {/* Track wrapper for Desktop horizontal scroll & Mobile vertical layout */}
      <div
        ref={trackRef}
        className="w-full lg:h-full lg:flex lg:items-center lg:px-20 lg:gap-16 lg:w-max py-28 lg:py-0 px-6 max-w-[1200px] lg:max-w-none mx-auto lg:mx-0 relative z-10"
        style={{ transform: "translateZ(0)", willChange: "transform" }}
      >
        {/* Technical Blueprint Coordinate Layer (z-5) */}
        <div
          ref={cloudsRef}
          className="hidden lg:block pointer-events-none absolute top-0 left-0 h-full z-5 overflow-hidden text-white/[0.08]"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          <CoordinateCross className="absolute top-[15%] left-[4%]" />
          <CoordinateCross className="absolute top-[68%] left-[13%]" />
          <CoordinateCross className="absolute top-[22%] left-[22%]" />
          <CoordinateCross className="absolute top-[75%] left-[31%]" />
          <CoordinateCross className="absolute top-[18%] left-[40%]" />
          <CoordinateCross className="absolute top-[65%] left-[49%]" />
          <CoordinateCross className="absolute top-[20%] left-[58%]" />
          <CoordinateCross className="absolute top-[72%] left-[67%]" />
          <CoordinateCross className="absolute top-[15%] left-[76%]" />
          <CoordinateCross className="absolute top-[66%] left-[85%]" />
          <CoordinateCross className="absolute top-[25%] left-[94%]" />
        </div>

        {/* Trail canvas overlay (z-10: behind cards at z-20) */}
        <canvas
          ref={canvasRef}
          className="hidden lg:block pointer-events-none absolute top-0 left-0 z-10"
        />

        {/* Airplane SVG (z-10: behind cards at z-20) */}
        <div
          ref={airplaneRef}
          className="hidden lg:block pointer-events-none absolute top-0 left-0 w-[120px] h-[120px] z-10"
        >
          <Image
            src="/images/pesawat.svg"
            alt="airplane"
            width={120}
            height={120}
            style={{ width: "100%", height: "100%" }}
            priority={false}
          />
        </div>

        {/* Header block (z-20) */}
        <div className="sec-inner mb-16 lg:mb-0 lg:flex-shrink-0 lg:w-[360px] lg:pr-8 relative z-20">
          <div className="sec-eyebrow flex items-center gap-4 mb-5 overflow-hidden">
            <span
              className="sec-eyebrow-text"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              {"// SELECTED WORK"}
            </span>
            <div
              className="sec-eyebrow-dash"
              style={{ background: "var(--primary)", width: 40 }}
            />
          </div>

          <h2 className="sec-title">
            <span className="clip-wrap block">
              <span
                className="clip-inner inline-block"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "var(--font-anton)",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  fontSize: "clamp(48px, 5vw, 72px)",
                }}
              >
                Selected
              </span>
            </span>
            <span className="clip-wrap block">
              <span
                className="clip-inner inline-block"
                style={{
                  color: "#94A3B8",
                  fontFamily: "var(--font-anton)",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  fontSize: "clamp(48px, 5vw, 72px)",
                }}
              >
                Projects.
              </span>
            </span>
          </h2>
        </div>

        {/* Projects cards list (z-20) */}
        <div className="flex flex-col gap-24 lg:flex-row lg:gap-20 lg:items-center relative z-20">
          {FEATURED_PROJECTS.map((proj) => {
            const isPortrait = proj.aspect === "portrait";
            return (
              <div
                key={proj.num}
                className="featured-project-row featured-project-card grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center bg-transparent p-0 lg:flex-shrink-0 lg:w-[920px]"
              >
                {/* Info column */}
                <div
                  className="flex flex-col justify-center lg:order-1 py-2"
                >
                  <div>
                    {/* Number sits as a large subtle sequence marker */}
                    <div className="relative mb-2 inline-block">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -left-1 -top-4 select-none text-4xl font-black leading-none text-white/[0.06] md:text-5xl"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        {proj.num}
                      </span>
                      {/* Structured project metadata badges */}
                      <div className="relative pt-2 flex flex-wrap items-center gap-2">
                        {proj.badge.split("·").map((segment, segIdx) => {
                          const tag = segment.trim();
                          const isLive = tag.toLowerCase() === "live";
                          return (
                            <span
                              key={segIdx}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                                isLive
                                  ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                  : "border border-[#27272A] bg-[#141414] text-white/90"
                              }`}
                              style={{ fontFamily: "var(--font-space-grotesk)" }}
                            >
                              {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />}
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="mb-4 leading-tight"
                      style={{
                        fontSize: "clamp(24px, 2.5vw, 32px)",
                        fontFamily: "var(--font-space-grotesk)",
                        fontWeight: 700,
                        color: "#FFFFFF",
                      }}
                    >
                      {proj.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="mb-6 whitespace-pre-line text-sm leading-[1.75]"
                      style={{ fontFamily: "var(--font-jakarta)", color: "rgba(255,255,255,0.85)" }}
                    >
                      {proj.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {proj.tags.map((tag) => (
                        <Chip key={tag}>{tag}</Chip>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white/90 transition-colors hover:text-primary-hover uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        Visit website ↗
                      </a>
                    )}
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-white/70 transition-colors hover:text-white uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                      >
                        GitHub repository ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Photo column — Tactile dark industrial card frame with zero fuzzy shadow */}
                <div className="flex items-center justify-center lg:order-2 w-full">
                  <div
                    className={`group relative w-full ${
                      isPortrait
                        ? "max-w-[260px] aspect-[3/4]"
                        : "max-w-[480px] aspect-[4/3]"
                    } rounded-xl border border-[#27272A] bg-[#121214] p-2.5 transition-transform duration-300 ease-out ${proj.rotation} hover:rotate-0 hover:border-[#3F3F46]`}
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#080808]">
                      <Image
                        src={proj.screenshot}
                        alt={proj.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 480px"
                        priority={false}
                        quality={85}
                        className="card-image-parallax object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Archive section (z-20) */}
        <div
          className="mt-20 lg:mt-0 pt-12 lg:pt-0 lg:pl-12 lg:border-l lg:border-[#27272A] border-t border-[#27272A] lg:border-t-0 lg:flex-shrink-0 lg:w-[420px] relative z-20"
        >
          <span
            className="mb-5 block text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ fontFamily: "var(--font-space-grotesk)", color: "#A1A1AA" }}
          >
            {"// Also built"}
          </span>

          <div className="flex flex-col">
            {ARCHIVE_PROJECTS.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 border-b border-[#27272A] py-4 first:pt-0 last:border-b-0"
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[#27272A] bg-[#141414] text-base font-bold text-primary transition-colors group-hover:border-primary"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {item.title.charAt(0)}
                </span>
                <span className="flex flex-1 flex-col gap-1 pt-0.5">
                  <span
                    className="flex items-center justify-between text-base font-bold text-[#FFFFFF]"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {item.title}
                    <span className="text-sm font-semibold text-[#94A3B8] transition-colors group-hover:text-primary-hover">
                      ↗
                    </span>
                  </span>
                  <span
                    className="text-xs leading-relaxed text-[#94A3B8]"
                    style={{ fontFamily: "var(--font-jakarta)" }}
                  >
                    {item.desc}
                  </span>
                  <span
                    className="text-[11px] font-medium text-[#71717A] transition-colors group-hover:text-primary-hover"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {item.label}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
