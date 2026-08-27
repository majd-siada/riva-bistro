"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/contexts/cart-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-riva-gold focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-riva-black"
      >
        Hoppa till innehåll
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </CartProvider>
  );
}
