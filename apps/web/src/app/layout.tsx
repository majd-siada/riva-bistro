import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RestaurantJsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

// Self-hosted (variable) fonts — no build-time or runtime network dependency.
const display = localFont({
  variable: "--font-display",
  src: "./fonts/CormorantGaramond.woff2",
  weight: "400 700",
  display: "swap",
});

const sans = localFont({
  variable: "--font-sans",
  src: "./fonts/SourceSans3.woff2",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Premium svensk gastronomi i Stockholm`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium svensk gastronomi i Stockholm`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      { url: "/og-image.jpg", width: 1200, height: 630, alt: "Riva Bistro" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Premium svensk gastronomi i Stockholm`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f2e9",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className={`${display.variable} ${sans.variable} min-h-screen font-sans`}>
        <AppShell header={<Header />} footer={<Footer />}>
          {children}
        </AppShell>
        <RestaurantJsonLd />
        <Toaster />
      </body>
    </html>
  );
}
