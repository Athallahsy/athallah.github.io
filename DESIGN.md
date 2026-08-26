---
name: Athallah Muhammad Syaffa Portfolio
description: Dark Industrial & 3D Interactive Fullstack Developer Portfolio
colors:
  primary: "#7DD3FC"
  primary-cyan: "#38BDF8"
  secondary-green: "#10B981"
  neutral-bg: "#080808"
  neutral-card: "#121212"
  text-primary: "#FFFFFF"
  text-muted: "#94A3B8"
  border: "#27272A"
typography:
  display:
    fontFamily: "Anton, sans-serif"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
components:
  button-primary:
    backgroundColor: "#FFFFFF"
    textColor: "#080808"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card-default:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Athallah Muhammad Syaffa Portfolio

## Overview

**Creative North Star: "The Dark Industrial Tech Workshop"**

A high-tech, dark mode portfolio featuring heavy industrial typography, high-contrast dark surfaces, and vibrant ice blue accents. The visual identity emphasizes raw engineering power and interactive 3D physics (R3F Rapier lanyard, GSAP scroll triggers, particles canvas), pairing heavy uppercase titles (`Anton`) with geometric subheadings (`Space Grotesk`) and readable body text (`Plus Jakarta Sans`).

**Key Characteristics:**
- Pitch-black canvas (`#080808`) with subtle dark surface card containers (`#121212`).
- Ice Blue (`#7DD3FC` / `#38BDF8`) as the main interactive highlight and focus accent.
- Heavy industrial typography using `Anton` uppercase display serif/sans alongside `Space Grotesk` headings.
- Interactive 3D Rapier physics lanyard, GSAP horizontal scroll pinning, and particle canvas overlays.

## Colors

High-contrast dark-mode palette designed for modern technical portfolios.

### Primary
- **Ice Blue** (`#7DD3FC`): Primary interactive highlight, active tab indicators, and link hovers.
- **Electric Cyan** (`#38BDF8`): Secondary CTA glows, particle highlights, and active borders.

### Secondary
- **Pulsing Emerald Green** (`#10B981`): Status badge ("Open to Work") and live availability indicators.
- **Muted Gold** (`#B8924E`): Rare secondary badge accents and decorative dividers.

### Neutral
- **Pitch Black Canvas** (`#080808`): Global background canvas.
- **Surface Dark Card** (`#121212` / `#171717`): Elevated content cards, code blocks, and container backgrounds.
- **Pure Crisp White** (`#FFFFFF`): Primary body text, main titles, and high-contrast buttons.
- **Muted Slate Gray** (`#94A3B8` / `#A1A1AA`): Metadata, subtitles, tech stack tags, and secondary descriptions.
- **Dark Border Stroke** (`#27272A` / `rgba(255, 255, 255, 0.1)`): Card borders and structural dividers.

### Named Rules
**The Ice Blue Focal Rule.** Ice Blue (`#7DD3FC`) is reserved for high-value interactive nodes, active links, and hover states.

## Typography

**Display Font:** `Anton` (400, heavy uppercase sans-serif for main titles and hero statements)
**Subheading Font:** `Space Grotesk` (500–700, geometric sans-serif for section titles and card headings)
**Body Font:** `Plus Jakarta Sans` (300–600, clean sans-serif for body copy and metadata)

### Hierarchy
- **Display Hero** (`Anton`, weight 400, size 3rem to 6rem, uppercase): Large hero name and impactful section markers.
- **Headline** (`Space Grotesk`, weight 600, clamp(1.8rem, 4vw, 2.5rem)): Section titles and primary headers.
- **Title / Subheading** (`Space Grotesk`, weight 500, 1.25rem): Card headings, project titles, and skill categories.
- **Body** (`Plus Jakarta Sans`, weight 400, 1rem, line-height 1.6): Main bio, project descriptions, and general text.
- **Label / Tag** (`Plus Jakarta Sans` or `Space Grotesk`, weight 500, 0.875rem, uppercase): Tech stack tags and status pills.

## Layout

- **Container Max Width:** 1280px centered max-width container.
- **Responsive Breakpoint:** 900px (stacks from 2-column layout to single-column layout).
- **Interactive Pinning:** Desktop horizontal scroll pinning (`pin: true`) on the Projects section.

## Elevation & Depth

Dark surface layering with translucent borders and 3D canvas depth.
- Cards use dark surface backgrounds (`#121212`) with subtle 1px translucent borders (`rgba(255, 255, 255, 0.1)`).
- Depth is expressed via interactive 3D elements (Rapier 3D lanyard) and hover transformations.

## Shapes

- **Badges & Status Pills:** Pill shape (`border-radius: 9999px`) with pulsing green dot.
- **Project Cards:** Rounded corners (`border-radius: 16px`) with 1px border.
- **Buttons:** Rectangular with soft corners (`border-radius: 8px` to `12px`).

## Components

### Primary Button
- **Shape:** Soft rounded rectangle (`border-radius: 12px` or `8px`).
- **Primary:** Background `#FFFFFF`, text `#080808`, padding `12px 24px`, font-weight `600`.
- **Hover / Focus:** Scale transform `1.02`, background `#7DD3FC`.

### Status Badge ("Open to Work")
- **Style:** Background `rgba(16, 185, 129, 0.1)`, border `1px solid rgba(16, 185, 129, 0.3)`, text `#34D399`, padding `6px 14px`, rounded full.
- **Pulsing Dot:** `#10B981` dot with keyframe pulse animation.

### Project Cards
- **Corner Style:** `16px` rounded corners.
- **Background:** `#121212` / `#171717`.
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`.
- **Padding:** `24px` to `32px`.

## Do's and Don'ts

### Do:
- **Do** use `Anton` for hero titles and major section callouts.
- **Do** maintain high contrast between text (`#FFFFFF` / `#94A3B8`) and dark canvas (`#080808`).
- **Do** ensure 3D Rapier lanyard canvas gracefully adapts or falls back on mobile viewports.

### Don't:
- **Don't** mix warm off-white backgrounds with the pitch-black `#080808` canvas.
- **Don't** use low contrast dark gray text on dark backgrounds.
- **Don't** remove fallback loaders for WebGL 3D canvas components.
