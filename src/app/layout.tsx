import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "Work Tracker AI | L’AI che mette ordine nel tuo lavoro",
  description: "Trasforma note, chiamate e verbali in azioni concrete. Da note disordinate a piani d'azione professionali in pochi secondi con l'ausilio dell'Intelligenza Artificiale.",
  manifest: "/manifest.json",
  keywords: ["AI work tracker", "legal assistant AI", "gestione note AI", "productivity AI", "Work Tracker AI"],
  openGraph: {
    title: "Work Tracker AI",
    description: "L'AI che mette ordine nel tuo lavoro quotidiano.",
    images: ["/hero-bg.png"],
  },
  other: {
    "bt-ai-optimized": "true",
    "ai-agent-ready": "true"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tracker AI",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  }
};

export const viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { Layout } from "@/components/Layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ConvexClientProvider>
          <Layout>
            {children}
          </Layout>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
