import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import localFont from "next/font/local";

import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RestaurantJsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

/** Non-critical consent UI — separate client chunk from the root shell. */
const CookieNotice = dynamic(() =>
  import("@/components/brand/cookie-notice").then((mod) => ({
    default: mod.CookieNotice,
  })),
);

const display = localFont({
  variable: "--font-display",
  src: "./fonts/PlayfairDisplay.woff2",
  weight: "400 700",
  display: "swap",
});

const sans = localFont({
  variable: "--font-sans",
  src: "./fonts/DMSans.woff2",
  weight: "400 700",
  display: "swap",
});

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Goda smaker, äkta upplevelser`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Canonicals are set per page via createPageMetadata — do not pin all routes to "/".
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Goda smaker, äkta upplevelser`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Riva Bistro — grillad entrecôte på mörk tallrik, varm studioljus",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Goda smaker, äkta upplevelser`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#050404",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${display.variable} ${sans.variable} flex min-h-screen flex-col bg-riva-black font-sans text-riva-cream`}
      >
        <AppShell header={<Header />} footer={<Footer />}>
          {children}
        </AppShell>
        <RestaurantJsonLd />
        <CookieNotice />
        <Toaster />
      </body>
    </html>
  );
}
