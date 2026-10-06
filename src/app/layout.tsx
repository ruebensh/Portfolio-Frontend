import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { GlobalVideoBackground } from "@/components/ui/GlobalVideoBackground";
import { GlobalPreloader } from "@/components/ui/GlobalPreloader";
import { MobileScrollProgress } from "@/components/ui/MobileScrollProgress";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Jaloliddin Xalimov — AI/ML Student & Python Developer",
  description: "Jaloliddin Xalimovning shaxsiy portfoliosi va 3D raqamli taqdimoti.",
};

// Google knowledge graph uchun: shaxs ↔ TopHand entity bog'lanishi (teskari havola).
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jaloliddin Xalimov",
  "alternateName": ["Жалолиддин Халимов", "Jaloliddin Khalimov"],
  "jobTitle": "Co-Founder & Co-CEO",
  "url": "https://jaloliddin-xalimov.uz",
  "sameAs": [
    "https://tophand.uz",
    "https://github.com/ruebensh",
    "https://xalimov.vercel.app",
  ],
  "worksFor": { "@type": "Organization", "name": "TopHand", "url": "https://tophand.uz" },
  "description":
    "TopHand — O'zbekistondagi ko'p tarmoqli onlayn bozorni yaratgan jamoa a'zosi (Co-Founder & Co-CEO).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased text-foreground transition-colors duration-300 min-h-screen flex flex-col justify-between" style={{ backgroundColor: "#050505" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {/* Global fixed video background — sits behind ALL content */}
        <GlobalVideoBackground />
        <GlobalPreloader />
        <MobileScrollProgress />
        <ThemeProvider>
          <LanguageProvider>
            <SmoothScrollProvider>
              <Navbar />
              <div className="flex-1 relative z-10">{children}</div>
              <Footer />
            </SmoothScrollProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}