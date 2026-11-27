import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { env } from "@/lib/env";
import "./globals.css";

/* Admin UI typeface. */
const sans = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

/* Public site: Space Grotesk headings, Source Serif 4 body, JetBrains Mono labels. */
const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/* Geist Pixel (Square) by Vercel, SIL Open Font License 1.1 — see app/fonts/GeistPixel-OFL.txt. */
const pixel = localFont({
  src: "./fonts/GeistPixel-Square.woff2",
  variable: "--font-geist-pixel",
  weight: "400",
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0d0c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The public site sets data-theme before first paint (see app/(site)/layout.tsx).
      suppressHydrationWarning
      className={`dark ${sans.variable} ${display.variable} ${serif.variable} ${pixel.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-base text-ink">{children}</body>
    </html>
  );
}
