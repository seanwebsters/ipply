import type { Metadata, Viewport } from "next";
import { Inter_Tight, Instrument_Serif } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Instrument_Serif({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: "IPPLY — The World's Studio", template: "%s · IPPLY" },
  description:
    "IPPLY is an open-access entertainment studio. Anyone, anywhere, can create original characters, stories and worlds, find an audience and take them further than ever imagined.",
  openGraph: {
    title: "IPPLY — The World's Studio",
    description: "Created by anyone. Loved by everyone.",
    siteName: "IPPLY",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0B0B0F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
