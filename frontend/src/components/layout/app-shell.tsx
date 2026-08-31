"use client";

import { usePathname } from "next/navigation";

import { RevealObserver } from "@/components/reveal-observer";

export function AppShell({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();

  // The admin area has its own chrome (see app/admin/layout.tsx).
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-riva-gold focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-riva-black"
      >
        Hoppa till innehåll
      </a>
      {header}
      <main id="main-content" className="flex-1 overflow-x-hidden">
        {children}
      </main>
      {footer}
      <RevealObserver />
    </>
  );
}
