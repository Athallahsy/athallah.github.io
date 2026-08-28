import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Anton } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://athallahsy.vercel.app"),
  title: "Athallah Muhammad Syaffa — Fullstack Developer",
  description:
    "Portfolio of Athallah Muhammad Syaffa, a Fullstack Developer specializing in Laravel & React. Explore my projects and skills.",
  keywords: [
    "Athallah Muhammad Syaffa",
    "Fullstack Developer",
    "Laravel",
    "React",
    "Next.js",
    "Portfolio",
    "Web Developer Indonesia",
    "PHP Developer",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Athallah Muhammad Syaffa — Fullstack Developer",
    description:
      "Portfolio of Athallah Muhammad Syaffa, a Fullstack Developer specializing in Laravel & React. Explore my projects and skills.",
    url: "https://athallahsy.vercel.app",
    siteName: "Athallah Muhammad Syaffa",
    images: [
      {
        url: "/images/profile.png",
        width: 1200,
        height: 630,
        alt: "Athallah Muhammad Syaffa",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athallah Muhammad Syaffa — Fullstack Developer",
    description:
      "Portfolio of Athallah Muhammad Syaffa, a Fullstack Developer specializing in Laravel & React. Explore my projects and skills.",
    images: ["/images/profile.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${anton.variable} h-full antialiased overflow-x-hidden`}
      style={{ scrollBehavior: "auto" }}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-[#080808]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
