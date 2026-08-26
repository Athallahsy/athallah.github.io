"use client";

import { useState } from "react";
import Splash from "@/components/Splash";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TechStackStrip from "@/components/TechStackStrip";
import LanyardSection from "@/components/LanyardSection";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import FooterContact from "@/components/FooterContact";

/**
 * SplashGate — Client Component.
 *
 * Satu-satunya alasan komponen ini butuh "use client" adalah karena
 * menggunakan useState untuk melacak apakah splash screen sudah selesai.
 * Dengan memindahkan logika ini ke sini, page.tsx dapat tetap menjadi
 * Server Component murni.
 */
export default function SplashGate() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && <Splash onComplete={() => setSplashDone(true)} />}
      <main style={{ position: "relative", isolation: "isolate" }}>
        <Nav />
        <Hero />
        <TechStackStrip />
        <LanyardSection />
        <Skills />
        <Projects />
        <FooterContact />
      </main>
    </>
  );
}
