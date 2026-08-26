"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface ScrollRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({
  text,
  className,
  style,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll(".char-span");
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { color: "#3F3F46" },
        {
          color: "#FFFFFF",
          stagger: 0.015,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            end: "bottom 65%",
            scrub: true,
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, [text]);

  const words = text.split(" ");

  return (
    <p
      ref={containerRef}
      className={className}
      style={{
        display: "inline-block",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {words.map((word, wordIdx) => (
        <span
          key={wordIdx}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
          }}
        >
          {word.split("").map((char, charIdx) => (
            <span
              key={charIdx}
              className="char-span"
              style={{
                color: "#3F3F46",
                willChange: "color",
                display: "inline-block",
              }}
            >
              {char}
            </span>
          ))}
          {wordIdx < words.length - 1 && (
            <span style={{ display: "inline-block", whiteSpace: "pre" }}>
              {" "}
            </span>
          )}
        </span>
      ))}
    </p>
  );
}
