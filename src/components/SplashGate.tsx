"use client";

import { useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Splash from "@/components/Splash";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

const TechStackStrip = dynamic(() => import("@/components/TechStackStrip"));
const LanyardSection = dynamic(() => import("@/components/LanyardSection"));
const Skills = dynamic(() => import("@/components/Skills"));
const Projects = dynamic(() => import("@/components/Projects"));
const FooterContact = dynamic(() => import("@/components/FooterContact"));

const emptySubscribe = () => () => {};

export default function SplashGate() {
  const [splashDone, setSplashDone] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <>
      {isMounted && !splashDone && (
        <Splash onComplete={() => setSplashDone(true)} />
      )}
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
